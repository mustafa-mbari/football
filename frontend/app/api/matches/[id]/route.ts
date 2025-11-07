/**
 * GET /api/matches/[id] - Get single match
 * PATCH /api/matches/[id] - Update match (admin only)
 * DELETE /api/matches/[id] - Delete match (admin only)
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/matches/[id]
 * Fetch a single match with predictions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = parseInt(params.id);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        matchDate: true,
        weekNumber: true,
        homeScore: true,
        awayScore: true,
        status: true,
        isPredictionLocked: true,
        isSynced: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            code: true,
            season: true,
          },
        },
        predictions: {
          select: {
            id: true,
            predictedHomeScore: true,
            predictedAwayScore: true,
            totalPoints: true,
            isProcessed: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          take: 50,
        },
      },
    });

    if (!match) {
      return errorResponse('Match not found', 404);
    }

    return successResponse(match);
  } catch (error: any) {
    return handleError(error, 'Failed to fetch match');
  }
}

/**
 * PATCH /api/matches/[id]
 * Update a match (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const matchId = parseInt(params.id);
    const body = await request.json();
    const { homeTeamId, awayTeamId, matchDate, status, homeScore, awayScore, weekNumber } =
      body;

    // Get the current match to check if it was synced
    const currentMatch = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!currentMatch) {
      return errorResponse('Match not found', 404);
    }

    // Build update data
    const updateData: any = {};
    if (homeTeamId !== undefined) updateData.homeTeamId = parseInt(homeTeamId);
    if (awayTeamId !== undefined) updateData.awayTeamId = parseInt(awayTeamId);
    if (matchDate) updateData.matchDate = new Date(matchDate);
    if (status) updateData.status = status;
    if (homeScore !== undefined) updateData.homeScore = homeScore !== null ? parseInt(homeScore) : null;
    if (awayScore !== undefined) updateData.awayScore = awayScore !== null ? parseInt(awayScore) : null;
    if (weekNumber !== undefined) updateData.weekNumber = weekNumber !== null ? parseInt(weekNumber) : null;

    // If the match was synced and scores are being changed, mark as unsynced
    const scoresChanged =
      (homeScore !== undefined && homeScore !== currentMatch.homeScore) ||
      (awayScore !== undefined && awayScore !== currentMatch.awayScore);

    if (currentMatch.isSynced && scoresChanged) {
      updateData.isSynced = false;
    }

    const match = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    });

    let message = 'Match updated successfully';
    if (currentMatch.isSynced && scoresChanged) {
      message += '. Match marked as unsynced - please sync again to update tables.';
    }

    return successResponse(match, message);
  } catch (error: any) {
    return handleError(error, 'Failed to update match');
  }
}

/**
 * DELETE /api/matches/[id]
 * Delete a match (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const matchId = parseInt(params.id);

    // First, delete related records
    await prisma.prediction.deleteMany({
      where: { matchId },
    });

    await prisma.gameWeekMatch.deleteMany({
      where: { matchId },
    });

    // Then delete the match
    await prisma.match.delete({
      where: { id: matchId },
    });

    return successResponse(null, 'Match deleted successfully');
  } catch (error: any) {
    return handleError(error, 'Failed to delete match');
  }
}
