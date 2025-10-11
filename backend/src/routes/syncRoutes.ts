import express from 'express';
import { syncMatch, syncGameWeek, resyncGameWeek } from '../controllers/syncController';

const router = express.Router();

// Sync individual match
router.post('/match/:matchId', syncMatch);

// Sync entire gameweek
router.post('/gameweek/:gameWeekId', syncGameWeek);

// Re-sync entire gameweek (reset and recalculate all data)
router.post('/resync/gameweek/:gameWeekId', resyncGameWeek);

export default router;
