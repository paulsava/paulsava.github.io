const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');

async function buildSite() {
    console.log('Starting build...');
    
    // Ensure directories exist
    await fs.mkdir('./public', { recursive: true });
    await fs.mkdir('./public/blog', { recursive: true });
    
    // Copy static files
    const staticFiles = [
        'index.html',
        'publications.html',
        'projects.html',
        'styles.css',
        'Profile.png'
    ];

    for (const file of staticFiles) {
        try {
            await fs.copyFile(`./src/${file}`, `./public/${file}`);
        } catch (err) {
            console.log(`Warning: Could not copy ${file}: ${err.message}`);
        }
    }

    console.log('Reading blog files...');
    const blogFiles = await fs.readdir('./src/blog');
    console.log('Found blog files:', blogFiles);
    
    const blogPosts = [];
    
    for (const file of blogFiles) {
        if (file.endsWith('.md') && file !== 'template.md') {
            console.log('Processing blog post:', file);
            const content = await fs.readFile(`./src/blog/${file}`, 'utf-8');
            const { content: parsedContent, metadata } = parseFrontmatter(content);
            blogPosts.push({
                file,
                title: metadata.title,
                date: metadata.date,
                content: parsedContent,
                metadata
            });
        }
    }
    
    console.log('Processed blog posts:', blogPosts);

    // Sort by date
    blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Common footer template
    const footerTemplate = `
    <footer>
        <p>© 2024 Paul Sava · <a href="mailto:mail@paulsava.com">email</a> ·
            <a href="https://github.com/paulsava" title="GitHub Profile" aria-label="Visit my GitHub profile">GitHub</a> ·
            <a href="https://scholar.google.com/citations?user=a2-nX-kAAAAJ" title="Google Scholar Profile" aria-label="View my publications on Google Scholar">Google Scholar</a> 
        </p>
        <p class="footer-credit">Design inspired by <a href="https://owickstrom.github.io/the-monospace-web/">The Monospace Web</a></p>
    </footer>`;

    // Blog listing template
    const blogTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - Paul Sava</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="profile-section">
                <img src="Profile.png" alt="Paul Sava" class="profile">
                <h1>PAUL SAVA</h1>
            </div>
            <div class="header-text">
                <p>i am a social vegan. i avoid meet.</p>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="publications.html">Publications</a>
                    <a href="projects.html">Projects</a>
                    <a href="blog.html">Blog</a>
                </nav>
            </div>
        </div>
    </header>
    <main>
        <h1>Blog Posts</h1>
        
        ${blogPosts.length === 0 ? 
            `<div class="empty-message">No blog posts yet.</div>` :
            blogPosts.map(post => `
            <div class="blog-entry">
                <h2>${post.title}</h2>
                <div class="blog-date">${post.date}</div>
                <div class="blog-link">
                    <a href="blog/${post.file.replace('.md', '.html')}">[ read more ]</a>
                </div>
            </div>
            `).join('\n')
        }
    </main>
    ${footerTemplate}
    <script>
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.textContent = newTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = 
        savedTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
    </script>
</body>
</html>`;

    await fs.writeFile('./public/blog.html', blogTemplate);

    // Process each blog post
    for (let i = 0; i < blogPosts.length; i++) {
        const post = blogPosts[i];
        const prevPost = blogPosts[i + 1];
        const nextPost = blogPosts[i - 1];
        
        console.log('Building blog post:', post.file);
        const html = marked.parse(post.content);
        const postTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - Paul Sava</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="profile-section">
                <img src="../Profile.png" alt="Paul Sava" class="profile">
                <h1>PAUL SAVA</h1>
            </div>
            <div class="header-text">
                <p>i am a social vegan. i avoid meet.</p>
                <nav>
                    <a href="../index.html">Home</a>
                    <a href="../publications.html">Publications</a>
                    <a href="../projects.html">Projects</a>
                    <a href="../blog.html">Blog</a>
                </nav>
            </div>
        </div>
    </header>
    <main>
        <div class="blog-container">
            <div class="nav-row">
                <a href="../blog.html" class="nav-button">[ ← back ]</a>
            </div>

            <h1>${post.title}</h1>
            <div class="blog-date">${post.date}</div>

            <hr class="separator" />

            <article class="blog-post">
                ${html}
            </article>
        </div>
    </main>
    ${footerTemplate}
    <script>
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.textContent = newTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = 
        savedTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
    </script>
</body>
</html>`;

        await fs.writeFile(`./public/blog/${post.file.replace('.md', '.html')}`, postTemplate);
    }
    
    console.log('Reading publication files...');
    const publicationFiles = await fs.readdir('./src/publications');
    console.log('Found publication files:', publicationFiles);

    const publications = [];

    for (const file of publicationFiles) {
        if (file.endsWith('.md') && file !== 'template.md') {
            console.log('Processing publication:', file);
            const content = await fs.readFile(`./src/publications/${file}`, 'utf-8');
            const { content: abstract, metadata } = parseFrontmatter(content);
            publications.push({
                ...metadata,
                abstract: abstract.trim()
            });
        }
    }

    // Sort by date
    publications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Publications template
    const publicationsTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publications - Paul Sava</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="profile-section">
                <img src="Profile.png" alt="Paul Sava" class="profile">
                <h1>PAUL SAVA</h1>
            </div>
            <div class="header-text">
                <p>i am a social vegan. i avoid meet.</p>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="publications.html">Publications</a>
                    <a href="projects.html">Projects</a>
                    <a href="blog.html">Blog</a>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <h1>Publications</h1>

        ${publications.length === 0 ? 
            `<div class="empty-message">No publications yet.</div>` :
            publications.map(pub => `
            <div class="publication">
                <h2>${pub.title}</h2>
                <div class="venue">${pub.venue}</div>
                <div class="authors">${pub.authors}</div>
                <div class="controls">
                    ${pub.pdf ? `<a href="${pub.pdf}" class="pdf-button">[PDF]</a>` : ''}
                </div>
            </div>
            `).join('\n')
        }
    </main>
    ${footerTemplate}
    <script>
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.textContent = newTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = 
        savedTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
    </script>
</body>
</html>`;

    await fs.writeFile('./public/publications.html', publicationsTemplate);

    // Process projects
    console.log('Reading project files...');
    const projectFiles = await fs.readdir('./src/projects');
    console.log('Found project files:', projectFiles);

    const projects = [];

    for (const file of projectFiles) {
        if (file.endsWith('.md') && file !== 'template.md') {
            console.log('Processing project:', file);
            const content = await fs.readFile(`./src/projects/${file}`, 'utf-8');
            const { content: description, metadata } = parseFrontmatter(content);
            projects.push({
                ...metadata,
                description: description.trim()
            });
        }
    }

    // Sort by date
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create projects page
    const projectsTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects - Paul Sava</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="profile-section">
                <img src="Profile.png" alt="Paul Sava" class="profile">
                <h1>PAUL SAVA</h1>
            </div>
            <div class="header-text">
                <p>i am a social vegan. i avoid meet.</p>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="publications.html">Publications</a>
                    <a href="projects.html">Projects</a>
                    <a href="blog.html">Blog</a>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <h1>Projects</h1>

        ${projects.length === 0 ? 
            `<div class="empty-message">No projects yet.</div>` :
            projects.map(proj => `
            <div class="project">
                <h2>${proj.title}</h2>
                <div class="project-meta">
                    <span class="status">${proj.status}</span>
                    <a href="${proj.github}" class="github-link">[ github ]</a>
                </div>
                <div class="description">
                    ${marked.parse(proj.description)}
                </div>
            </div>
            `).join('\n')
        }
    </main>
    ${footerTemplate}
    <script>
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.textContent = newTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = 
        savedTheme === 'dark' ? '[ ■ dark mode ]' : '[ □ dark mode ]';
    </script>
</body>
</html>`;

    await fs.writeFile('./public/projects.html', projectsTemplate);

    console.log('Build complete!');
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { content, metadata: {} };
    
    const frontmatter = match[1];
    const metadata = {};
    frontmatter.split('\n').forEach(line => {
        const [key, value] = line.split(': ').map(str => str.replace(/^["']|["']$/g, ''));
        if (key && value) metadata[key] = value;
    });
    
    const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    return { content: contentWithoutFrontmatter, metadata };
}

buildSite().catch(console.error); 