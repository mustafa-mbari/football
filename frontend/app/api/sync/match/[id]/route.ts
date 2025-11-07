/**
 * POST /api/sync/match/[id] - Sync match results and update standings
 *
 * Syncs a finished match:
 * 1. Updates league standings/table
 * 2. Processes predictions and awards points
 * 3. Updates team form
 * 4. Updates user statistics
 *
 * Admin only
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  verifyAdmin,
  handleError,
  successResponse,
  errorResponse,
} from '@/lib/middleware/auth';
import {
  processPredictionsForMatch,
  updateTeamForm,
  recalculateLeaguePositions,
} from '@/lib/services/pointsCalculation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/sync/match/[id]
 * Sync a single match (admin only)
 */
export async function POST(
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

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    });

    if (!match) {
      return errorResponse('Match not found', 404);
    }

    if (
      match.status !== 'FINISHED' ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      return errorResponse(
        'Match must be finished with scores entered to sync',
        400
      );
    }

    // Check if already synced
    if (match.isSynced) {
      return errorResponse(
        'Match has already been synced. Cannot sync again to prevent duplicate data.',
        400
      );
    }

    // 1. Calculate match result
    const homeWin = match.homeScore > match.awayScore;
    const awayWin = match.awayScore > match.homeScore;
    const draw = match.homeScore === match.awayScore;

    // 2. Update Standings (upsert for both teams)
    await prisma.table.upsert({
      where: {
        leagueId_teamId: {
          leagueId: match.leagueId,
          teamId: match.homeTeamId,
        },
      },
      update: {
        played: { increment: 1 },
        won: homeWin ? { increment: 1 } : undefined,
        drawn: draw ? { increment: 1 } : undefined,
        lost: awayWin ? { increment: 1 } : undefined,
        goalsFor: { increment: match.homeScore },
        goalsAgainst: { increment: match.awayScore },
        goalDifference: { increment: match.homeScore - match.awayScore },
        points: { increment: homeWin ? 3 : draw ? 1 : 0 },
      },
      create: {
        leagueId: match.leagueId,
        teamId: match.homeTeamId,
        position: 0,
        played: 1,
        won: homeWin ? 1 : 0,
        drawn: draw ? 1 : 0,
        lost: awayWin ? 1 : 0,
        goalsFor: match.homeScore,
        goalsAgainst: match.awayScore,
        goalDifference: match.homeScore - match.awayScore,
        points: homeWin ? 3 : draw ? 1 : 0,
      },
    });

    await prisma.table.upsert({
      where: {
        leagueId_teamId: {
          leagueId: match.leagueId,
          teamId: match.awayTeamId,
        },
      },
      update: {
        played: { increment: 1 },
        won: awayWin ? { increment: 1 } : undefined,
        drawn: draw ? { increment: 1 } : undefined,
        lost: homeWin ? { increment: 1 } : undefined,
        goalsFor: { increment: match.awayScore },
        goalsAgainst: { increment: match.homeScore },
        goalDifference: { increment: match.awayScore - match.homeScore },
        points: { increment: awayWin ? 3 : draw ? 1 : 0 },
      },
      create: {
        leagueId: match.leagueId,
        teamId: match.awayTeamId,
        position: 0,
        played: 1,
        won: awayWin ? 1 : 0,
        drawn: draw ? 1 : 0,
        lost: homeWin ? 1 : 0,
        goalsFor: match.awayScore,
        goalsAgainst: match.homeScore,
        goalDifference: match.awayScore - match.homeScore,
        points: awayWin ? 3 : draw ? 1 : 0,
      },
    });

    // 3. Update team form (last 5 matches)
    await Promise.all([
      updateTeamForm(match.leagueId, match.homeTeamId),
      updateTeamForm(match.leagueId, match.awayTeamId),
    ]);

    // 4. Recalculate league positions
    await recalculateLeaguePositions(match.leagueId);

    // 5. Process predictions and award points
    const { predictionsProcessed, usersUpdated } =
      await processPredictionsForMatch(matchId);

    // 6. Mark match as synced
    await prisma.match.update({
      where: { id: matchId },
      data: { isSynced: true },
    });

    return successResponse(
      {
        matchId,
        predictionsProcessed,
        usersUpdated,
      },
      `Match synced successfully. Processed ${predictionsProcessed} predictions.`
    );
  } catch (error: any) {
    return handleError(error, 'Failed to sync match');
  }
}
