/**
 * GET /api/leaderboard
 *
 * Fetch global or league-specific leaderboard
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard
 * Query params: leagueId (optional), limit (default: 100, max: 500)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

    let leaderboard;

    if (leagueId) {
      // League-specific leaderboard
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          predictions: {
            some: {
              match: {
                leagueId: parseInt(leagueId),
              },
            },
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          predictions: {
            where: {
              match: {
                leagueId: parseInt(leagueId),
              },
              isProcessed: true,
            },
            select: {
              totalPoints: true,
            },
          },
        },
        orderBy: {
          totalPoints: 'desc',
        },
        take: limit,
      });

      // Calculate league-specific points and add rank
      leaderboard = users
        .map((user) => {
          const leaguePoints = user.predictions.reduce(
            (sum, pred) => sum + (pred.totalPoints || 0),
            0
          );
          return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            totalPoints: leaguePoints,
            totalPredictions: user.predictions.length,
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((user, index) => ({
          rank: index + 1,
          ...user,
        }));
    } else {
      // Global leaderboard using pre-calculated totalPoints
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          totalPredictions: {
            gt: 0,
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          totalPoints: true,
          totalPredictions: true,
        },
        orderBy: {
          totalPoints: 'desc',
        },
        take: limit,
      });

      // Add ranks
      leaderboard = users.map((user, index) => ({
        rank: index + 1,
        ...user,
      }));
    }

    return NextResponse.json(
      {
        success: true,
        data: leaderboard,
        meta: {
          leagueId: leagueId ? parseInt(leagueId) : null,
          limit,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch leaderboard');
  }
}
