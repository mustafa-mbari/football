import { Router } from 'express';
import { getTeamsByLeague } from '../controllers/leagueController';

const router = Router();

router.get('/league/:leagueId', getTeamsByLeague);

export default router;
