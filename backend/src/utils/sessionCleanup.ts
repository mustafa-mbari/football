import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean up expired sessions from the database
 * This should be run periodically (e.g., every hour)
 */
export const cleanupExpiredSessions = async () => {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw error;
  }
};

/**
 * Delete all sessions for a specific user
 * Useful for logout from all devices
 */
export const deleteUserSessions = async (userId: number) => {
  try {
    const result = await prisma.session.deleteMany({
      where: { userId }
    });

    console.log(`🧹 Deleted ${result.count} sessions for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Error deleting user sessions:', error);
    throw error;
  }
};

/**
 * Get active session count for a user
 */
export const getUserActiveSessions = async (userId: number) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sessions;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw error;
  }
};

/**
 * Start periodic cleanup of expired sessions
 * Runs every hour by default
 */
export const startSessionCleanupTask = (intervalMs: number = 60 * 60 * 1000) => {
  console.log('🔄 Starting periodic session cleanup task...');

  // Run immediately on startup
  cleanupExpiredSessions();

  // Then run periodically
  setInterval(() => {
    cleanupExpiredSessions();
  }, intervalMs);
};
