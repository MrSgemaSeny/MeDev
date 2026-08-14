const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS_DIR = path.join(__dirname, 'src', 'main', 'resources', 'fonts');

// Fonts to download. Key is Google Fonts family name, value is array of requested weights
const fontsToDownload = {
    'Inter': ['400', '500', '600', '700', '800'],
    'Space Grotesk': ['400', '500', '600', '700'],
    'Lora': ['400', '400i', '600'],
    'Playfair Display': ['600', '700'],
    'Anton': ['400']
};

const USER_AGENT = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';

async function fetchCss(family, weights) {
    // format weights for google fonts v2 API:
    // e.g. Lora:ital,wght@0,400;0,600;1,400
    let url = '';
    if (weights.some(w => w.includes('i'))) {
        // has italics
        const axes = weights.map(w => {
            if (w.includes('i')) return `1,${w.replace('i', '')}`;
            return `0,${w}`;
        }).join(';');
        url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:ital,wght@${axes}&display=swap`;
    } else {
        const axes = weights.join(';');
        url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${axes}&display=swap`;
    }
    
    console.log(`Fetching CSS: ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`Failed to fetch CSS for ${family}: ${res.statusText}`);
    return await res.text();
}

function parseCss(css, family) {
    const blocks = css.split('@font-face').slice(1);
    const variants = [];
    
    for (const block of blocks) {
        const weightMatch = block.match(/font-weight:\s*(\d+)/);
        const styleMatch = block.match(/font-style:\s*(normal|italic)/);
        const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);
        
        if (weightMatch && styleMatch && urlMatch) {
            const weight = weightMatch[1];
            const style = styleMatch[1];
            const url = urlMatch[1];
            
            // Generate standard file name
            const familyNoSpace = family.replace(/ /g, '');
            let weightName = 'Regular';
            if (weight === '500') weightName = 'Medium';
            else if (weight === '600') weightName = 'SemiBold';
            else if (weight === '700') weightName = 'Bold';
            else if (weight === '800') weightName = 'ExtraBold';
            
            let fileName = '';
            if (style === 'italic') {
                if (weight === '400') fileName = `${familyNoSpace}-Italic.ttf`;
                else fileName = `${familyNoSpace}-${weightName}Italic.ttf`;
            } else {
                fileName = `${familyNoSpace}-${weightName}.ttf`;
            }
            
            variants.push({ fileName, url });
        }
    }
    return variants;
}

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Status ${response.statusCode} for ${url}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
    }
    
    for (const [family, weights] of Object.entries(fontsToDownload)) {
        try {
            const css = await fetchCss(family, weights);
            const variants = parseCss(css, family);
            
            for (const v of variants) {
                const dest = path.join(FONTS_DIR, v.fileName);
                console.log(`Downloading ${v.fileName} from ${v.url}...`);
                await downloadFile(v.url, dest);
                console.log(`Saved ${v.fileName}`);
            }
        } catch (e) {
            console.error(`Error processing ${family}:`, e.message);
        }
    }
}

run();
