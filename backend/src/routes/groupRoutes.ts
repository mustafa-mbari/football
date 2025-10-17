import { Router } from 'express';
import * as groupController from '../controllers/groupController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All group routes require authentication
router.use(authMiddleware);

// Group management
router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/public', groupController.getPublicGroups);
router.get('/user', groupController.getUserGroups);
router.get('/:id', groupController.getGroupDetails);
router.get('/:id/leaderboard', groupController.getGroupLeaderboard);
router.post('/:id/join', groupController.joinGroup);
router.delete('/:id/leave', groupController.leaveGroup);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

export default router;
