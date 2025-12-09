
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let existingContent = '';

try {
    if (fs.existsSync(envPath)) {
        // Try reading as UTF-8 first, fallback to UCS-2 if it looks binary
        try {
            existingContent = fs.readFileSync(envPath, 'utf8');
            if (existingContent.includes('\u0000')) {
                existingContent = fs.readFileSync(envPath, 'ucs2');
            }
        } catch (e) {
            existingContent = fs.readFileSync(envPath, 'ucs2');
        }
    }
} catch (err) {
    console.error('Error reading .env:', err);
}

// Extract Stack keys
const stackKeys = {};
const lines = existingContent.split(/\r?\n/);
lines.forEach(line => {
    const match = line.match(/^(NEXT_PUBLIC_STACK_[A-Z_]+|STACK_[A-Z_]+)=(.*)$/);
    if (match) {
        stackKeys[match[1]] = match[2].trim();
    }
});

console.log('--- PRESERVED STACK KEYS ---');
console.log(JSON.stringify(stackKeys, null, 2));
