const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');

// Function to generate RSS feed
async function generateRSSFeed(blogPosts) {
    const websiteUrl = 'https://paulsava.github.io';
    const feedUrl = `${websiteUrl}/feed.xml`;
    
    const rssItems = blogPosts.map(post => {
        const postUrl = `${websiteUrl}/blog/${post.file.replace('.md', '.html')}`;
        // Use the description from metadata, or fall back to a truncated content
        const description = post.metadata.description || post.content.split('\n').slice(0, 3).join('\n');
        
        return `
        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${postUrl}</link>
            <guid>${postUrl}</guid>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            <description>${escapeXml(description)}</description>
        </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Paul Sava's Blog</title>
        <link>${websiteUrl}</link>
        <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
        <description>Paul Sava's personal blog</description>
        <language>en-us</language>
        ${rssItems}
    </channel>
</rss>`;

    await fs.writeFile('./public/feed.xml', rss);
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

async function buildSite() {
    console.log('Starting build...');
    
    // Ensure directories exist
    await fs.mkdir('./public', { recursive: true });
    await fs.mkdir('./public/blog', { recursive: true });
    
    // Copy static files (only assets, not HTML)
    const staticFiles = [
        'styles.css',
        'Profile.png',
        'assets/favicon/apple-touch-icon.png',
        'assets/favicon/favicon-32x32.png',
        'assets/favicon/favicon-16x16.png',
        'assets/favicon/android-chrome-192x192.png',
        'assets/favicon/android-chrome-512x512.png',
        'assets/favicon/site.webmanifest'
    ];

    for (const file of staticFiles) {
        try {
            // Create directory if it doesn't exist
            const dir = path.dirname(`./public/${file}`);
            await fs.mkdir(dir, { recursive: true });
            // Copy file
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

    // Generate RSS feed
    await generateRSSFeed(blogPosts);

    // Common header template
    const headerTemplate = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">`;

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
    ${headerTemplate}
    <title>Blog - Paul Sava</title>
    <link rel="alternate" type="application/rss+xml" title="Paul Sava's Blog" href="/feed.xml">
    <style>
        .blog-entry {
            position: relative;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .blog-entry:hover {
            border-color: var(--text-color);
            transform: translateX(4px);
        }
        .blog-entry a {
            text-decoration: none;
        }
        .blog-entry::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
        }
        .blog-entry h2 {
            margin-top: 0;
            color: var(--text-color);
        }
        .blog-date {
            color: var(--secondary-text-color);
            margin-bottom: 0.5rem;
        }
        .blog-link {
            display: none;
        }
    </style>
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
        <div class="title-section">
            <h1>Blog Posts</h1>
            <a href="/feed.xml" class="rss-link">[ rss feed ]</a>
        </div>
        
        ${blogPosts.length === 0 ? 
            `<div class="empty-message">No blog posts yet.</div>` :
            blogPosts.map(post => `
            <a href="blog/${post.file.replace('.md', '.html')}">
                <div class="blog-entry">
                    <h2>${post.title}</h2>
                    <div class="blog-date">${post.date}</div>
                </div>
            </a>
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
    ${headerTemplate.replace('href="styles.css"', 'href="../styles.css"')}
    <title>${post.title} - Paul Sava</title>
    <link rel="alternate" type="application/rss+xml" title="Paul Sava's Blog" href="/feed.xml">
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
    ${headerTemplate}
    <title>Publications - Paul Sava</title>
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
    ${headerTemplate}
    <title>Projects - Paul Sava</title>
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

    // Generate index page
    const indexTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    ${headerTemplate}
    <title>Paul Sava - AI Security Researcher at Fraunhofer AISEC</title>
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png">
    <link rel="manifest" href="assets/favicon/site.webmanifest">
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="Paul Sava - AI Security Researcher">
    <meta name="description" content="AI Security Researcher at Fraunhofer AISEC, focusing on LLM security, autonomous AI agents, and private machine learning. PhD candidate at TUM.">
    <meta name="keywords" content="AI Security, Machine Learning, LLM Security, Privacy, TUM, Fraunhofer AISEC, Paul Sava, Research">
    <meta name="author" content="Paul Sava">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://paulsava.github.io/">
    <meta property="og:title" content="Paul Sava - AI Security Researcher">
    <meta property="og:description" content="AI Security Researcher at Fraunhofer AISEC, focusing on LLM security, autonomous AI agents, and private machine learning. PhD candidate at TUM.">
    <meta property="og:image" content="https://paulsava.github.io/Profile.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://paulsava.github.io/">
    <meta property="twitter:title" content="Paul Sava - AI Security Researcher">
    <meta property="twitter:description" content="AI Security Researcher at Fraunhofer AISEC, focusing on LLM security, autonomous AI agents, and private machine learning. PhD candidate at TUM.">
    <meta property="twitter:image" content="https://paulsava.github.io/Profile.png">
</head>
<body>
    <script type="application/ld+json">
    {
        "@context": "http://schema.org",
        "@type": "Person",
        "name": "Paul Sava",
        "jobTitle": "AI Security Researcher",
        "affiliation": {
            "@type": "Organization",
            "name": "Fraunhofer AISEC"
        },
        "alumniOf": {
            "@type": "Organization",
            "name": "Technical University of Munich"
        },
        "description": "AI Security Researcher focusing on LLM security, autonomous AI agents, and private machine learning",
        "url": "https://paulsava.github.io"
    }
    </script>

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
        <section id="intro">
            <p>Hey there! I'm Paul, and you've just stumbled upon my little corner of the internet.</p>
            <p>This site isn't trying to win any design awards - it's just a simple space where I share my work, thoughts, and the things that keep me busy.</p>
        </section>

        <section id="what-i-do">
            <h2>What I Do</h2>
            <p>Right now, I'm diving deep into AI research at <a href="https://www.aisec.fraunhofer.de/">Fraunhofer AISEC</a> while working on my PhD at <a href="https://www.tum.de/">TUM</a> with <a href="https://www.sec.in.tum.de/i20/people/claudia-eckert">Prof. Dr. Claudia Eckert</a>. I spend most of my time thinking about:</p>
            <ul>
                <li>→ Making large language models more secure (and figuring out when they're not)</li>
                <li>→ Teaching AI agents to be autonomous (but not too autonomous)</li>
                <li>→ Keeping machine learning private (because some secrets are worth keeping)</li>
                <li>→ Finding ways to break AI systems (so we can make them stronger)</li>
            </ul>
        </section>

        <section id="background">
            <h2>My Background</h2>
            <p>I spent my university years at TUM, getting both my Bachelor's and Master's there. While my main focus was on ML and AI Security, I also dove into High Performance and Quantum Computing. I started at Fraunhofer AISEC as a student assistant in 2021, and after finishing my Master's in 2024, I joined the team full-time.</p>
        </section>

        <section id="beyond">
            <h2>Beyond the Code</h2>
            <p>When I'm not doing research, I like to mess around with coffee brewing. It's become a bit of a hobby - trying different beans, tweaking recipes, that kind of thing. Maybe I'll open a small coffee shop someday, who knows.</p>
            <p>Got a few projects I want to get into - building an aeroponic setup, getting into woodworking, and playing around with 3D printing. Also picked up crocheting recently, which is surprisingly chill.</p>
            <p>In my downtime, I dig through obscure movie collections and hunt for underground music. Always fun to find something different that most people haven't heard of.</p>
        </section>
    </main>

    ${footerTemplate}
</body>
</html>`;

    await fs.writeFile('./public/index.html', indexTemplate);

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