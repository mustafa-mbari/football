/**
 * GET /api/leaderboard/stats - Get authenticated user's statistics
 *
 * Returns:
 * - Total predictions
 * - Finished predictions
 * - Total points
 * - Exact scores count
 * - Correct outcomes count
 * - Average points per prediction
 *
 * Auth required
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard/stats
 * Get user statistics
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;

    const predictions = await prisma.prediction.findMany({
      where: { userId: user.id },
      select: {
        totalPoints: true,
        scorePoints: true,
        resultPoints: true,
        match: {
          select: {
            status: true
          }
        }
      }
    });

    const totalPredictions = predictions.length;
    const finishedPredictions = predictions.filter(p => p.match.status === 'FINISHED');
    const totalPoints = predictions.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
    const exactScores = predictions.filter(p => p.scorePoints > 0).length;
    const correctOutcomes = predictions.filter(p => p.resultPoints > 0).length;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalPredictions,
          finishedPredictions: finishedPredictions.length,
          totalPoints,
          exactScores,
          correctOutcomes,
          averagePoints: finishedPredictions.length > 0
            ? (totalPoints / finishedPredictions.length).toFixed(2)
            : '0.00'
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch user stats');
  }
}
