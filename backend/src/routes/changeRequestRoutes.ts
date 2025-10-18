import { Router } from 'express';
import * as changeRequestController from '../controllers/changeRequestController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all change requests (admin only)
router.get('/', adminMiddleware, changeRequestController.getAllChangeRequests);

// Approve/reject change requests (admin only)
router.post('/:id/approve', adminMiddleware, changeRequestController.approveChangeRequest);
router.post('/:id/reject', adminMiddleware, changeRequestController.rejectChangeRequest);

export default router;
