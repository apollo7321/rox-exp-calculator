const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify: terserMinify } = require('terser');
const { minify: htmlMinify } = require('html-minifier-terser');

async function build() {
    console.log('Building docs/index.html...');

    // Ensure docs directory exists
    const distDir = path.join(__dirname, 'docs');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    // Read files
    let html = fs.readFileSync('index.html', 'utf8');
    const css = fs.readFileSync('style.css', 'utf8');
    const mathJs = fs.readFileSync('math.js', 'utf8');
    const appJs = fs.readFileSync('app.js', 'utf8');
    const json = fs.readFileSync('monsters.json', 'utf8');

    // Minify CSS
    console.log('Minifying CSS...');
    const minifiedCss = new CleanCSS({}).minify(css).styles;

    // Minify JS
    console.log('Minifying JS...');
    const combinedJs = mathJs + '\n' + appJs;
    const minifiedJsResult = await terserMinify(combinedJs, { toplevel: true });
    const minifiedJs = minifiedJsResult.code;

    // Build the inline script containing the JSON data
    const inlineDataScript = `<script>window.ROX_MONSTERS_DATA = ${json};</script>`;

    // Replace references in HTML with inline content
    html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${minifiedCss}</style>`);
    html = html.replace('<script src="math.js"></script>', '');
    html = html.replace('<script src="app.js"></script>', `${inlineDataScript}\n    <script>${minifiedJs}</script>`);

    // Minify the final HTML combining everything
    console.log('Minifying HTML...');
    const resultHtml = await htmlMinify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    });

    // Write output
    const outPath = path.join(distDir, 'index.html');
    fs.writeFileSync(outPath, resultHtml, 'utf8');

    console.log(`Build complete! Output saved to: ${outPath} (${(resultHtml.length / 1024).toFixed(2)} KB)`);
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
