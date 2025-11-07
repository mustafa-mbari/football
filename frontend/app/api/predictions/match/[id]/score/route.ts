/**
 * PUT /api/predictions/match/[id]/score
 *
 * Update match score and process all predictions
 *
 * Body: {
 *   homeScore: number;
 *   awayScore: number;
 *   status?: string; (default: 'FINISHED')
 * }
 *
 * This endpoint:
 * 1. Updates the match with the final score
 * 2. Locks predictions for the match
 * 3. Calculates points for all predictions
 * 4. Updates group points for all users
 *
 * Auth required (Admin only)
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, errorResponse } from '@/lib/middleware/auth';
import { calculatePredictionPoints } from '@/lib/services/pointsCalculation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PUT /api/predictions/match/[id]/score
 * Update match score and process predictions
 */
export async function PUT(
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
    const { homeScore, awayScore, status } = body;

    if (homeScore === undefined || awayScore === undefined) {
      return errorResponse('Home and away scores are required', 400);
    }

    // Get match with league info
    const matchData = await prisma.match.findUnique({
      where: { id: parseInt(id) }
    });

    if (!matchData) {
      return errorResponse('Match not found', 404);
    }

    // Update match
    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      data: {
        homeScore,
        awayScore,
        status: status || 'FINISHED',
        isPredictionLocked: true
      }
    });

    // Get all predictions for this match
    const predictions = await prisma.prediction.findMany({
      where: { matchId: parseInt(id) }
    });

    // Update points for each prediction
    for (const prediction of predictions) {
      const points = calculatePredictionPoints(
        prediction.predictedHomeScore,
        prediction.predictedAwayScore,
        homeScore,
        awayScore
      );

      // Update prediction points
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          totalPoints: points.totalPoints,
          scorePoints: points.scorePoints,
          resultPoints: points.resultPoints,
          isProcessed: true,
          status: 'COMPLETED'
        }
      });

      // Update user total points
      await prisma.user.update({
        where: { id: prediction.userId },
        data: {
          totalPoints: { increment: points.totalPoints }
        }
      });

      // Update group points for this user
      // Find all groups the user belongs to
      const memberships = await prisma.groupMember.findMany({
        where: { userId: prediction.userId },
        include: {
          group: {
            select: {
              id: true,
              leagueId: true
            }
          }
        }
      });

      for (const membership of memberships) {
        const group = membership.group;

        // Check if this prediction applies to the group
        // (either cross-league or league matches)
        if (!group.leagueId || group.leagueId === matchData.leagueId) {
          // Update pointsByLeague
          const pointsByLeague = (membership.pointsByLeague as Record<string, number>) || {};
          const leagueKey = matchData.leagueId.toString();
          pointsByLeague[leagueKey] = (pointsByLeague[leagueKey] || 0) + points.totalPoints;

          // Update pointsByGameweek
          const pointsByGameweek = (membership.pointsByGameweek as Record<string, Record<string, number>>) || {};
          if (matchData.weekNumber) {
            if (!pointsByGameweek[leagueKey]) {
              pointsByGameweek[leagueKey] = {};
            }
            const weekKey = matchData.weekNumber.toString();
            pointsByGameweek[leagueKey][weekKey] = (pointsByGameweek[leagueKey][weekKey] || 0) + points.totalPoints;
          }

          // Update member
          await prisma.groupMember.update({
            where: { id: membership.id },
            data: {
              totalPoints: { increment: points.totalPoints },
              pointsByLeague,
              pointsByGameweek
            }
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: match,
        message: `Updated ${predictions.length} predictions and group points`
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Update match score error:', error);
    return handleError(error, 'Failed to update match score');
  }
}
