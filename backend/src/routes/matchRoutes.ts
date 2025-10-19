import { Router } from 'express';
import { getAllMatches, getMatchById, getUpcomingMatches, updateMatch, deleteMatch } from '../controllers/matchController';
import { bulkImportMatches, bulkImportMatchesByID, bulkDeleteScheduledMatches } from '../controllers/bulkMatchController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getAllMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/:id', getMatchById);

// Admin routes
router.patch('/:id', updateMatch);
router.delete('/:id', deleteMatch);

// Bulk import (admin only)
router.post('/bulk-import', authMiddleware, adminMiddleware, bulkImportMatches);
router.post('/bulk-import-by-id', authMiddleware, adminMiddleware, bulkImportMatchesByID);
router.post('/bulk-delete-scheduled', authMiddleware, adminMiddleware, bulkDeleteScheduledMatches);

export default router;
