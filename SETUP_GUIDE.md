# 🚀 Quick Setup Guide

Follow these steps to get the Football Predictions app running on your machine.

## Step 1: Configure Database

1. Make sure PostgreSQL is running on your machine

2. Update the database connection string in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/football_predictions?schema=public"
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

## Step 2: Setup Backend

Open a terminal and run:

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed

# Start the backend server
npm run dev
```

✅ Backend should now be running on http://localhost:7070

## Step 3: Setup Frontend

Open a **new terminal** window and run:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend server
npm run dev
```

✅ Frontend should now be running on http://localhost:8080

## Step 4: Access the Application

Open your browser and go to: **http://localhost:8080**

## Step 5: Test the App

### Option 1: Create a New Account
1. Click "Login" → "Register here"
2. Fill in your details
3. Login with your new account

### Option 2: Use Test Account
Login with pre-seeded test credentials:
```
Email: john@example.com
Password: password123
```

## What's Included

After seeding, your database will have:

- ✅ **3 Leagues**: Premier League, Bundesliga, La Liga (2025/26 season)
- ✅ **58 Teams**: All teams across the three leagues
- ✅ **49 Matches**: Sample fixtures for each league
- ✅ **3 Test Users**: Ready to use for testing

## Next Steps

1. **Browse Leagues**: Click on a league card on the homepage
2. **Make Predictions**: Enter scores for upcoming matches
3. **Check Leaderboard**: View global rankings
4. **View Profile**: See your prediction history and stats

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify database credentials in `backend/.env`
- Make sure port 7070 is not in use

### Frontend won't start
- Make sure backend is running first
- Check if port 8080 is not in use
- Verify `frontend/.env.local` has correct API URL

### Database errors
```bash
# Reset database if needed
cd backend
npx prisma migrate reset
npm run prisma:seed
```

### CORS errors
- Make sure frontend runs on port 8080
- Backend CORS is configured for http://localhost:8080

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│         Port: 8080                      │
│  ┌─────────────────────────────────┐   │
│  │ - Homepage (League Selection)   │   │
│  │ - League Matches Page           │   │
│  │ - Leaderboard                   │   │
│  │ - Login/Register                │   │
│  │ - User Profile                  │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ HTTP Requests (Axios)
               ▼
┌─────────────────────────────────────────┐
│         Backend API (Express)           │
│         Port: 7070                      │
│  ┌─────────────────────────────────┐   │
│  │ - Auth Routes                   │   │
│  │ - League Routes                 │   │
│  │ - Match Routes                  │   │
│  │ - Prediction Routes             │   │
│  │ - Leaderboard Routes            │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
               ▼
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│         Port: 5432                      │
│  ┌─────────────────────────────────┐   │
│  │ - Users                         │   │
│  │ - Leagues                       │   │
│  │ - Teams                         │   │
│  │ - Matches                       │   │
│  │ - Predictions                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Development Tips

### Run both servers in development mode
You'll need two terminal windows:
- Terminal 1: Backend (`cd backend && npm run dev`)
- Terminal 2: Frontend (`cd frontend && npm run dev`)

### View Database
```bash
cd backend
npx prisma studio
```
This opens a GUI at http://localhost:5555 to browse your database.

### Check API Health
Visit http://localhost:7070/health in your browser.

### Reset Everything
```bash
# Backend
cd backend
rm -rf node_modules
npm install
npx prisma migrate reset
npm run prisma:seed

# Frontend
cd frontend
rm -rf node_modules .next
npm install
```

---

**Happy Coding!** ⚽🎯
