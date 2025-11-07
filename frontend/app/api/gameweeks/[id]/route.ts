/**
 * GET /api/gameweeks/[id] - Get gameweek details with matches
 *
 * Returns gameweek with:
 * - League info
 * - Matches with teams and user predictions (if authenticated)
 * - Team stats
 * - Table snapshots
 * - Match counts
 *
 * Auth optional (includes user predictions if authenticated)
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { handleError, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/gameweeks/[id]
 * Get gameweek details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Optional auth - get userId if available
    let userId: number | undefined;
    try {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Not authenticated, continue without userId
    }

    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(id) },
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        matches: {
          include: {
            match: {
              include: {
                homeTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true, code: true }
                },
                awayTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true, code: true }
                },
                ...(userId ? {
                  predictions: {
                    where: {
                      userId: userId
                    },
                    select: {
                      id: true,
                      predictedHomeScore: true,
                      predictedAwayScore: true,
                      totalPoints: true
                    }
                  }
                } : {})
              }
            }
          },
          orderBy: {
            match: {
              matchDate: 'asc'
            }
          }
        },
        teamStats: {
          include: {
            team: {
              select: { id: true, name: true, shortName: true, logoUrl: true, code: true }
            }
          },
          orderBy: { points: 'desc' }
        },
        snapshots: {
          include: {
            team: {
              select: { id: true, name: true, shortName: true, logoUrl: true, code: true }
            }
          },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { matches: true }
        }
      }
    });

    if (!gameWeek) {
      return errorResponse('GameWeek not found', 404);
    }

    return NextResponse.json(
      { success: true, data: gameWeek },
      {
        status: 200,
        headers: {
          'Cache-Control': userId ? 'private, max-age=60' : 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch gameweek details');
  }
}
