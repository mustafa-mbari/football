import { Router } from 'express';
import { getStandingsByLeague, getAllStandings, recalculateStandings } from '../controllers/standingController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getAllStandings);
router.get('/league/:leagueId', getStandingsByLeague);
router.post('/recalculate/:leagueId', authMiddleware, adminMiddleware, recalculateStandings);

export default router;
