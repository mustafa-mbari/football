# Football Predictions - Backend API

Backend API for the Football Predictions web application built with Express.js, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Node.js** v22
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **bcrypt** - Password hashing

## Prerequisites

- Node.js 22.x
- PostgreSQL 14+ installed and running
- npm package manager

## Database Setup

1. Create a PostgreSQL database named `football_predictions`:

```bash
# Using psql
psql -U postgres
CREATE DATABASE football_predictions;
\q
```

2. Update the `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/football_predictions?schema=public"
PORT=7070
NODE_ENV=development
```

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Run database migrations:

```bash
npm run prisma:migrate
```

5. Seed the database with sample data:

```bash
npm run prisma:seed
```

This will populate the database with:
- 3 Leagues (Premier League, Bundesliga, La Liga)
- 58 Teams across all leagues
- Sample matches for the 2025/26 season
- 3 test users

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:7070`

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/:id` - Get league by ID with teams and matches

### Matches
- `GET /api/matches` - Get all matches (query: leagueId, status)
- `GET /api/matches/upcoming` - Get upcoming matches (query: leagueId)
- `GET /api/matches/:id` - Get match by ID

### Predictions
- `POST /api/predictions` - Create/update prediction (requires auth)
- `GET /api/predictions/user` - Get user's predictions (requires auth)
- `GET /api/predictions/match/:matchId` - Get predictions for a match
- `PUT /api/predictions/match/:matchId/score` - Update match score (admin)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (query: leagueId)
- `GET /api/leaderboard/stats` - Get user stats (requires auth)

## Test Users

After seeding, you can use these credentials to login:

```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123

Email: bob@example.com
Password: password123
```

## Database Schema

The application uses the following models:

- **User** - User accounts
- **League** - Football leagues (Premier League, etc.)
- **Team** - Teams in each league
- **Match** - Football matches
- **Prediction** - User predictions for matches

## Scoring System

- **3 points** - Exact score prediction
- **1 point** - Correct outcome (win/draw/loss)
- **0 points** - Incorrect prediction

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma client
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Express middleware
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   └── index.ts              # App entry point
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/football_predictions?schema=public
PORT=7070
NODE_ENV=development
```

## Notes

- The API uses cookie-based authentication (simple session without JWT)
- CORS is enabled for `http://localhost:8080` (frontend)
- All timestamps are stored in UTC
- Match predictions can only be made before the match starts
