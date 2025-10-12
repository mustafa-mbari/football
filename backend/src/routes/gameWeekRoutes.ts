import express from 'express';
import {
  getAllGameWeeks,
  getGameWeeksByLeague,
  getGameWeekDetails,
  getCurrentGameWeek,
  getCurrentGameWeekByStatus,
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

// Optional auth middleware - adds userId if logged in but doesn't require it
const optionalAuth = async (req: any, _res: any, next: any) => {
  try {
    const sessionToken = req.cookies?.sessionToken;

    if (!sessionToken) {
      // No session token, continue without authentication
      return next();
    }

    // Try to authenticate, but don't fail if it doesn't work
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    });

    // If valid session and not expired, attach user info
    if (session && session.expiresAt >= new Date() && session.user.isActive) {
      req.userId = session.userId;
      req.user = session.user;
      req.sessionId = session.id;
    }

    await prisma.$disconnect();
    next();
  } catch (error) {
    // On error, just continue without authentication
    next();
  }
};

// Public routes
router.get('/', getAllGameWeeks);
router.get('/league/:leagueId', getGameWeeksByLeague);
router.get('/league/:leagueId/current', getCurrentGameWeek);
router.get('/league/:leagueId/current-by-status', optionalAuth, getCurrentGameWeekByStatus);
router.get('/:id', optionalAuth, getGameWeekDetails);

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
