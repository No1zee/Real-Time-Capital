const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'tsc-errors.log');

try {
    const content = fs.readFileSync(logPath, 'ucs2');
    const lines = content.split('\n');

    // Print first 80 lines
    console.log('=== TypeScript Errors (First 80 lines) ===');
    lines.slice(0, 80).forEach((line, idx) => {
        console.log(`${idx + 1}: ${line}`);
    });
} catch (err) {
    console.error('Failed to read log:', err);
}
