# Deployment Guide: Vercel + Supabase

This guide will walk you through deploying your Football Results Expectations application to Vercel (frontend & backend) and Supabase (database).

## Prerequisites

- GitHub account (for Vercel deployment)
- Supabase account ([sign up here](https://supabase.com))
- Vercel account ([sign up here](https://vercel.com))
- Your local database exported (already done: `backend/exports/database-export-2025-11-03.sql`)

## Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `football-results` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" (this takes ~2 minutes)

### Step 2: Get Database Connection Strings

1. Once the project is created, go to **Project Settings** (gear icon)
2. Navigate to **Database** section
3. Scroll down to **Connection String** section
4. You'll need TWO connection strings:

   **Direct Connection** (for migrations):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

   **Pooled Connection** (for serverless - **USE THIS ONE**):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
   ```

   **Important**: Port 6543 is for pooled connection (transaction mode) - required for serverless!

5. Copy both connection strings and replace `[YOUR-PASSWORD]` with your actual password

### Step 3: Import Your Database

You have two options:

#### Option A: Using psql Command Line (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run import (replace [SUPABASE-HOST] with your actual host from connection string)
psql -h db.[PROJECT-REF].supabase.co -p 5432 -U postgres -d postgres -f exports/database-export-2025-11-03.sql
```

When prompted, enter your Supabase database password.

#### Option B: Using Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `backend/exports/database-export-2025-11-03.sql` in a text editor
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** (this may take a minute)

### Step 4: Verify Database Import

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see all your tables: User, League, Team, Match, Prediction, Group, etc.
3. Click on a few tables to verify data was imported correctly

---

## Part 2: Backend Deployment (Vercel)

### Step 1: Push Code to GitHub

```bash
# Make sure you're on the vercel-deployment branch
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel + Supabase deployment"

# Push to GitHub
git push origin vercel-deployment
```

### Step 2: Create Vercel Project for Backend

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:

   **Framework Preset**: Other
   **Root Directory**: `backend`
   **Build Command**: `npm run build && npx prisma generate`
   **Output Directory**: `dist`
   **Install Command**: `npm install`

5. **Environment Variables** - Add these (click "Environment Variables"):

   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
   NODE_ENV=production
   FOOTBALL_DATA_API_TOKEN=10dbc7b8a2ce4823b18e2e6dccfaf329
   FRONTEND_URL=https://[YOUR-FRONTEND-URL].vercel.app
   CRON_SECRET=[GENERATE-A-RANDOM-SECRET]
   COOKIE_DOMAIN=
   ```

   **Important Notes**:
   - Use the **POOLED** connection string (port 6543) for DATABASE_URL
   - For FRONTEND_URL, use the URL you'll get after deploying frontend (you can update this later)
   - For CRON_SECRET, generate a random string (e.g., `openssl rand -base64 32` or use a password generator)
   - Leave COOKIE_DOMAIN empty for now (Vercel domains work without it)

6. Click **"Deploy"**

7. Wait for deployment to complete (~2-3 minutes)

8. **Copy your backend URL** - it will be something like:
   `https://football-backend-xxx.vercel.app`

### Step 3: Configure Vercel Cron Job

1. In your Vercel project dashboard, go to **Settings** > **Cron Jobs**
2. Verify that the cron job is configured (from vercel.json):
   - Path: `/api/cron/cleanup-sessions`
   - Schedule: `0 * * * *` (every hour)
3. The cron job should be automatically configured from your `vercel.json`

### Step 4: Test Backend Deployment

Open your backend URL in a browser:
```
https://[YOUR-BACKEND-URL].vercel.app/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Update Frontend API URL (Local)

Before deploying, update your frontend's environment variable:

1. Edit `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://[YOUR-BACKEND-URL].vercel.app/api
   ```

2. Commit this change:
   ```bash
   git add frontend/.env.local
   git commit -m "Update API URL for production"
   git push origin vercel-deployment
   ```

### Step 2: Create Vercel Project for Frontend

1. In Vercel, click **"Add New Project"** again
2. Import your **same GitHub repository** (yes, same repo!)
3. Configure the project:

   **Framework Preset**: Next.js
   **Root Directory**: `frontend`
   **Build Command**: `npm run build`
   **Output Directory**: `.next`
   **Install Command**: `npm install`

4. **Environment Variables** - Add:

   ```
   NEXT_PUBLIC_API_URL=https://[YOUR-BACKEND-URL].vercel.app/api
   ```

   Replace `[YOUR-BACKEND-URL]` with your actual backend URL from Part 2.

5. Click **"Deploy"**

6. Wait for deployment to complete (~3-5 minutes)

7. **Copy your frontend URL** - it will be something like:
   `https://football-frontend-xxx.vercel.app`

### Step 3: Update Backend with Frontend URL

1. Go back to your **backend Vercel project**
2. Go to **Settings** > **Environment Variables**
3. Edit the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://[YOUR-FRONTEND-URL].vercel.app
   ```
4. Save and **Redeploy** the backend (go to Deployments > latest deployment > three dots > Redeploy)

---

## Part 4: Testing & Verification

### Test Authentication Flow

1. Open your frontend URL: `https://[YOUR-FRONTEND-URL].vercel.app`
2. Try to log in with your existing credentials:
   - Email: `mustafa@example.com`
   - Password: `password123`
3. Verify that you can see the dashboard and your predictions

### Test All Features

Go through each feature to ensure everything works:

- ✅ User login/logout
- ✅ View leagues and matches
- ✅ Create/update predictions
- ✅ View leaderboards
- ✅ View groups
- ✅ Admin features (if you're an admin)

### Monitor Logs

1. In Vercel, go to your backend project > **Deployments** > Latest deployment
2. Click **"View Function Logs"** to see real-time logs
3. Check for any errors or warnings

### Verify Cron Job

1. Wait ~1 hour for the first cron job to run
2. Check Vercel **Function Logs** around the top of the hour
3. You should see: `🧹 Cleaned up X expired sessions`

---

## Part 5: Custom Domain (Optional)

If you want to use your own domain (e.g., `football.yoursite.com`):

### For Frontend:
1. Go to your frontend Vercel project > **Settings** > **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### For Backend:
1. Go to your backend Vercel project > **Settings** > **Domains**
2. Add your API subdomain (e.g., `api.yoursite.com`)
3. Update frontend environment variable: `NEXT_PUBLIC_API_URL=https://api.yoursite.com/api`
4. Update backend environment variable: `FRONTEND_URL=https://football.yoursite.com`
5. If using same root domain, set `COOKIE_DOMAIN=.yoursite.com`

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase pooled connection string | `postgresql://...@db.xxx.supabase.co:6543/...` |
| `NODE_ENV` | Environment mode | `production` |
| `FOOTBALL_DATA_API_TOKEN` | Football data API token | `10dbc7b8a2ce4823b18e2e6dccfaf329` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `CRON_SECRET` | Secret for cron job authentication | Random secure string |
| `COOKIE_DOMAIN` | Cookie domain (optional) | `.yourdomain.com` or empty |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.vercel.app/api` |

---

## Troubleshooting

### Issue: "Not allowed by CORS" error

**Solution**:
- Check that `FRONTEND_URL` in backend matches your actual frontend URL
- Verify both deployments are using HTTPS
- Clear browser cache and try again

### Issue: Authentication not working / Cookies not being set

**Solution**:
- Verify backend is deployed with `NODE_ENV=production`
- Check that both frontend and backend URLs use HTTPS
- Try in an incognito/private window
- Check browser console for cookie errors

### Issue: Database connection errors

**Solution**:
- Verify you're using the **pooled** connection string (port 6543)
- Check that `?pgbouncer=true` is at the end of the connection string
- Verify your Supabase password is correct
- Check Supabase dashboard for connection limits

### Issue: Cron job not running

**Solution**:
- Verify cron job is configured in Vercel project settings
- Check that `CRON_SECRET` environment variable is set
- Look for cron execution in Function Logs
- Cron jobs may take up to 1 hour for first run

### Issue: "Prisma Client not generated"

**Solution**:
- Verify build command includes: `npm run build && npx prisma generate`
- Check build logs in Vercel deployment details
- Try redeploying with cleared build cache

---

## Monitoring & Maintenance

### View Logs
- **Vercel**: Project > Deployments > Latest > Function Logs
- **Supabase**: Project > Database > Logs

### Database Backups
- Supabase automatically backs up your database daily (Pro plan)
- You can also export database manually from Supabase dashboard

### Update Application
```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin vercel-deployment

# Vercel automatically redeploys on push
```

---

## Cost Estimates

### Supabase
- **Free Tier**: 500MB database, 2GB bandwidth - Perfect for testing
- **Pro**: $25/month - 8GB database, 250GB bandwidth

### Vercel
- **Hobby**: Free - 100GB bandwidth, unlimited sites
- **Pro**: $20/month - Better performance, team features

**Total for Production**: $0-45/month depending on scale

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Summary

You've successfully deployed your Football Results Expectations app! 🎉

✅ Database migrated to Supabase
✅ Backend deployed to Vercel
✅ Frontend deployed to Vercel
✅ Cron jobs configured
✅ All features working in production

Your app is now live and accessible worldwide!
