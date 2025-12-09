
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

try {
    console.log('--- RAW ENV INSPECTION ---');
    if (!fs.existsSync(envPath)) {
        console.log('File not found!');
    } else {
        const stats = fs.statSync(envPath);
        console.log(`File size: ${stats.size} bytes`);

        // Try UTF-8
        let content = fs.readFileSync(envPath, 'utf8');
        console.log('--- UTF-8 Preview (First 500 chars) ---');
        console.log(content.substring(0, 500).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

        // Check for null bytes (UTF-16 indicator)
        if (content.includes('\u0000')) {
            console.log('WARNING: Null bytes detected! Likely UTF-16 encoded.');
            content = fs.readFileSync(envPath, 'ucs2');
            console.log('--- UCS-2/UTF-16 Preview ---');
            console.log(content.substring(0, 500));
        }

        // Check for DATABASE_URL specifically
        const match = content.match(/DATABASE_URL=.*/);
        if (match) {
            console.log('--- Found DATABASE_URL Line ---');
            console.log(match[0]);
        } else {
            console.log('--- DATABASE_URL NOT FOUND in content ---');
        }
    }
} catch (err) {
    console.error('Inspection failed:', err);
}
