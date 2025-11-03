import { Router } from 'express';
import { getStandingsByLeague, getAllStandings, recalculateStandings } from '../controllers/standingController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllStandings);
router.get('/league/:leagueId', getStandingsByLeague);
router.post('/recalculate/:leagueId', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), recalculateStandings);

export default router;
