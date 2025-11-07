/**
 * POST /api/standings/recalculate/[id]
 *
 * Recalculate standings from scratch for a league
 *
 * This endpoint:
 * 1. Deletes all existing standings for the league
 * 2. Processes all finished matches chronologically
 * 3. Calculates team statistics (played, won, drawn, lost, goals, points)
 * 4. Sorts teams by points, goal difference, and goals for
 * 5. Updates form (last 5 matches)
 * 6. Marks all matches as synced
 *
 * Auth required (Admin only)
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/standings/recalculate/[id]
 * Recalculate standings from scratch
 */
export async function POST(
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
    const leagueId = parseInt(id);

    // Clear existing standings for this league
    await prisma.table.deleteMany({
      where: { leagueId }
    });

    // Get all finished matches for this league
    const matches = await prisma.match.findMany({
      where: {
        leagueId,
        status: 'FINISHED',
        homeScore: { not: null },
        awayScore: { not: null }
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: {
        matchDate: 'asc'
      }
    });

    // Calculate standings from scratch
    const teamStats: {
      [teamId: number]: {
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
      };
    } = {};

    for (const match of matches) {
      const homeWin = match.homeScore! > match.awayScore!;
      const awayWin = match.awayScore! > match.homeScore!;
      const draw = match.homeScore === match.awayScore;

      // Initialize team stats if not exists
      if (!teamStats[match.homeTeamId]) {
        teamStats[match.homeTeamId] = {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0
        };
      }
      if (!teamStats[match.awayTeamId]) {
        teamStats[match.awayTeamId] = {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0
        };
      }

      // Update home team stats
      teamStats[match.homeTeamId].played++;
      teamStats[match.homeTeamId].goalsFor += match.homeScore!;
      teamStats[match.homeTeamId].goalsAgainst += match.awayScore!;
      if (homeWin) teamStats[match.homeTeamId].won++;
      if (draw) teamStats[match.homeTeamId].drawn++;
      if (awayWin) teamStats[match.homeTeamId].lost++;

      // Update away team stats
      teamStats[match.awayTeamId].played++;
      teamStats[match.awayTeamId].goalsFor += match.awayScore!;
      teamStats[match.awayTeamId].goalsAgainst += match.homeScore!;
      if (awayWin) teamStats[match.awayTeamId].won++;
      if (draw) teamStats[match.awayTeamId].drawn++;
      if (homeWin) teamStats[match.awayTeamId].lost++;
    }

    // Create new standings entries
    const standings = [];
    for (const [teamId, stats] of Object.entries(teamStats)) {
      const goalDifference = stats.goalsFor - stats.goalsAgainst;
      const points = stats.won * 3 + stats.drawn;

      standings.push({
        leagueId,
        teamId: parseInt(teamId),
        position: 0, // Will be set after sorting
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference,
        points
      });
    }

    // Sort standings
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Assign positions and create all entries in one batch operation
    const tableData = standings.map((standing, index) => ({
      ...standing,
      position: index + 1,
      form: '' // Will be updated in next step
    }));

    if (tableData.length > 0) {
      await prisma.table.createMany({
        data: tableData
      });
    }

    // Calculate form for all teams in parallel (batch queries)
    const formUpdates = await Promise.all(
      standings.map(async (standing) => {
        const recentMatches = await prisma.match.findMany({
          where: {
            leagueId,
            status: 'FINISHED',
            OR: [
              { homeTeamId: standing.teamId },
              { awayTeamId: standing.teamId }
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
            const isHome = m.homeTeamId === standing.teamId;
            const teamScore = isHome ? m.homeScore! : m.awayScore!;
            const opponentScore = isHome ? m.awayScore! : m.homeScore!;

            if (teamScore > opponentScore) return 'W';
            if (teamScore < opponentScore) return 'L';
            return 'D';
          })
          .join('');

        return {
          teamId: standing.teamId,
          form: formString
        };
      })
    );

    // Update form for all teams in parallel
    await Promise.all(
      formUpdates.map((update) =>
        prisma.table.update({
          where: {
            leagueId_teamId: {
              leagueId,
              teamId: update.teamId
            }
          },
          data: { form: update.form }
        })
      )
    );

    // Mark all matches as synced
    await prisma.match.updateMany({
      where: {
        leagueId,
        status: 'FINISHED',
        homeScore: { not: null },
        awayScore: { not: null }
      },
      data: { isSynced: true }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Standings recalculated successfully. Processed ${matches.length} matches for ${standings.length} teams.`,
        data: {
          matchesProcessed: matches.length,
          teamsUpdated: standings.length
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Recalculate standings error:', error);
    return handleError(error, 'Failed to recalculate standings');
  }
}
