/**
 * GET /api/gameweeks/[id] - Get gameweek details with matches
 * PATCH /api/gameweeks/[id] - Update gameweek (admin only)
 *
 * Returns gameweek with:
 * - League info
 * - Matches with teams and user predictions (if authenticated)
 * - Team stats
 * - Table snapshots
 * - Match counts
 *
 * Auth optional for GET (includes user predictions if authenticated)
 * Auth required (admin) for PATCH
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { handleError, errorResponse, verifyAdmin } from '@/lib/middleware/auth';

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
          // No caching for authenticated users to show fresh predictions
          'Cache-Control': userId ? 'private, no-cache, must-revalidate' : 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch gameweek details');
  }
}

/**
 * PATCH /api/gameweeks/[id]
 * Update gameweek (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate, status, isCurrent } = body;

    const updateData: any = {};
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;
    if (isCurrent !== undefined) updateData.isCurrent = isCurrent;

    const gameWeek = await prisma.gameWeek.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: gameWeek,
        message: 'GameWeek updated successfully'
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to update gameweek');
  }
}
