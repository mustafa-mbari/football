/**
 * POST /api/gameweeks/sync-matches
 *
 * Sync all matches to their gameweeks based on weekNumber
 * AND recalculate all tables from ALL finished matches
 *
 * Body: { leagueId: number }
 *
 * This endpoint:
 * 1. Links matches to gameweeks based on weekNumber
 * 2. Resets all standings for the league
 * 3. Recalculates standings from all finished matches
 * 4. Updates team form
 * 5. Recalculates positions
 *
 * Auth required (Admin only)
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/gameweeks/sync-matches
 * Sync matches to gameweeks and recalculate standings
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { leagueId } = body;

    if (!leagueId) {
      return errorResponse('leagueId is required', 400);
    }

    const parsedLeagueId = parseInt(leagueId);

    // Step 1: Get all matches for the league
    const matches = await prisma.match.findMany({
      where: { leagueId: parsedLeagueId },
      select: {
        id: true,
        weekNumber: true,
        leagueId: true,
      },
    });

    // Get all gameweeks
    const gameWeeks = await prisma.gameWeek.findMany({
      where: { leagueId: parsedLeagueId },
      select: {
        id: true,
        weekNumber: true,
        leagueId: true,
      },
    });

    let synced = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Sync matches to gameweeks
    for (const match of matches) {
      if (!match.weekNumber) {
        skipped++;
        continue;
      }

      // Find the corresponding gameweek
      const gameWeek = gameWeeks.find(
        (gw) => gw.weekNumber === match.weekNumber && gw.leagueId === match.leagueId
      );

      if (!gameWeek) {
        errors.push(`No gameweek found for match ${match.id}, week ${match.weekNumber}, league ${match.leagueId}`);
        skipped++;
        continue;
      }

      // Create GameWeekMatch entry if it doesn't exist
      try {
        await prisma.gameWeekMatch.upsert({
          where: {
            gameWeekId_matchId: {
              gameWeekId: gameWeek.id,
              matchId: match.id,
            },
          },
          create: {
            gameWeekId: gameWeek.id,
            matchId: match.id,
            isSynced: true,
          },
          update: {
            isSynced: true,
          },
        });
        synced++;
      } catch (error: any) {
        errors.push(`Failed to sync match ${match.id}: ${error.message}`);
        skipped++;
      }
    }

    // Step 2: Reset ALL table data for the league
    await prisma.table.updateMany({
      where: { leagueId: parsedLeagueId },
      data: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: null
      }
    });

    // Step 3: Get ALL finished matches across ALL gameweeks for this league
    const allFinishedMatches = await prisma.match.findMany({
      where: {
        leagueId: parsedLeagueId,
        status: 'FINISHED',
        homeScore: { not: null },
        awayScore: { not: null }
      },
      orderBy: { matchDate: 'asc' }
    });

    // Step 4: Recalculate table standings from ALL finished matches
    let processedMatches = 0;
    for (const match of allFinishedMatches) {
      const homeWin = match.homeScore! > match.awayScore!;
      const awayWin = match.awayScore! > match.homeScore!;
      const draw = match.homeScore === match.awayScore;

      // Update home team
      await prisma.table.upsert({
        where: { leagueId_teamId: { leagueId: parsedLeagueId, teamId: match.homeTeamId } },
        update: {
          played: { increment: 1 },
          won: homeWin ? { increment: 1 } : undefined,
          drawn: draw ? { increment: 1 } : undefined,
          lost: awayWin ? { increment: 1 } : undefined,
          goalsFor: { increment: match.homeScore! },
          goalsAgainst: { increment: match.awayScore! },
          goalDifference: { increment: match.homeScore! - match.awayScore! },
          points: { increment: homeWin ? 3 : draw ? 1 : 0 }
        },
        create: {
          leagueId: parsedLeagueId,
          teamId: match.homeTeamId,
          position: 0,
          played: 1,
          won: homeWin ? 1 : 0,
          drawn: draw ? 1 : 0,
          lost: awayWin ? 1 : 0,
          goalsFor: match.homeScore!,
          goalsAgainst: match.awayScore!,
          goalDifference: match.homeScore! - match.awayScore!,
          points: homeWin ? 3 : draw ? 1 : 0
        }
      });

      // Update away team
      await prisma.table.upsert({
        where: { leagueId_teamId: { leagueId: parsedLeagueId, teamId: match.awayTeamId } },
        update: {
          played: { increment: 1 },
          won: awayWin ? { increment: 1 } : undefined,
          drawn: draw ? { increment: 1 } : undefined,
          lost: homeWin ? { increment: 1 } : undefined,
          goalsFor: { increment: match.awayScore! },
          goalsAgainst: { increment: match.homeScore! },
          goalDifference: { increment: match.awayScore! - match.homeScore! },
          points: { increment: awayWin ? 3 : draw ? 1 : 0 }
        },
        create: {
          leagueId: parsedLeagueId,
          teamId: match.awayTeamId,
          position: 0,
          played: 1,
          won: awayWin ? 1 : 0,
          drawn: draw ? 1 : 0,
          lost: homeWin ? 1 : 0,
          goalsFor: match.awayScore!,
          goalsAgainst: match.homeScore!,
          goalDifference: match.awayScore! - match.homeScore!,
          points: awayWin ? 3 : draw ? 1 : 0
        }
      });

      processedMatches++;
    }

    // Step 5: Update form for all teams
    const allTeams = await prisma.table.findMany({
      where: { leagueId: parsedLeagueId },
      select: { teamId: true }
    });

    for (const team of allTeams) {
      const recentMatches = await prisma.match.findMany({
        where: {
          leagueId: parsedLeagueId,
          status: 'FINISHED',
          OR: [
            { homeTeamId: team.teamId },
            { awayTeamId: team.teamId }
          ],
          homeScore: { not: null },
          awayScore: { not: null }
        },
        orderBy: { matchDate: 'desc' },
        take: 5
      });

      const formString = recentMatches
        .reverse()
        .map((m) => {
          const isHome = m.homeTeamId === team.teamId;
          const teamScore = isHome ? m.homeScore! : m.awayScore!;
          const opponentScore = isHome ? m.awayScore! : m.homeScore!;

          if (teamScore > opponentScore) return 'W';
          if (teamScore < opponentScore) return 'L';
          return 'D';
        })
        .join('');

      await prisma.table.updateMany({
        where: {
          leagueId: parsedLeagueId,
          teamId: team.teamId
        },
        data: { form: formString }
      });
    }

    // Step 6: Recalculate positions
    const allStandings = await prisma.table.findMany({
      where: { leagueId: parsedLeagueId },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });

    for (let i = 0; i < allStandings.length; i++) {
      await prisma.table.update({
        where: { id: allStandings[i].id },
        data: { position: i + 1 }
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `✅ Synced ${synced} matches to gameweeks and recalculated tables from ${processedMatches} finished matches`,
        stats: {
          totalMatches: matches.length,
          matchesSynced: synced,
          matchesSkipped: skipped,
          finishedMatchesProcessed: processedMatches,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Sync matches error:', error);
    return handleError(error, 'Failed to sync matches');
  }
}
