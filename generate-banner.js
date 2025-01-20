const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function generateBanner(title, outputPath, description = 'Personal Website') {
    // Copy profile picture to public directory
    const publicProfilePath = path.join(process.cwd(), 'public', 'Profile.png');
    await fs.copyFile(path.join(process.cwd(), 'src', 'Profile.png'), publicProfilePath);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
            
            body {
                margin: 0;
                padding: 0;
                background: #121212;
                height: 630px;
                width: 1200px;
                font-family: 'Courier Prime', monospace;
                color: white;
                position: relative;
                overflow: hidden;
            }

            /* Grid background */
            body::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                background-size: 16px 16px;
                z-index: 1;
            }

            .container {
                position: relative;
                z-index: 2;
                height: 100%;
                width: 100%;
                padding: 64px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .content {
                max-width: 800px;
            }

            .page-title {
                font-size: 64px;
                font-weight: bold;
                line-height: 1.2;
                letter-spacing: 0.5px;
                margin: 0;
                padding: 0;
            }

            .subtitle {
                font-size: 28px;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 24px;
                line-height: 1.4;
            }

            .profile-section {
                display: flex;
                align-items: center;
                gap: 24px;
                opacity: 0.95;
                background: rgba(0, 0, 0, 0.2);
                padding: 12px 24px;
                border-radius: 6px;
            }

            .profile {
                width: 80px;
                height: 80px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                object-fit: contain;
                background: rgba(255, 255, 255, 0.05);
                padding: 4px;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }

            .name {
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 0.5px;
            }

            .domain {
                font-size: 16px;
                opacity: 0.7;
                margin-top: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="page-title ${title.length > 30 ? title.length > 50 ? 'very-long' : 'long' : ''}">${title}</div>
                <div class="subtitle">${description}</div>
            </div>
            <div class="profile-section">
                <img src="file://${publicProfilePath}" alt="Paul Sava" class="profile">
                <div>
                    <div class="name">PAUL SAVA</div>
                    <div class="domain">paulsava.github.io</div>
                </div>
            </div>
        </div>
    </body>
    </html>`;

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {
            width: 1200,
            height: 630,
            deviceScaleFactor: 2
        }
    });
    const page = await browser.newPage();
    await page.setContent(html, { 
        waitUntil: ['networkidle0', 'load', 'domcontentloaded']
    });
    
    // Wait for image to load
    await page.evaluate(() => {
        return new Promise((resolve) => {
            const img = document.querySelector('.profile');
            if (img.complete) resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
        });
    });
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    await page.screenshot({
        path: outputPath,
        type: 'png',
        clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 630
        },
        omitBackground: false
    });

    await browser.close();
}

// Export the function to use in build.js
module.exports = generateBanner; 