# Environment Variables for Auction Automation

Add these to your Vercel project settings and GitHub repository secrets:

## Step 1: Generate CRON_SECRET

```bash
# Run this command to generate a secure secret:
openssl rand -hex 32
```

## Step 2: Add to Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
- **Name**: `CRON_SECRET`
- **Value**: The secret you generated above
- **Environment**: Production, Preview, Development

## Step 3: Add to GitHub Repository Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions

Add these secrets:
1. **VERCEL_DEPLOYMENT_URL**
   - Value: `https://your-app-name.vercel.app` (replace with your actual Vercel URL)

2. **CRON_SECRET**
   - Value: Same secret from Step 2

## Step 4: For Local Testing

Add to `.env.local`:
```
CRON_SECRET=your_local_secret_for_testing
```

## Verification

After setup, you can manually trigger the workflow from GitHub:
- Go to Actions tab
- Select "Auction Lifecycle Check"
- Click "Run workflow"
