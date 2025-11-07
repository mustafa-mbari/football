/**
 * GET /api/gameweeks/league/[id]/current-by-status
 *
 * Get current gameweek by status (prioritizes IN_PROGRESS, then SCHEDULED)
 * Includes matches with teams and user predictions (if authenticated)
 *
 * Auth is optional - includes user predictions if logged in
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';
import { getCurrentUser } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/gameweeks/league/[id]/current-by-status
 * Get current gameweek (optional auth)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leagueId = parseInt(id);

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

    // Helper function to build the gameweek query
    const buildGameWeekQuery = (status: 'IN_PROGRESS' | 'SCHEDULED') => ({
      where: {
        leagueId,
        status
      },
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        matches: {
          include: {
            match: {
              include: {
                homeTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true }
                },
                awayTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true }
                },
                ...(userId ? {
                  predictions: {
                    where: { userId },
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
        _count: {
          select: { matches: true }
        }
      },
      orderBy: {
        weekNumber: 'asc'
      }
    });

    // First, try to find an IN_PROGRESS gameweek
    let currentGameWeek = await prisma.gameWeek.findFirst(
      buildGameWeekQuery('IN_PROGRESS') as any
    );

    // If no IN_PROGRESS, get the next SCHEDULED gameweek
    if (!currentGameWeek) {
      currentGameWeek = await prisma.gameWeek.findFirst(
        buildGameWeekQuery('SCHEDULED') as any
      );
    }

    if (!currentGameWeek) {
      return NextResponse.json(
        {
          success: false,
          error: 'No current or scheduled gameweek found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: currentGameWeek },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch current gameweek');
  }
}
