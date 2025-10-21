import express from 'express';
import {
  getAvailableTables,
  exportData
} from '../controllers/exportController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Admin only routes for data export
router.get('/tables', authMiddleware, adminMiddleware, getAvailableTables);
router.post('/export', authMiddleware, adminMiddleware, exportData);

export default router;
