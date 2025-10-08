import express from 'express';
import {
  getAllGameWeeks,
  getGameWeeksByLeague,
  getGameWeekDetails,
  getCurrentGameWeek,
  updateGameWeek,
  updateGameWeekStatus,
  updateTeamGameWeekStats,
  updateStandingsSnapshot,
  assignMatchToGameWeek,
  assignMatchesToGameWeek,
  completeGameWeek,
  createMatchForGameWeek,
  removeMatchFromGameWeek,
  syncMatchesToGameWeeks
} from '../controllers/gameWeekController';

const router = express.Router();

// Public routes
router.get('/', getAllGameWeeks);
router.get('/league/:leagueId', getGameWeeksByLeague);
router.get('/league/:leagueId/current', getCurrentGameWeek);
router.get('/:id', getGameWeekDetails);

// Admin routes (would need auth middleware in production)
router.post('/sync-matches', syncMatchesToGameWeeks);
router.patch('/:id', updateGameWeek);
router.patch('/:id/status', updateGameWeekStatus);
router.put('/:id/complete', completeGameWeek);
router.post('/:id/create-match', createMatchForGameWeek);
router.post('/:id/assign-matches', assignMatchesToGameWeek);
router.put('/:gameWeekId/team/:teamId/stats', updateTeamGameWeekStats);
router.put('/:gameWeekId/team/:teamId/snapshot', updateStandingsSnapshot);
router.post('/assign-match', assignMatchToGameWeek);
router.delete('/:gameWeekId/match/:matchId', removeMatchFromGameWeek);

export default router;
