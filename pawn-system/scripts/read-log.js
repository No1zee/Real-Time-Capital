
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'seed_debug_final.log');

try {
    // Try reading as UTF-16LE (UCS2) which is common for Powershell output
    const content = fs.readFileSync(logPath, 'ucs2');
    console.log('--- LOG CONTENT START ---');
    console.log(content);
    console.log('--- LOG CONTENT END ---');
} catch (err) {
    console.error('Failed to read log:', err);
}
