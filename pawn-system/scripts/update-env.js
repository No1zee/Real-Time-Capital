
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

const content = `# Database Connection
DATABASE_URL="postgresql://neondb_owner:npg_0lfBwCj4GMqY@ep-broad-glade-adltbwzi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_0lfBwCj4GMqY@ep-broad-glade-adltbwzi.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Vercel / Neon Parameters
PGHOST="ep-broad-glade-adltbwzi-pooler.c-2.us-east-1.aws.neon.tech"
PGHOST_UNPOOLED="ep-broad-glade-adltbwzi.c-2.us-east-1.aws.neon.tech"
PGUSER="neondb_owner"
PGDATABASE="neondb"
PGPASSWORD="npg_0lfBwCj4GMqY"

POSTGRES_URL="postgresql://neondb_owner:npg_0lfBwCj4GMqY@ep-broad-glade-adltbwzi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://neondb_owner:npg_0lfBwCj4GMqY@ep-broad-glade-adltbwzi.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
POSTGRES_USER="neondb_owner"
POSTGRES_HOST="ep-broad-glade-adltbwzi-pooler.c-2.us-east-1.aws.neon.tech"
POSTGRES_PASSWORD="npg_0lfBwCj4GMqY"
POSTGRES_DATABASE="neondb"
POSTGRES_URL_NO_SSL="postgresql://neondb_owner:npg_0lfBwCj4GMqY@ep-broad-glade-adltbwzi-pooler.c-2.us-east-1.aws.neon.tech/neondb"
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_0lfBwCj4GMqY@ep-broad-glade-adltbwzi-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"

# Stack Auth (Placeholders - PLEASE UPDATE IF NEEDED)
NEXT_PUBLIC_STACK_PROJECT_ID="****************************"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="****************************************"
STACK_SECRET_SERVER_KEY="***********************"
`;

try {
    fs.writeFileSync(envPath, content, { encoding: 'utf8' });
    console.log('.env file updated successfully with new credentials.');
} catch (err) {
    console.error('Failed to write .env:', err);
    process.exit(1);
}
