import express from 'express';
import {
  getCompetitions,
  getTeams,
  getMatches,
  getStandings
} from '../controllers/footballDataApiController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware, adminMiddleware);

// Get available competitions
router.get('/competitions', getCompetitions);

// Get teams for a specific competition
router.get('/competitions/:competitionCode/teams', getTeams);

// Get matches (with various filters)
router.get('/matches', getMatches);
router.get('/competitions/:competitionCode/matches', getMatches);
router.get('/teams/:teamId/matches', getMatches);

// Get standings for a competition
router.get('/competitions/:competitionCode/standings', getStandings);

export default router;
