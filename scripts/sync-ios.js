const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const sourceDataDir = path.join(rootDir, 'data');
const targetDataDir = path.join(rootDir, 'web', 'data');

console.log('📦 Preparing data bundle for iOS...');

if (!fs.existsSync(targetDataDir)) {
    fs.mkdirSync(targetDataDir, { recursive: true });
}

// Copy JSON data files into web/data (skipping backups folder)
const files = fs.readdirSync(sourceDataDir);
let copied = 0;

for (const file of files) {
    if (file.endsWith('.json')) {
        const src = path.join(sourceDataDir, file);
        const dst = path.join(targetDataDir, file);
        fs.copyFileSync(src, dst);
        copied++;
    }
}

console.log(`✅ Bundled ${copied} data files into web/data/ for iOS build.`);
