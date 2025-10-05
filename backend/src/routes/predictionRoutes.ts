import { Router } from 'express';
import {
  createPrediction,
  getUserPredictions,
  getMatchPredictions,
  updateMatchScore
} from '../controllers/predictionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createPrediction);
router.get('/user', authMiddleware, getUserPredictions);
router.get('/match/:matchId', getMatchPredictions);
router.put('/match/:matchId/score', updateMatchScore); // Admin endpoint

export default router;
