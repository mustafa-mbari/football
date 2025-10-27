# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Football Results Expectations is a full-stack web application that allows users to predict football match results for multiple leagues (Premier League, La Liga, Bundesliga). Users compete through global and group-based leaderboards that update automatically after each match. The application includes comprehensive admin controls for managing leagues, teams, matches, and user predictions.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT with session-based auth (cookies)

## Development Commands

### Backend (runs on port 7070)
```bash
cd backend
npm run dev              # Start dev server with nodemon
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled JavaScript from dist/
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with test data
```

### Frontend (runs on port 8080)
```bash
cd frontend
npm run dev              # Start Next.js dev server with Turbopack
npm run build            # Build for production with Turbopack
npm start                # Start production server
npm run lint             # Run ESLint
```

### Database Management
```bash
# Reset database (use with caution - deletes all data)
cd backend
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force

# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Push schema changes without migration (development only)
npx prisma db push
```

### Test Credentials (after seeding)
- **Super Admin:** mustafa@example.com / password123
- **Admin:** youssef@example.com / password123
- **Users:** ali@example.com, mohammed@example.com, majid@example.com / password123

## Architecture

### Backend Structure

**Controllers** (`backend/src/controllers/`):
- `authController.ts` - User registration, login, logout, session management
- `predictionController.ts` - Create/update predictions, calculate points
- `groupController.ts` - Group management, member management, leaderboards
- `gameWeekController.ts` - GameWeek tracking, weekly statistics
- `syncController.ts` - Sync match results and recalculate points
- `footballDataApiController.ts` - Integration with external football data API
- `exportController.ts` - Export predictions and results to Excel

**Services** (`backend/src/services/`):
- `pointsUpdateService.ts` - Update group points across multiple leagues and gameweeks

**Routes** (`backend/src/routes/`):
All routes are prefixed with `/api/` and include:
- `/api/auth` - Authentication
- `/api/predictions` - Predictions
- `/api/groups` - Groups
- `/api/gameweeks` - GameWeeks
- `/api/sync` - Match result synchronization
- `/api/football-data` - External API integration
- `/api/export` - Data export

**Database** (`backend/prisma/schema.prisma`):
Complex schema with 25+ models including:
- User management (User, Session, LoginHistory)
- League/Team/Match (with many-to-many TeamLeague relationship)
- Predictions with detailed point tracking
- Groups with league filtering and cross-league support
- GameWeeks with weekly tracking and table snapshots
- Achievements, Notifications, Analytics

### Frontend Structure

**App Router** (`frontend/app/`):
- `/dashboard` - Main prediction interface with gameweek selector
- `/predict` - Renamed from leagues, handles predictions
- `/tables` - League standings
- `/groups` - User groups and private leaderboards
- `/admin` - Admin dashboard for system management
- `/landing` - Landing page
- `/login`, `/register` - Authentication pages

**Components** (`frontend/components/`):
- `Header.tsx` - Main navigation header
- `AdminHeader.tsx` - Admin-specific header
- `LeagueSelector.tsx` - League filtering dropdown
- `ui/` - shadcn/ui components (button, dialog, select, tabs, etc.)
- `admin/` - Admin-specific components

**API Client** (`frontend/lib/api.ts`):
Centralized axios-based API client with typed methods for all backend endpoints. Automatically handles credentials and CORS for both localhost and network access (192.168.178.24).

## Key Features & Concepts

### Points Calculation System
The app uses a sophisticated points system defined in `PointsType` enum:
- **EXACT_HOME_SCORE** - 1 point for exact home team score
- **EXACT_AWAY_SCORE** - 1 point for exact away team score
- **CORRECT_RESULT** - 2 points for correct outcome (win/draw/loss)
- **CORRECT_TOTAL_GOALS** - 2 points for correct total goals sum
- **CORRECT_GOAL_DIFFERENCE** - 1 point for correct goal difference
- **EXACT_SCORE_BONUS** - 3 bonus points for exact score

### Group System
Two types of groups:
1. **Public Groups** - Official league-based groups (e.g., "Premier League Official")
   - Tied to a specific league
   - Can filter by specific teams (allowedTeamIds)

2. **Private Groups** - User-created groups
   - Can be league-specific (leagueId set) or cross-league (leagueId null)
   - Join via unique code
   - Owner-managed

Group members track points per league and per gameweek using JSON fields (`pointsByLeague`, `pointsByGameweek`).

### GameWeek Tracking
The app tracks performance by gameweek:
- `GameWeek` - Defines week boundaries for each league
- `GameWeekMatch` - Links matches to gameweeks (handles postponements)
- `TeamGameWeekStats` - Team performance per gameweek
- `TableSnapshot` - Historical standings after each gameweek

### Match Synchronization
Matches can be synced from external APIs (football-data.org):
- `syncController.ts` handles result synchronization
- Recalculates prediction points after match completion
- Updates group leaderboards automatically

## Important Patterns

### Authentication Flow
1. User logs in via `/api/auth/login`
2. Server creates session with JWT token stored in HTTP-only cookie
3. Frontend includes `withCredentials: true` in all API requests
4. Middleware (`authMiddleware`) validates session on protected routes
5. Session cleanup runs hourly to remove expired sessions

### Prediction Workflow
1. User selects league and gameweek
2. Fetches matches via `/api/matches/upcoming?leagueId=X`
3. Submits predictions via `/api/predictions`
4. Predictions can be updated until match starts (isPredictionLocked check)
5. After match completion, admin/sync triggers point calculation
6. Points update propagates to user stats and group leaderboards

### Group Points Update
When a prediction is scored:
1. `pointsUpdateService.updateGroupPoints()` is called
2. Service finds all groups user belongs to
3. For each group, checks if league matches (or cross-league)
4. Updates `pointsByLeague` and `pointsByGameweek` JSON fields
5. Recalculates `totalPoints` for member ranking

## Database Seeding

The seed system is modular with separate seeder classes:
- `UserSeeder` - Creates test users with different roles
- `LeagueSeeder` - Creates Premier League, La Liga, Bundesliga
- `TeamSeeder` - Creates teams with real logos from premierleague.com/bundesliga.com
- `MatchSeeder` - Creates matches across different statuses
- `GameWeekSeeder` - Creates gameweeks and links matches
- `GroupSeeder` - Creates public and private groups
- `SystemDataSeeder` - Creates points rules, analytics, settings

Run with: `npm run prisma:seed`

## CORS Configuration

The backend allows requests from:
- `http://localhost:8080` (local development)
- `http://192.168.178.24:8080` (network access)
- `http://127.0.0.1:8080`

Frontend API client automatically detects hostname and uses appropriate backend URL.

## Prisma Schema Notes

### Many-to-Many Relationships
- Teams ↔ Leagues via `TeamLeague` junction table
- This allows teams to participate in multiple leagues across seasons
- Use `TeamLeague.isActive` to soft-delete team from league

### JSON Fields for Flexibility
- `GroupMember.pointsByLeague` - Track points per league: `{"1": 30, "2": 20}`
- `GroupMember.pointsByGameweek` - Track weekly points: `{"1": {"1": 5, "2": 8}}`
- `Group.allowedTeamIds` - Array of team IDs for filtering

### Enums
Critical enums to understand:
- `MatchStatus` - SCHEDULED, LIVE, HALF_TIME, FINISHED, POSTPONED, CANCELED
- `PredictionStatus` - NOT_PLAYED_YET, IN_PROGRESS, COMPLETED, SYNCED
- `Role` - SUPER_ADMIN, ADMIN, MODERATOR, USER
- `GroupRole` - OWNER, ADMIN, MEMBER
- `PointsType` - Defines all scoring rules

## Common Workflows

### Adding a New League
1. Create league in database (admin panel or seed)
2. Add teams via `TeamSeeder` or admin panel
3. Link teams to league via `TeamLeague`
4. Create gameweeks for the season
5. Add matches and assign to gameweeks

### Processing Match Results
1. Match status changes to FINISHED
2. Call `/api/sync/match/:id/results` or use admin panel
3. Backend calculates points for all predictions
4. Updates user total points
5. Calls `pointsUpdateService.updateGroupPoints()` for all users
6. Group leaderboards reflect new standings

### Creating a New API Endpoint
1. Define route in appropriate file in `backend/src/routes/`
2. Create controller method in `backend/src/controllers/`
3. Add authentication middleware if needed
4. Add corresponding method in `frontend/lib/api.ts`
5. Use typed parameters and return types

## Notes

- Frontend uses Next.js App Router (not Pages Router)
- All API calls use axios client from `frontend/lib/api.ts`
- Backend runs on port 7070, frontend on port 8080
- Database uses PostgreSQL (connection string in .env)
- Prisma Client is auto-generated - run `prisma generate` after schema changes
- Session cleanup runs automatically every hour via `startSessionCleanupTask()`
