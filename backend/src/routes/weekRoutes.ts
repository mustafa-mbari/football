import { Router } from 'express';
import { getMatchesByWeek, getAvailableWeeks, getCurrentWeek } from '../controllers/weekController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/available', getAvailableWeeks);
router.get('/current', getCurrentWeek);

// Routes that work with or without auth (will include user predictions if authenticated)
router.get('/matches', (req, res, next) => {
  // Try to get userId from cookie, but don't require it
  const userId = req.cookies?.userId;
  if (userId) {
    (req as any).userId = parseInt(userId);
  }
  next();
}, getMatchesByWeek);

export default router;
