import express from 'express';
import { syncMatch, syncGameWeek } from '../controllers/syncController';

const router = express.Router();

// Sync individual match
router.post('/match/:matchId', syncMatch);

// Sync entire gameweek
router.post('/gameweek/:gameWeekId', syncGameWeek);

export default router;
