# Football Predictions - Frontend

Frontend web application for Football Predictions built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Axios** - HTTP client

## Prerequisites

- Node.js 22.x
- npm package manager
- Backend API running on `http://localhost:7070`

## Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:7070/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:8080`

### Production Mode

```bash
npm run build
npm start
```

## Features

### 1. Homepage
- View all available leagues (Premier League, Bundesliga, La Liga)
- Quick navigation to league matches
- Responsive grid layout

### 2. League Matches Page
- View upcoming matches for a specific league
- View completed matches with results
- Make predictions for upcoming matches
- Real-time score input with validation

### 3. Authentication
- User registration with email and username
- Login/logout functionality
- Session-based authentication
- Protected routes for authenticated users

### 4. Leaderboard
- Global rankings of all users
- Points-based scoring system
- Medal indicators for top 3 users
- Total predictions count per user

### 5. User Profile
- Personal statistics dashboard
- Prediction history with results
- Points breakdown (exact scores vs correct outcomes)
- Logout functionality

## Pages

- `/` - Homepage with league selection
- `/leagues/[id]` - League matches and predictions
- `/leaderboard` - Global leaderboard
- `/login` - User login
- `/register` - User registration
- `/profile` - User profile and prediction history

## Scoring System

The application uses the following scoring rules:

- 🎯 **3 points** - Exact score prediction (e.g., predicted 2-1, actual 2-1)
- ✓ **1 point** - Correct outcome (e.g., predicted 2-1, actual 3-2, both home wins)
- ✗ **0 points** - Incorrect prediction

## Components

The app uses shadcn/ui components:

- **Button** - Interactive buttons
- **Card** - Content containers
- **Input** - Form inputs
- **Label** - Form labels
- **Select** - Dropdown selects
- **Table** - Data tables
- **Badge** - Status indicators

## API Integration

The frontend communicates with the backend API through Axios:

```typescript
// Example API calls
import { leaguesApi, matchesApi, predictionsApi } from '@/lib/api';

// Get all leagues
const leagues = await leaguesApi.getAll();

// Make a prediction
await predictionsApi.create({
  matchId: 1,
  predictedHomeScore: 2,
  predictedAwayScore: 1
});
```

## Project Structure

```
frontend/
├── app/
│   ├── leagues/
│   │   └── [id]/
│   │       └── page.tsx       # League matches page
│   ├── leaderboard/
│   │   └── page.tsx           # Leaderboard page
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── profile/
│   │   └── page.tsx           # User profile page
│   ├── register/
│   │   └── page.tsx           # Registration page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   └── globals.css            # Global styles
├── components/
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── api.ts                 # API client
│   └── utils.ts               # Utility functions
├── .env.local                 # Environment variables
└── package.json
```

## Styling

The app uses Tailwind CSS with a dark mode support:

- Gradient backgrounds
- Responsive design (mobile, tablet, desktop)
- Dark/light theme compatibility
- Custom color schemes

## User Flow

1. **New User**:
   - Visit homepage
   - Register an account
   - Login
   - Browse leagues
   - Make predictions

2. **Returning User**:
   - Login
   - View profile and stats
   - Make new predictions
   - Check leaderboard rankings

3. **Guest User**:
   - Browse leagues and matches
   - View leaderboard
   - Cannot make predictions (requires login)

## Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm start` - Start production server (port 8080)
- `npm run lint` - Run ESLint

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:7070/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The app uses client-side rendering for dynamic content
- Authentication is cookie-based (matches backend implementation)
- All API calls include credentials for session management
- Match predictions are only allowed before match start time
- Responsive design works on mobile, tablet, and desktop
