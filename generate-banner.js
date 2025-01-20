const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function generateBanner(title, outputPath, description = 'Personal Website') {
    // Read and convert the image to base64
    const imageBuffer = await fs.readFile(path.join(process.cwd(), 'src', 'Profile.png'));
    const base64Image = imageBuffer.toString('base64');

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
                display: grid;
                grid-template-columns: 400px 1fr;
            }

            .left-panel {
                background: rgba(255, 255, 255, 0.02);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                padding: 48px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 24px;
                position: relative;
            }

            .left-panel::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100%;
                background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.2));
            }

            .profile {
                width: 200px;
                height: 200px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                object-fit: cover;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }

            .name {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                opacity: 0.9;
            }

            .right-panel {
                padding: 64px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
            }

            .right-panel::before {
                content: '';
                position: absolute;
                top: 64px;
                left: 64px;
                width: 40px;
                height: 2px;
                background: rgba(255, 255, 255, 0.1);
            }

            .page-title {
                font-size: 56px;
                font-weight: bold;
                line-height: 1.2;
                letter-spacing: 1px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                opacity: 0.95;
                margin-top: 32px;
            }

            /* Adjust title size based on length */
            .page-title.long {
                font-size: 48px;
            }
            .page-title.very-long {
                font-size: 40px;
            }

            .subtitle {
                font-size: 20px;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 24px;
                letter-spacing: 0.5px;
                line-height: 1.4;
                max-width: 600px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="left-panel">
                <img src="data:image/png;base64,${base64Image}" alt="Paul Sava" class="profile">
                <div class="name">PAUL SAVA</div>
            </div>
            <div class="right-panel">
                <div class="page-title ${title.length > 30 ? title.length > 50 ? 'very-long' : 'long' : ''}">${title}</div>
                <div class="subtitle">${description}</div>
            </div>
        </div>
    </body>
    </html>`;

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
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
        }
    });

    await browser.close();
}

// Export the function to use in build.js
module.exports = generateBanner; 