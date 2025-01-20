const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const readingTime = require('reading-time');

// Function to generate RSS feed
async function generateRSSFeed(blogPosts) {
    const websiteUrl = 'https://paulsava.github.io';
    const feedUrl = `${websiteUrl}/feed.xml`;
    
    const rssItems = blogPosts.map(post => {
        const postUrl = `${websiteUrl}/blog/${post.file.replace('.md', '.html')}`;
        const description = post.content.split('\n').slice(0, 3).join('\n'); // First 3 lines as description
        
        return `
        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${postUrl}</link>
            <guid>${postUrl}</guid>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            <description>${escapeXml(marked.parse(description))}</description>
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
        'assets/favicon/site.webmanifest',
        'impressum.html',
        'impressum-de.html',
        'privacy.html',
        'datenschutz.html',
        'index.html'
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
            const stats = readingTime(parsedContent);
            blogPosts.push({
                file,
                title: metadata.title,
                date: metadata.date,
                content: parsedContent,
                readingTime: Math.ceil(stats.minutes),
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
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Umami Analytics (Privacy-friendly) -->
    <script defer src="https://cloud.umami.is/script.js" data-website-id="85fb5f51-451a-4b90-8f07-63d7d37a8014"></script>`;

    // Common header structure template
    const headerStructureTemplate = `
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
    </header>`;

    // Blog post header structure template (with relative paths)
    const blogPostHeaderTemplate = `
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
    </header>`;

    // Common footer template (English)
    const footerTemplate = `
    <footer>
        <p><a href="mailto:mail@paulsava.com" title="Email" aria-label="Send me an email"><i class="fas fa-envelope"></i></a> · 
           <a href="https://github.com/paulsava" title="GitHub" aria-label="Visit my GitHub profile"><i class="fab fa-github"></i></a> · 
           <a href="https://twitter.com/_psava" title="X (Twitter)" aria-label="Follow me on X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a> · 
           <a href="https://scholar.google.com/citations?user=a2-nX-kAAAAJ" title="Google Scholar" aria-label="View my publications on Google Scholar"><i class="fas fa-graduation-cap"></i></a> · 
           <a href="impressum.html">Impressum</a> · 
           <a href="privacy.html">Privacy Policy</a></p>
        <p>© 2024 Paul Sava · Design inspired by <a href="https://owickstrom.github.io/the-monospace-web/">The Monospace Web</a></p>
    </footer>`;

    // German footer template
    const footerTemplateDE = `
    <footer>
        <p><a href="mailto:mail@paulsava.com" title="E-Mail" aria-label="Schreiben Sie mir eine E-Mail"><i class="fas fa-envelope"></i></a> · 
           <a href="https://github.com/paulsava" title="GitHub" aria-label="Besuchen Sie mein GitHub-Profil"><i class="fab fa-github"></i></a> · 
           <a href="https://twitter.com/_psava" title="X (Twitter)" aria-label="Folgen Sie mir auf X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a> · 
           <a href="https://scholar.google.com/citations?user=a2-nX-kAAAAJ" title="Google Scholar" aria-label="Sehen Sie meine Publikationen auf Google Scholar"><i class="fas fa-graduation-cap"></i></a> · 
           <a href="impressum-de.html">Impressum</a> · 
           <a href="datenschutz.html">Datenschutzerklärung</a></p>
        <p>© 2024 Paul Sava · Design inspired by <a href="https://owickstrom.github.io/the-monospace-web/">The Monospace Web</a></p>
    </footer>`;

    // Blog listing template
    const blogTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    ${headerTemplate}
    <title>Blog - Paul Sava</title>
    <link rel="alternate" type="application/rss+xml" title="Paul Sava's Blog" href="/feed.xml">
</head>
<body>
    ${headerStructureTemplate}
    <main>
        <div class="title-section">
            <h1>Blog Posts</h1>
            <a href="/feed.xml" class="rss-link">[ rss feed ]</a>
        </div>
        
        ${blogPosts.length === 0 ? 
            `<div class="empty-message">No blog posts yet.</div>` :
            blogPosts.map(post => `
                <a href="blog/${post.file.replace('.md', '.html')}" class="blog-entry">
                    <h2>${post.title}</h2>
                    <div class="blog-meta">
                        <span class="blog-date">${post.date}</span>
                    </div>
                    ${post.metadata.description ? `<div class="blog-description">${post.metadata.description}</div>` : ''}
                </a>
            `).join('\n')
        }
    </main>
    ${footerTemplate}

    <div id="analytics-notice" class="analytics-notice">
        <p>This website uses Umami Analytics, a privacy-friendly solution that doesn't use cookies or collect personal data. <a href="privacy.html#analytics">Learn more</a></p>
        <button onclick="dismissNotice()">Got it</button>
    </div>

    <script>
        function dismissNotice() {
            document.getElementById('analytics-notice').classList.add('hidden');
            localStorage.setItem('analytics-notice-dismissed', 'true');
        }

        // Check if notice was previously dismissed
        if (localStorage.getItem('analytics-notice-dismissed') === 'true') {
            document.getElementById('analytics-notice').classList.add('hidden');
        }
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
        const wordCount = post.content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
        const postTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    ${headerTemplate.replace('href="styles.css"', 'href="../styles.css"')}
    <title>${post.title} - Paul Sava</title>
    <link rel="alternate" type="application/rss+xml" title="Paul Sava's Blog" href="/feed.xml">
</head>
<body>
    ${blogPostHeaderTemplate}
    <main>
        <div class="blog-container">
            <div class="nav-row">
                <a href="../blog.html" class="nav-button">[ ← back ]</a>
            </div>

            <h1>${post.title}</h1>
            <div class="blog-meta">
                <span class="blog-date">${post.date}</span>
            </div>

            <hr class="separator" />

            <article class="blog-post">
                ${html}
            </article>

            <hr class="separator" />

            <div class="comments-section">
                <div class="comments-header">
                    <h2>[ comments ]</h2>
                </div>
                <div class="comments-container">
                    <script src="https://giscus.app/client.js"
                        data-repo="paulsava/paulsava.github.io"
                        data-repo-id="R_kgDOMlFqUQ"
                        data-category="Blog Comments"
                        data-category-id="DIC_kwDOMlFqUc4CmKMG"
                        data-mapping="pathname"
                        data-strict="0"
                        data-reactions-enabled="1"
                        data-emit-metadata="0"
                        data-input-position="bottom"
                        data-theme="fro"
                        data-lang="en"
                        data-loading="lazy"
                        crossorigin="anonymous"
                        async>
                    </script>
                </div>
            </div>
        </div>
    </main>
    ${footerTemplate}

    <div id="analytics-notice" class="analytics-notice">
        <p>This website uses Umami Analytics, a privacy-friendly solution that doesn't use cookies or collect personal data. <a href="../privacy.html#analytics">Learn more</a></p>
        <button onclick="dismissNotice()">Got it</button>
    </div>

    <script>
        function dismissNotice() {
            document.getElementById('analytics-notice').classList.add('hidden');
            localStorage.setItem('analytics-notice-dismissed', 'true');
        }

        // Check if notice was previously dismissed
        if (localStorage.getItem('analytics-notice-dismissed') === 'true') {
            document.getElementById('analytics-notice').classList.add('hidden');
        }
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
    ${headerStructureTemplate}
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

    <div id="analytics-notice" class="analytics-notice">
        <p>This website uses Umami Analytics, a privacy-friendly solution that doesn't use cookies or collect personal data. <a href="privacy.html#analytics">Learn more</a></p>
        <button onclick="dismissNotice()">Got it</button>
    </div>

    <script>
        function dismissNotice() {
            document.getElementById('analytics-notice').classList.add('hidden');
            localStorage.setItem('analytics-notice-dismissed', 'true');
        }

        // Check if notice was previously dismissed
        if (localStorage.getItem('analytics-notice-dismissed') === 'true') {
            document.getElementById('analytics-notice').classList.add('hidden');
        }
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
    ${headerStructureTemplate}
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

    <div id="analytics-notice" class="analytics-notice">
        <p>This website uses Umami Analytics, a privacy-friendly solution that doesn't use cookies or collect personal data. <a href="privacy.html#analytics">Learn more</a></p>
        <button onclick="dismissNotice()">Got it</button>
    </div>

    <script>
        function dismissNotice() {
            document.getElementById('analytics-notice').classList.add('hidden');
            localStorage.setItem('analytics-notice-dismissed', 'true');
        }

        // Check if notice was previously dismissed
        if (localStorage.getItem('analytics-notice-dismissed') === 'true') {
            document.getElementById('analytics-notice').classList.add('hidden');
        }
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