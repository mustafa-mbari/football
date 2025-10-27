import { Router } from 'express';
import * as groupController from '../controllers/groupController';
import * as changeRequestController from '../controllers/changeRequestController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All group routes require authentication
router.use(authMiddleware);

// Group management
router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/public', groupController.getPublicGroups);
router.get('/user', groupController.getUserGroups);
router.get('/code/:joinCode', groupController.findGroupByCode);
router.get('/:id', groupController.getGroupDetails);
router.get('/:id/leaderboard', groupController.getGroupLeaderboard);
router.post('/:id/recalculate-points', groupController.recalculateGroupPointsEndpoint);
router.get('/:id/change-requests', changeRequestController.getGroupChangeRequests);
router.post('/:id/join', groupController.joinGroup);
router.delete('/:id/leave', groupController.leaveGroup);
router.put('/:id', groupController.updateGroup);
router.post('/:id/regenerate-code', groupController.regenerateJoinCode);
router.post('/:id/request-change', changeRequestController.createChangeRequest);
router.delete('/:id', groupController.deleteGroup);

export default router;
