const fs = require('fs');
const reg = fs.readFileSync('Roboto-Regular.b64', 'utf16le').replace(/\r?\n/g, '').trim();
const bold = fs.readFileSync('Roboto-Bold.b64', 'utf16le').replace(/\r?\n/g, '').trim();

if (reg.length < 1000) console.log('ERROR: base64 too small');

const css = `
@font-face {
    font-family: 'Roboto';
    src: url(data:font/truetype;charset=utf-8;base64,${reg}) format('truetype');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'Roboto';
    src: url(data:font/truetype;charset=utf-8;base64,${bold}) format('truetype');
    font-weight: bold;
    font-style: normal;
}
`;

const templates = [
    'src/main/resources/templates/resume/classic.html',
    'src/main/resources/templates/resume/modern.html',
    'src/main/resources/templates/resume/minimal.html'
];

templates.forEach(t => {
    if (fs.existsSync(t)) {
        let content = fs.readFileSync(t, 'utf8');
        content = content.replace(/<style>/, '<style>' + css);
        content = content.replace(/font-family:[^;]+;/, "font-family: 'Roboto', sans-serif;");
        fs.writeFileSync(t, content, 'utf8');
        console.log('Updated ' + t);
    }
});
