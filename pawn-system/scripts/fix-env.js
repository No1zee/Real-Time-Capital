
const fs = require('fs');
const path = require('path');

const envContent = `DATABASE_URL="postgresql://neondb_owner:npg_GSRnMUAp76XE@ep-tiny-mountain-adsefjw5-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"`;
const envPath = path.join(__dirname, '..', '.env');

try {
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });
    console.log('.env file repaired successfully with UTF-8 encoding.');
    console.log('Content written:', envContent);
} catch (err) {
    console.error('Failed to write .env file:', err);
    process.exit(1);
}
