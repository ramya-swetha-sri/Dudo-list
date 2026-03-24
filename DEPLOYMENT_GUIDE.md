# Deployment Guide - Vercel

## Overview
This app is automatically deployed to Vercel when you push changes to GitHub. No manual deployment needed!

## One-Time Setup (First Time Only)

### 1. Connect Vercel to Your GitHub Repository

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in or create a free account
3. Click **"New Project"**
4. Select **"Import from Git"**
5. Choose your GitHub repository (e.g., `Dudo list`)
6. Click **"Import"**

### 2. Configure Environment Variables

Vercel will show you a screen to add environment variables. Add all Firebase credentials:

```
REACT_APP_FIREBASE_API_KEY = your_value
REACT_APP_FIREBASE_AUTH_DOMAIN = your_value
REACT_APP_FIREBASE_PROJECT_ID = your_value
REACT_APP_FIREBASE_STORAGE_BUCKET = your_value
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = your_value
REACT_APP_FIREBASE_APP_ID = your_value
```

Get these values from:
1. Firebase Console → Project Settings
2. Copy each value and paste into Vercel

### 3. Deploy

Click **"Deploy"** button
- Vercel builds your app (1-2 minutes)
- You get a live URL: `https://your-project-name.vercel.app`
- ✅ Your app is live!

### 4. Set Up Automatic Deployments (GitHub Actions)

#### Get Vercel Tokens

1. Go to [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create"** next to Personal Tokens
3. Name it: `VERCEL_TOKEN`
4. Copy the token (you won't see it again!)

#### Get Vercel Project IDs

1. Go to your Vercel project dashboard
2. Copy from the URL or Settings → Project ID
   - `VERCEL_ORG_ID` = Your team/username slug
   - `VERCEL_PROJECT_ID` = Your project ID

#### Add to GitHub Secrets

1. Go to your GitHub repository
2. Settings → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

```
VERCEL_TOKEN = (from step above)
VERCEL_ORG_ID = (from Vercel dashboard)
VERCEL_PROJECT_ID = (from Vercel dashboard)
REACT_APP_FIREBASE_API_KEY = (your Firebase API key)
REACT_APP_FIREBASE_AUTH_DOMAIN = (your Firebase auth domain)
REACT_APP_FIREBASE_PROJECT_ID = (your Firebase project ID)
REACT_APP_FIREBASE_STORAGE_BUCKET = (your Firebase storage bucket)
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = (your Firebase messaging sender ID)
REACT_APP_FIREBASE_APP_ID = (your Firebase app ID)
```

## How It Works

### Automatic Deployment Flow

```
You push code to GitHub
        ↓
GitHub Actions workflow triggers
        ↓
Runs: npm install
        ↓
Runs: npm run build
        ↓
Deploys to Vercel
        ↓
Your live site updates! ✅
```

**That's it!** Every push to `main` or `ramya/main` branch automatically deploys.

## Manual Deployment (If Needed)

If you want to deploy without GitHub Actions:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy from your local machine:
```bash
vercel --prod
```

3. Follow the prompts
4. Your app will be live!

## Check Deployment Status

### View Build Logs
- Go to your Vercel dashboard
- Click your project
- Go to **"Deployments"** tab
- Click any deployment to see logs

### View Errors
If deployment fails:
1. Go to Vercel dashboard
2. Click the failed deployment
3. Scroll to bottom to see error messages
4. Fix the issue locally
5. Push again (auto-deploys)

## Environment Variables per Environment

Vercel supports different variables for different environments:

- **Production** - What users see
- **Preview** - What pull requests get (for testing)
- **Development** - Local `npm run dev`

To set environment-specific variables in Vercel:
1. Vercel Dashboard → Settings → Environment Variables
2. Select the environment (Production, Preview, etc.)
3. Add or modify variables

## Troubleshooting

### Build Fails with "Cannot find module"
- Make sure all dependencies are in `package.json`
- Run `npm install` locally and test
- Commit `package-lock.json`

### Firebase Config Missing
- Check GitHub Secrets are added correctly
- Verify names match exactly: `REACT_APP_FIREBASE_*`
- Redeploy after adding secrets

### App Works Locally But Not on Vercel
- Check environment variables in Vercel dashboard
- Verify `.env.local` is in `.gitignore` (don't commit secrets)
- Run `npm run build` locally to test production build

### Deployment Stuck
- Refresh Vercel dashboard
- Check GitHub Actions tab for workflow status
- Try manual deployment: `vercel --prod`

## Custom Domain (Optional)

To use your own domain (e.g., `mytasks.com`)

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Follow Vercel's instructions to update DNS
4. Domain will be live in 5-30 minutes

## Performance Tips

✅ These are already optimized:
- Vite builds are super fast
- React 19 is optimized
- Firebase Hosting/Vercel CDN is global
- Lazy loading for code splitting

## View Your Live App

After first deployment, share the URL with your friends:
```
https://your-project-name.vercel.app
```

They can:
- Sign up with their email
- Add you as a friend
- See your tasks in real-time
- All synced to Firestore ✨

## Rollback (Undo Deployment)

If you deployed something broken:

1. Go to Vercel dashboard
2. Go to **"Deployments"**
3. Find the last good deployment
4. Click the three dots (...)
5. Click **"Promote to Production"**
6. Done! Previous version is live

## CI/CD Pipeline Summary

```
Your local machine
    ↓ git push
GitHub Repository
    ↓ triggers
GitHub Actions (`.github/workflows/deploy.yml`)
    ↓ runs build
    ↓ passes Firebase secrets
Vercel Deployment
    ↓ builds & starts server
    ↓ 
https://your-app.vercel.app ← LIVE! ✅
```

## Next Steps

- [x] Set up Vercel project
- [x] Add environment variables
- [x] Set up GitHub Actions
- [ ] Test by pushing a small change
- [ ] Share live URL with friends
- [ ] Monitor deployments

## Need Help?

- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://github.com/features/actions
- Common issues: https://vercel.com/support

---

**Your app is now production-ready!** 🚀
