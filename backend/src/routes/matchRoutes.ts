import { Router } from 'express';
import { getAllMatches, getMatchById, getUpcomingMatches } from '../controllers/matchController';

const router = Router();

router.get('/', getAllMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/:id', getMatchById);

export default router;
