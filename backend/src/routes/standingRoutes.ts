import { Router } from 'express';
import { getStandingsByLeague, getAllStandings, recalculateStandings } from '../controllers/standingController';

const router = Router();

router.get('/', getAllStandings);
router.get('/league/:leagueId', getStandingsByLeague);
router.post('/recalculate/:leagueId', recalculateStandings);

export default router;
