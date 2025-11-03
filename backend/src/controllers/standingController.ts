import { Request, Response } from 'express';
import prisma from '../config/database';

export const getStandingsByLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    const standings = await prisma.table.findMany({
      where: { leagueId: parseInt(leagueId) },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
            primaryColor: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });

    // Add position/rank to each team
    const standingsWithRank = standings.map((standing: any, index: number) => ({
      ...standing,
      position: index + 1
    }));

    res.json({
      success: true,
      data: standingsWithRank
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllStandings = async (req: Request, res: Response) => {
  try {
    // Get all leagues with their standings in a single optimized query
    const leagues = await prisma.league.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        country: true,
        season: true,
        logoUrl: true
      }
    });

    // Get all standings for all leagues at once
    const allStandings = await prisma.table.findMany({
      where: {
        leagueId: {
          in: leagues.map(l => l.id)
        }
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
            primaryColor: true
          }
        }
      },
      orderBy: [
        { leagueId: 'asc' },
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });

    // Group standings by league
    const standingsByLeague = leagues.map(league => {
      const leagueStandings = allStandings
        .filter(s => s.leagueId === league.id)
        .map((standing, index) => ({
          ...standing,
          position: index + 1
        }));

      return {
        league,
        standings: leagueStandings
      };
    });

    res.json({
      success: true,
      data: standingsByLeague
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Recalculate standings from scratch based on all finished matches
export const recalculateStandings = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    // Clear existing standings for this league
    await prisma.table.deleteMany({
      where: { leagueId: parseInt(leagueId) }
    });

    // Get all finished matches for this league
    const matches = await prisma.match.findMany({
      where: {
        leagueId: parseInt(leagueId),
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
        leagueId: parseInt(leagueId),
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

    await prisma.table.createMany({
      data: tableData
    });

    // Calculate form for all teams in parallel (batch queries)
    const formUpdates = await Promise.all(
      standings.map(async (standing) => {
        const recentMatches = await prisma.match.findMany({
          where: {
            leagueId: parseInt(leagueId),
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
              leagueId: parseInt(leagueId),
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
        leagueId: parseInt(leagueId),
        status: 'FINISHED',
        homeScore: { not: null },
        awayScore: { not: null }
      },
      data: { isSynced: true }
    });

    res.json({
      success: true,
      message: `Standings recalculated successfully. Processed ${matches.length} matches for ${standings.length} teams.`,
      data: {
        matchesProcessed: matches.length,
        teamsUpdated: standings.length
      }
    });
  } catch (error: any) {
    console.error('Recalculate standings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
