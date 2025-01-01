# Personal Website

This is my personal website built with vanilla HTML, CSS, and JavaScript. The entire website was developed using [Cursor](https://cursor.sh/) IDE and Claude Sonnet, making it a showcase of AI-assisted development. The minimalist, monospace design is inspired by [The Monospace Web](https://owickstrom.github.io/the-monospace-web/).

## Credits

- Website Development: Built entirely using [Cursor](https://cursor.sh/) IDE and Claude Sonnet
- Design Inspiration: [The Monospace Web](https://owickstrom.github.io/the-monospace-web/) by Oskar Wickström
- Development Tools: Node.js, Python, GitHub Actions

## Features

- 🌙 Dark mode by default
- 📱 Responsive design
- 📰 Blog with RSS feed
- 📚 Publications page
- 💻 Projects showcase
- 🔍 SEO optimized
- 🖼️ Favicon support

## Structure

```
.
├── src/                # Source files
│   ├── assets/        # Static assets
│   │   └── favicon/   # Favicon files
│   ├── blog/          # Blog posts (Markdown)
│   ├── projects/      # Project files (Markdown)
│   ├── publications/  # Publication files (Markdown)
│   ├── *.html        # HTML pages
│   └── styles.css    # Main stylesheet
├── scripts/          # Build scripts
│   └── generate_rss.py  # RSS feed generator
├── build.js          # Main build script
└── package.json      # Project dependencies
```

## Development

### Prerequisites

- Node.js (v18 or higher)
- Python 3.x (for RSS feed generation)

### Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Building

The site is built using a custom Node.js build script that:
- Processes Markdown files
- Generates HTML pages
- Creates RSS feed
- Copies static assets

To build the site:
```bash
node build.js
```

### Deployment

The site is automatically built and deployed to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

## Adding Content

### Blog Posts
Add new blog posts as Markdown files in `src/blog/` with the following frontmatter:
```markdown
---
title: Your Blog Post Title
date: Sun, 31 Dec 2023 12:00:00 +0000
description: A brief description of your blog post
---
```

### Publications
Add publications in `src/publications/` as Markdown files with:
```markdown
---
title: Publication Title
venue: Conference/Journal Name
authors: Author List
date: 2023-12-31
pdf: link/to/pdf
---
```

### Projects
Add projects in `src/projects/` as Markdown files with:
```markdown
---
title: Project Title
status: In Progress/Completed
github: https://github.com/username/repo
date: 2023-12-31
---
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The design is inspired by [The Monospace Web](https://owickstrom.github.io/the-monospace-web/) by Oskar Wickström, which is also MIT licensed. 