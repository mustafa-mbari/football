import { Router } from 'express';
import {
  getAllLeagues,
  getLeagueById,
  getTeamsByLeague,
  createLeague,
  updateLeague,
  deleteLeague,
  toggleLeagueActive
} from '../controllers/leagueController';

const router = Router();

router.get('/', getAllLeagues);
router.get('/:id', getLeagueById);
router.get('/:leagueId/teams', getTeamsByLeague);
router.post('/', createLeague);
router.put('/:id', updateLeague);
router.delete('/:id', deleteLeague);
router.patch('/:id/toggle-active', toggleLeagueActive);

export default router;
