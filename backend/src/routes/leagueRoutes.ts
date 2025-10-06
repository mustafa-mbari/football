import { Router } from 'express';
import { getAllLeagues, getLeagueById, getTeamsByLeague } from '../controllers/leagueController';

const router = Router();

router.get('/', getAllLeagues);
router.get('/:id', getLeagueById);
router.get('/:leagueId/teams', getTeamsByLeague);

export default router;
