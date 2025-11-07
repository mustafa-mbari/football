/**
 * GET /api/admin/stats - Get system statistics
 *
 * Returns overview of system data for admin dashboard
 * Admin only
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, successResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    // Get counts in parallel
    const [
      totalUsers,
      activeUsers,
      totalLeagues,
      totalTeams,
      totalMatches,
      finishedMatches,
      totalPredictions,
      processedPredictions,
      totalGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.league.count(),
      prisma.team.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'FINISHED' } }),
      prisma.prediction.count(),
      prisma.prediction.count({ where: { isProcessed: true } }),
      prisma.group.count(),
    ]);

    // Get recent activity
    const recentPredictions = await prisma.prediction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        match: {
          select: {
            id: true,
            homeTeam: {
              select: {
                name: true,
                shortName: true,
              },
            },
            awayTeam: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        totalPoints: true,
      },
    });

    return successResponse({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        leagues: {
          total: totalLeagues,
        },
        teams: {
          total: totalTeams,
        },
        matches: {
          total: totalMatches,
          finished: finishedMatches,
          upcoming: totalMatches - finishedMatches,
        },
        predictions: {
          total: totalPredictions,
          processed: processedPredictions,
          pending: totalPredictions - processedPredictions,
        },
        groups: {
          total: totalGroups,
        },
      },
      recentActivity: {
        predictions: recentPredictions,
        users: recentUsers,
      },
    });
  } catch (error: any) {
    return handleError(error, 'Failed to fetch admin stats');
  }
}
