import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { startSessionCleanupTask } from './utils/sessionCleanup';

// Import routes
import authRoutes from './routes/authRoutes';
import leagueRoutes from './routes/leagueRoutes';
import teamRoutes from './routes/teamRoutes';
import matchRoutes from './routes/matchRoutes';
import predictionRoutes from './routes/predictionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import weekRoutes from './routes/weekRoutes';
import standingRoutes from './routes/standingRoutes';
import gameWeekRoutes from './routes/gameWeekRoutes';
import syncRoutes from './routes/syncRoutes';
import settingsRoutes from './routes/settingsRoutes';
import pointsRuleRoutes from './routes/pointsRuleRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 7070;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/standings', standingRoutes);
app.use('/api/gameweeks', gameWeekRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/points-rules', pointsRuleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  // Start periodic session cleanup (runs every hour)
  startSessionCleanupTask();
});
