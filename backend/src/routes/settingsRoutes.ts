import express from 'express';
import {
  getSetting,
  getAllSettings,
  upsertSetting,
  deleteSetting
} from '../controllers/settingsController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Public route to get specific setting
router.get('/:key', getSetting);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllSettings);
router.put('/:key', authMiddleware, adminMiddleware, upsertSetting);
router.delete('/:key', authMiddleware, adminMiddleware, deleteSetting);

export default router;
