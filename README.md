# ⚽ Football Predictions Web App

A full-stack web application for predicting football match scores across major European leagues. Users can compete on a global leaderboard based on the accuracy of their predictions.

## 📋 Features

- **Multiple Leagues**: Premier League, Bundesliga, and La Liga (2025/26 season)
- **User Authentication**: Register, login, and manage your account
- **Match Predictions**: Predict scores for upcoming matches
- **Points System**:
  - 3 points for exact score predictions
  - 1 point for correct outcome (win/draw/loss)
  - 0 points for incorrect predictions
- **Leaderboard**: Global rankings based on total points
- **User Profile**: View your prediction history and statistics
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🏗️ Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Cookie-based sessions with bcrypt
- **Port**: 7070

### Frontend
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Port**: 8080

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- PostgreSQL 14+
- npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Football
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Update .env with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/football_predictions?schema=public"
PORT=7070

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:7070`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:7070/api

# Start frontend server
npm run dev
```

Frontend will run on `http://localhost:8080`

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:7070

## 🎮 Test Credentials

After seeding the database, you can use these test accounts:

```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123

Email: bob@example.com
Password: password123
```

## 📊 Database Schema

- **User**: User accounts with authentication
- **League**: Football leagues (Premier League, Bundesliga, La Liga)
- **Team**: Teams participating in each league
- **Match**: Football matches with dates and scores
- **Prediction**: User predictions for matches

## 🎯 Scoring System

The application uses a points-based scoring system:

| Prediction Type | Points | Example |
|----------------|--------|---------|
| Exact Score | 3 | Predicted 2-1, Actual 2-1 |
| Correct Outcome | 1 | Predicted 2-1 (home win), Actual 3-2 (home win) |
| Incorrect | 0 | Predicted 2-1 (home win), Actual 1-2 (away win) |

## 📁 Project Structure

```
Football/
├── backend/                 # Express.js API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # App entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # Next.js app
│   ├── app/
│   │   ├── leagues/       # League pages
│   │   ├── leaderboard/   # Leaderboard page
│   │   ├── login/         # Login page
│   │   ├── profile/       # User profile
│   │   ├── register/      # Registration page
│   │   └── page.tsx       # Homepage
│   ├── components/        # UI components
│   ├── lib/              # API client and utilities
│   ├── .env.local        # Environment variables
│   └── package.json
│
├── PRD.md                 # Product Requirements Document
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/:id` - Get league details

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/:id` - Get match details

### Predictions
- `POST /api/predictions` - Create/update prediction
- `GET /api/predictions/user` - Get user predictions
- `GET /api/predictions/match/:matchId` - Get match predictions

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/stats` - Get user statistics

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run prisma:migrate  # Run migrations
npm run prisma:seed     # Seed database
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start dev server
npm run build  # Build for production
npm start      # Start production server
```

## 📦 Tech Stack

### Backend
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- bcrypt
- cookie-parser
- CORS

### Frontend
- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios

## 🌟 Features Overview

### For Users
1. **Browse Matches**: View upcoming and completed matches across leagues
2. **Make Predictions**: Submit score predictions before matches start
3. **Track Performance**: Monitor your points and accuracy
4. **Compete**: Climb the global leaderboard
5. **View History**: Review all your past predictions

### For Development
1. **Type Safety**: Full TypeScript support
2. **Modern Stack**: Latest versions of Next.js and React
3. **ORM**: Prisma for type-safe database queries
4. **UI Components**: Pre-built components with shadcn/ui
5. **Responsive**: Mobile-first design with Tailwind CSS

## 🔐 Security

- Passwords hashed with bcrypt
- HTTP-only cookies for session management
- CORS configured for frontend origin
- Protected API routes with authentication middleware
- SQL injection prevention via Prisma

## 📝 Future Enhancements

Based on the PRD, potential future improvements include:

- JWT token authentication
- Real-time match updates
- Email notifications
- Admin dashboard
- More leagues and competitions
- Social features (comments, sharing)
- Mobile apps (iOS/Android)
- Live match data integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

Built with Claude Code following the PRD specifications.

## 📞 Support

For issues and questions:
- Check the backend README: `backend/README.md`
- Check the frontend README: `frontend/README.md`
- Review the PRD: `PRD.md`

---

**Enjoy predicting football matches!** ⚽🎯
