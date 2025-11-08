/**
 * POST /api/sync/resync/gameweek/[id] - Re-sync entire gameweek
 *
 * Recalculates TeamGameWeekStats for a specific gameweek only.
 * Does NOT touch the main Table - that stays cumulative across all weeks.
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for complex syncs

/**
 * POST /api/sync/resync/gameweek/[id]
 * Re-sync gameweek statistics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const gameWeekId = parseInt(params.id);

    // Fetch gameweek with all matches
    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: gameWeekId },
      include: {
        matches: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        },
        league: true
      }
    });

    if (!gameWeek) {
      return NextResponse.json(
        { success: false, message: 'GameWeek not found' },
        { status: 404 }
      );
    }

    // Get all finished matches with scores from THIS gameweek only
    const finishedMatches = gameWeek.matches
      .map(gwm => gwm.match)
      .filter(m => m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null);

    if (finishedMatches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No finished matches with scores found in this gameweek'
        },
        { status: 400 }
      );
    }

    // Step 1: Reset ONLY TeamGameWeekStats for this specific gameweek
    await prisma.teamGameWeekStats.deleteMany({
      where: { gameWeekId: gameWeek.id }
    });

    // Step 2: Calculate stats for all teams in memory first
    const teamStats: {
      [teamId: number]: {
        matchesPlayed: number;
        won: number;
        drawn: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        points: number;
        results: string[];
      };
    } = {};

    // Process all matches and accumulate stats
    for (const match of finishedMatches) {
      const homeWin = match.homeScore! > match.awayScore!;
      const awayWin = match.awayScore! > match.homeScore!;
      const draw = match.homeScore === match.awayScore;

      // Initialize team stats if not exists
      if (!teamStats[match.homeTeamId]) {
        teamStats[match.homeTeamId] = {
          matchesPlayed: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          results: []
        };
      }
      if (!teamStats[match.awayTeamId]) {
        teamStats[match.awayTeamId] = {
          matchesPlayed: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          results: []
        };
      }

      // Update home team stats
      teamStats[match.homeTeamId].matchesPlayed++;
      teamStats[match.homeTeamId].goalsFor += match.homeScore!;
      teamStats[match.homeTeamId].goalsAgainst += match.awayScore!;
      teamStats[match.homeTeamId].goalDifference += match.homeScore! - match.awayScore!;
      if (homeWin) {
        teamStats[match.homeTeamId].won++;
        teamStats[match.homeTeamId].points += 3;
        teamStats[match.homeTeamId].results.push('W');
      } else if (draw) {
        teamStats[match.homeTeamId].drawn++;
        teamStats[match.homeTeamId].points += 1;
        teamStats[match.homeTeamId].results.push('D');
      } else {
        teamStats[match.homeTeamId].lost++;
        teamStats[match.homeTeamId].results.push('L');
      }

      // Update away team stats
      teamStats[match.awayTeamId].matchesPlayed++;
      teamStats[match.awayTeamId].goalsFor += match.awayScore!;
      teamStats[match.awayTeamId].goalsAgainst += match.homeScore!;
      teamStats[match.awayTeamId].goalDifference += match.awayScore! - match.homeScore!;
      if (awayWin) {
        teamStats[match.awayTeamId].won++;
        teamStats[match.awayTeamId].points += 3;
        teamStats[match.awayTeamId].results.push('W');
      } else if (draw) {
        teamStats[match.awayTeamId].drawn++;
        teamStats[match.awayTeamId].points += 1;
        teamStats[match.awayTeamId].results.push('D');
      } else {
        teamStats[match.awayTeamId].lost++;
        teamStats[match.awayTeamId].results.push('L');
      }
    }

    // Step 3: Bulk create all team stats in one operation
    const statsToCreate = Object.entries(teamStats).map(([teamId, stats]) => ({
      gameWeekId: gameWeek.id,
      teamId: parseInt(teamId),
      matchesPlayed: stats.matchesPlayed,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      goalDifference: stats.goalDifference,
      points: stats.points,
      result: stats.results.join('')
    }));

    await prisma.teamGameWeekStats.createMany({
      data: statsToCreate
    });

    return NextResponse.json(
      {
        success: true,
        message: `✅ GameWeek ${gameWeek.weekNumber} re-synced! Processed ${finishedMatches.length} finished matches for THIS gameweek only.`,
        data: {
          gameWeekId,
          weekNumber: gameWeek.weekNumber,
          matchesProcessed: finishedMatches.length,
          teamsUpdated: statsToCreate.length
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private'
        }
      }
    );
  } catch (error: any) {
    console.error('Resync gameweek error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to re-sync gameweek',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
