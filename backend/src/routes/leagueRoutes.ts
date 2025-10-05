import { Router } from 'express';
import { getAllLeagues, getLeagueById } from '../controllers/leagueController';

const router = Router();

router.get('/', getAllLeagues);
router.get('/:id', getLeagueById);

export default router;
