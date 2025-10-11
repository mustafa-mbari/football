import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sync all matches to their gameweeks based on weekNumber
export const syncMatchesToGameWeeks = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.body;

    // Get all matches for the league
    const matches = await prisma.match.findMany({
      where: leagueId ? { leagueId: parseInt(leagueId) } : {},
      select: {
        id: true,
        weekNumber: true,
        leagueId: true,
      },
    });

    // Get all gameweeks
    const gameWeeks = await prisma.gameWeek.findMany({
      where: leagueId ? { leagueId: parseInt(leagueId) } : {},
      select: {
        id: true,
        weekNumber: true,
        leagueId: true,
      },
    });

    let synced = 0;
    let skipped = 0;
    const errors: string[] = [];

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

    res.json({
      success: true,
      message: `Synced ${synced} matches to gameweeks`,
      stats: {
        total: matches.length,
        synced,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('Sync matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all gameweeks for a league
export const getGameWeeksByLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    const gameWeeks = await prisma.gameWeek.findMany({
      where: { leagueId: parseInt(leagueId) },
      orderBy: { weekNumber: 'asc' },
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        _count: {
          select: { matches: true }
        }
      }
    });

    res.json({ success: true, data: gameWeeks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific gameweek with all details
export const getGameWeekDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(id) },
      include: {
        league: true,
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
        teamStats: {
          include: {
            team: {
              select: { id: true, name: true, shortName: true, logoUrl: true }
            }
          },
          orderBy: { points: 'desc' }
        },
        snapshots: {
          include: {
            team: {
              select: { id: true, name: true, shortName: true, logoUrl: true }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!gameWeek) {
      return res.status(404).json({ success: false, message: 'GameWeek not found' });
    }

    res.json({ success: true, data: gameWeek });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current gameweek for a league
export const getCurrentGameWeek = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    const currentGameWeek = await prisma.gameWeek.findFirst({
      where: {
        leagueId: parseInt(leagueId),
        isCurrent: true
      },
      include: {
        league: true,
        matches: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        }
      }
    });

    if (!currentGameWeek) {
      return res.status(404).json({ success: false, message: 'No current gameweek found' });
    }

    res.json({ success: true, data: currentGameWeek });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update gameweek (Admin only)
export const updateGameWeek = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, status, isCurrent } = req.body;

    // If setting this as current, unset all others in the league
    if (isCurrent) {
      const gameWeek = await prisma.gameWeek.findUnique({
        where: { id: parseInt(id) }
      });

      if (gameWeek) {
        await prisma.gameWeek.updateMany({
          where: { leagueId: gameWeek.leagueId },
          data: { isCurrent: false }
        });
      }
    }

    const updateData: any = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (status) updateData.status = status;
    if (isCurrent !== undefined) updateData.isCurrent = isCurrent;

    const updatedGameWeek = await prisma.gameWeek.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ success: true, data: updatedGameWeek });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update gameweek status (Admin only) - deprecated, use updateGameWeek instead
export const updateGameWeekStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isCurrent } = req.body;

    // If setting this as current, unset all others in the league
    if (isCurrent) {
      const gameWeek = await prisma.gameWeek.findUnique({
        where: { id: parseInt(id) }
      });

      if (gameWeek) {
        await prisma.gameWeek.updateMany({
          where: { leagueId: gameWeek.leagueId },
          data: { isCurrent: false }
        });
      }
    }

    const updatedGameWeek = await prisma.gameWeek.update({
      where: { id: parseInt(id) },
      data: { status, isCurrent }
    });

    res.json({ success: true, data: updatedGameWeek });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update team gameweek stats (Admin only)
export const updateTeamGameWeekStats = async (req: Request, res: Response) => {
  try {
    const { gameWeekId, teamId } = req.params;
    const { matchesPlayed, won, drawn, lost, goalsFor, goalsAgainst, result } = req.body;

    const goalDifference = goalsFor - goalsAgainst;
    const points = (won * 3) + (drawn * 1);

    const stats = await prisma.teamGameWeekStats.upsert({
      where: {
        gameWeekId_teamId: {
          gameWeekId: parseInt(gameWeekId),
          teamId: parseInt(teamId)
        }
      },
      update: {
        matchesPlayed,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        result
      },
      create: {
        gameWeekId: parseInt(gameWeekId),
        teamId: parseInt(teamId),
        matchesPlayed,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        result
      },
      include: {
        team: true
      }
    });

    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create/Update standings snapshot for a gameweek (Admin only)
export const updateStandingsSnapshot = async (req: Request, res: Response) => {
  try {
    const { gameWeekId, teamId } = req.params;
    const { position, played, won, drawn, lost, goalsFor, goalsAgainst, points, form } = req.body;

    const goalDifference = goalsFor - goalsAgainst;

    const snapshot = await prisma.tableSnapshot.upsert({
      where: {
        gameWeekId_teamId: {
          gameWeekId: parseInt(gameWeekId),
          teamId: parseInt(teamId)
        }
      },
      update: {
        position,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        form
      },
      create: {
        gameWeekId: parseInt(gameWeekId),
        teamId: parseInt(teamId),
        position,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        form
      },
      include: {
        team: true
      }
    });

    res.json({ success: true, data: snapshot });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign match to gameweek (Admin only)
export const assignMatchToGameWeek = async (req: Request, res: Response) => {
  try {
    const { gameWeekId, matchId } = req.body;

    const gameWeekMatch = await prisma.gameWeekMatch.create({
      data: {
        gameWeekId: parseInt(gameWeekId),
        matchId: parseInt(matchId)
      },
      include: {
        gameWeek: true,
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    res.json({ success: true, data: gameWeekMatch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove match from gameweek (Admin only - for postponements)
export const removeMatchFromGameWeek = async (req: Request, res: Response) => {
  try {
    const { gameWeekId, matchId } = req.params;

    await prisma.gameWeekMatch.delete({
      where: {
        gameWeekId_matchId: {
          gameWeekId: parseInt(gameWeekId),
          matchId: parseInt(matchId)
        }
      }
    });

    // Update match to mark as postponed
    await prisma.match.update({
      where: { id: parseInt(matchId) },
      data: {
        isPostponed: true,
        originalWeekNumber: parseInt(gameWeekId)
      }
    });

    res.json({ success: true, message: 'Match removed from gameweek' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign multiple matches to gameweek (Admin only)
export const assignMatchesToGameWeek = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { matchIds } = req.body;

    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return res.status(400).json({ success: false, message: 'matchIds array is required' });
    }

    // Create multiple GameWeekMatch entries
    const gameWeekMatches = await Promise.all(
      matchIds.map((matchId: number) =>
        prisma.gameWeekMatch.create({
          data: {
            gameWeekId: parseInt(id),
            matchId: matchId
          }
        })
      )
    );

    res.json({ success: true, data: gameWeekMatches, message: `${matchIds.length} match(es) assigned successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete a gameweek (Admin only)
export const completeGameWeek = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedGameWeek = await prisma.gameWeek.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED' }
    });

    res.json({ success: true, data: updatedGameWeek, message: 'GameWeek marked as completed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new match and assign to gameweek (Admin only)
export const createMatchForGameWeek = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { homeTeamId, awayTeamId, matchDate, status, isPostponed } = req.body;

    // Get gameweek details
    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(id) },
      include: { league: true }
    });

    if (!gameWeek) {
      return res.status(404).json({ success: false, message: 'GameWeek not found' });
    }

    // Get home team to get venue
    const homeTeam = await prisma.team.findUnique({
      where: { id: parseInt(homeTeamId) }
    });

    if (!homeTeam) {
      return res.status(404).json({ success: false, message: 'Home team not found' });
    }

    // Create the match
    const match = await prisma.match.create({
      data: {
        leagueId: gameWeek.leagueId,
        homeTeamId: parseInt(homeTeamId),
        awayTeamId: parseInt(awayTeamId),
        matchDate: new Date(matchDate),
        status: status || 'SCHEDULED',
        weekNumber: gameWeek.weekNumber,
        isPostponed: isPostponed || false
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      }
    });

    // Assign match to gameweek
    const gameWeekMatch = await prisma.gameWeekMatch.create({
      data: {
        gameWeekId: parseInt(id),
        matchId: match.id
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    res.json({ success: true, data: gameWeekMatch, message: 'Match created and assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all gameweeks across all leagues
export const getAllGameWeeks = async (req: Request, res: Response) => {
  try {
    const gameWeeks = await prisma.gameWeek.findMany({
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        _count: {
          select: { matches: true, teamStats: true }
        }
      },
      orderBy: [
        { leagueId: 'asc' },
        { weekNumber: 'asc' }
      ]
    });

    res.json({ success: true, data: gameWeeks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
