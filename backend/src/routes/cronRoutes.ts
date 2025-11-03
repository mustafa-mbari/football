import { Router, Request, Response } from 'express';
import { cleanupExpiredSessions } from '../utils/sessionCleanup';

const router = Router();

/**
 * Vercel Cron Job Endpoint for Session Cleanup
 * This endpoint should be called by Vercel Cron Jobs hourly
 * Protected by CRON_SECRET environment variable
 */
router.get('/cleanup-sessions', async (req: Request, res: Response) => {
  try {
    // Verify the request is coming from Vercel Cron
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('⚠️ CRON_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Cron secret not configured'
      });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized cron job attempt');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Run the cleanup
    const deletedCount = await cleanupExpiredSessions();

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} expired sessions`,
      deletedCount
    });
  } catch (error: any) {
    console.error('❌ Error in cron cleanup:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cleaning up sessions',
      error: error.message
    });
  }
});

export default router;
