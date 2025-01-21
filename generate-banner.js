const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

let browser = null;

async function initBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: {
                width: 1200,
                height: 630,
                deviceScaleFactor: 2
            }
        });
    }
    return browser;
}

async function generateBanner(title, outputPath, description = 'Personal Website') {
    const profilePath = path.join(process.cwd(), 'src', 'Profile.png');
    const profileContent = await fs.readFile(profilePath, { encoding: 'base64' });
    const profileDataUrl = `data:image/png;base64,${profileContent}`;

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
                background: #1a1a1a;
                height: 630px;
                width: 1200px;
                font-family: 'Courier Prime', monospace;
                color: white;
                position: relative;
                overflow: hidden;
            }

            /* Grid background with fade */
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
                background-size: 20px 20px;
                z-index: 1;
                mask-image: linear-gradient(to bottom, 
                    rgba(0, 0, 0, 1) 0%,
                    rgba(0, 0, 0, 0.8) 50%,
                    rgba(0, 0, 0, 0.4) 100%
                );
            }

            /* Subtle vignette */
            body::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(
                    circle at center,
                    transparent 0%,
                    rgba(0, 0, 0, 0.2) 100%
                );
                z-index: 2;
            }

            .container {
                position: relative;
                z-index: 3;
                height: 630px;
                width: 100%;
                padding: 0;
            }

            .content {
                position: absolute;
                top: 60px;
                left: 60px;
                right: 60px;
            }

            .page-title {
                font-size: 84px;
                font-weight: bold;
                line-height: 1.1;
                letter-spacing: -1px;
                margin: 0;
                padding: 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                background: linear-gradient(
                    to bottom,
                    rgba(255, 255, 255, 1) 0%,
                    rgba(255, 255, 255, 0.95) 100%
                );
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .page-title.long {
                font-size: 64px;
            }

            .page-title.very-long {
                font-size: 48px;
            }

            .subtitle {
                font-size: 32px;
                color: rgba(255, 255, 255, 0.85);
                margin-top: 40px;
                line-height: 1.4;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
                font-weight: 400;
                letter-spacing: -0.5px;
                opacity: 0.9;
            }

            .profile-section {
                position: absolute;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 24px;
                background: rgba(0, 0, 0, 0.75);
                padding: 16px 32px;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                box-shadow: 
                    0 4px 24px rgba(0, 0, 0, 0.2),
                    0 1px 2px rgba(255, 255, 255, 0.05);
                width: fit-content;
                transition: all 0.3s ease;
            }

            .profile {
                width: 64px;
                height: 64px;
                border: 2px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                object-fit: cover;
                background: rgba(255, 255, 255, 0.05);
                padding: 4px;
                box-shadow: 
                    0 2px 12px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.05);
            }

            .name {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
                background: linear-gradient(
                    to bottom,
                    rgba(255, 255, 255, 1) 0%,
                    rgba(255, 255, 255, 0.9) 100%
                );
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .domain {
                font-size: 18px;
                opacity: 0.6;
                letter-spacing: 0.5px;
                color: rgba(255, 255, 255, 0.9);
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
                <img src="${profileDataUrl}" alt="Paul Sava" class="profile">
                <div>
                    <div class="name">PAUL SAVA</div>
                    <div class="domain">paulsava.github.io</div>
                </div>
            </div>
        </div>
    </body>
    </html>`;

    const browser = await initBrowser();
    const page = await browser.newPage();
    
    // Set content and wait for everything to load
    await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded']
    });
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Take screenshot
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

    await page.close();
}

// Cleanup function to close browser
async function cleanup() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}

// Export the functions
module.exports = generateBanner;
module.exports.cleanup = cleanup; 