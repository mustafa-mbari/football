import { Router } from 'express';
import { getLeaderboard, getUserStats } from '../controllers/leaderboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getLeaderboard);
router.get('/stats', authMiddleware, getUserStats);

export default router;
