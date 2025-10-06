import { Router } from 'express';
import { getStandingsByLeague, getAllStandings } from '../controllers/standingController';

const router = Router();

router.get('/', getAllStandings);
router.get('/league/:leagueId', getStandingsByLeague);

export default router;
