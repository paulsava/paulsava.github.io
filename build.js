const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const readingTime = require('reading-time');
const generateBanner = require('./generate-banner');

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
    await fs.mkdir('./public/assets/banners', { recursive: true });
    
    // Copy Profile.png to the temp directory for banner generation
    await fs.copyFile('./src/Profile.png', './Profile.png');
    
    // Generate banners for main pages
    console.log('Generating page banners...');
    await generateBanner('Home', './public/assets/banners/home.png', 'my internet place since there is no chance to buy a real one in this economy');
    await generateBanner('Blog', './public/assets/banners/blog.png', 'random thoughts on research, coffee, films & whatever');
    await generateBanner('Publications', './public/assets/banners/publications.png', 'my unpaywalled publications ;)');
    await generateBanner('Projects', './public/assets/banners/projects.png', 'some of my side-projects');

    // Clean up temp file
    await fs.unlink('./Profile.png');

    // Update meta tags template with dynamic banner
    const getMetaTags = (title, description, bannerPath) => `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://paulsava.github.io${bannerPath.replace('./public', '')}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://paulsava.github.io${bannerPath.replace('./public', '')}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://paulsava.github.io${bannerPath.replace('./public', '')}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="https://paulsava.github.io${bannerPath.replace('./public', '')}">`;

    // Update header template to include dynamic meta tags
    const headerTemplate = (title, description, bannerPath) => `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    ${getMetaTags(title, description, bannerPath)}
    
    <!-- Performance optimizations -->
    <link rel="preconnect" href="https://github.com">
    <link rel="preconnect" href="https://scholar.google.com">
    <link rel="dns-prefetch" href="https://github.com">
    <link rel="dns-prefetch" href="https://scholar.google.com">
    <link rel="canonical" href="https://paulsava.github.io/">
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="assets/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png">
    <link rel="manifest" href="assets/favicon/site.webmanifest">
    
    <!-- RSS Feed -->
    <link rel="alternate" type="application/rss+xml" title="Paul Sava's Blog" href="/feed.xml">
    
    <!-- Styles -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Umami Analytics -->
    <script defer src="https://cloud.umami.is/script.js" data-website-id="85fb5f51-451a-4b90-8f07-63d7d37a8014"></script>`;

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
        'assets/images/9v5ajs.jpg',
        'impressum.html',
        'impressum-de.html',
        'privacy.html',
        'datenschutz.html'
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
    ${headerTemplate(
        'Blog - Paul Sava',
        'Personal blog about AI Security, research, and other interests',
        './public/assets/banners/blog.png'
    )}
    <title>Blog - Paul Sava</title>
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
                        <span class="reading-time">${post.readingTime} min read</span>
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
        const bannerPath = `./public/assets/banners/blog-${post.file.replace('.md', '.png')}`;

        // Copy Profile.png to temp directory for banner generation
        await fs.copyFile('./src/Profile.png', './Profile.png');
        await generateBanner(post.title, bannerPath, post.metadata.description);
        await fs.unlink('./Profile.png');

        const postTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    ${headerTemplate(
        `${post.title} - Paul Sava`,
        post.metadata.description || 'Blog post by Paul Sava',
        bannerPath
    ).replace('href="styles.css"', 'href="../styles.css"')}
    <title>${post.title} - Paul Sava</title>
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
    ${headerTemplate(
        'Publications - Paul Sava',
        'Academic publications in AI Security, LLM Security, and Privacy',
        './public/assets/banners/publications.png'
    )}
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
    ${headerTemplate(
        'Projects - Paul Sava',
        'Personal and research projects in AI, security, and other interests',
        './public/assets/banners/projects.png'
    )}
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

    // Generate index page
    const indexTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    ${headerTemplate(
        'Paul Sava - AI Security Researcher at Fraunhofer AISEC',
        'AI Security Researcher at Fraunhofer AISEC, focusing on LLM security, autonomous AI agents, and private machine learning. PhD candidate at TUM.',
        './public/assets/banners/home.png'
    )}
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

buildSite().catch(console.error).finally(async () => {
    try {
        // Ensure browser is closed
        if (generateBanner.cleanup) {
            await generateBanner.cleanup();
        }
        console.log('Build complete!');
        // Force exit after cleanup
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}); 