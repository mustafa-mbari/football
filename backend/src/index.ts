import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';

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
import groupRoutes from './routes/groupRoutes';
import changeRequestRoutes from './routes/changeRequestRoutes';
import footballDataApiRoutes from './routes/footballDataApiRoutes';
import exportRoutes from './routes/exportRoutes';
import cronRoutes from './routes/cronRoutes';


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 7070;

// Middleware
// CORS configuration for development and production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || '',
      // Allow Vercel preview deployments
      /^https:\/\/.*\.vercel\.app$/
    ]
  : [
      'http://localhost:8080',
      'http://192.168.178.24:8080',
      'http://127.0.0.1:8080'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/groups', groupRoutes);
app.use('/api/change-requests', changeRequestRoutes);
app.use('/api/football-data', footballDataApiRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/cron', cronRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Export app for Vercel serverless
export default app;

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}
