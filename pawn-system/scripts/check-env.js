const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('--- Environment Check ---');
console.log('Checking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists.');
    const content = fs.readFileSync(envPath, 'utf8');

    if (content.includes('AUTH_SECRET=')) {
        console.log('✅ AUTH_SECRET found in .env');
    } else {
        console.error('❌ AUTH_SECRET is MISSING in .env');
        console.log('Please add: AUTH_SECRET="your_secret_here"');
    }

    if (content.includes('DATABASE_URL=')) {
        console.log('✅ DATABASE_URL found in .env');
    } else {
        console.error('❌ DATABASE_URL is MISSING in .env');
    }
} else {
    console.error('❌ .env file NOT FOUND at', envPath);
    console.log('Please create a .env file in the root of "pawn-system".');
}
console.log('-------------------------');
