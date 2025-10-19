import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sync all matches to their gameweeks based on weekNumber AND recalculate all tables from ALL finished matches
export const syncMatchesToGameWeeks = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.body;

    if (!leagueId) {
      return res.status(400).json({
        success: false,
        message: 'leagueId is required'
      });
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

    res.json({
      success: true,
      message: `✅ Synced ${synced} matches to gameweeks and recalculated tables from ${processedMatches} finished matches`,
      stats: {
        totalMatches: matches.length,
        matchesSynced: synced,
        matchesSkipped: skipped,
        finishedMatchesProcessed: processedMatches,
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
    const userId = (req as any).userId;

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
                  select: { id: true, name: true, shortName: true, logoUrl: true }
                },
                awayTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true }
                },
                predictions: userId ? {
                  where: {
                    userId: userId
                  },
                  select: {
                    id: true,
                    predictedHomeScore: true,
                    predictedAwayScore: true,
                    totalPoints: true
                  }
                } : false
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
        },
        _count: {
          select: { matches: true }
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

// Get current gameweek by status (IN_PROGRESS, then SCHEDULED)
export const getCurrentGameWeekByStatus = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    const userId = (req as any).userId;

    // First, try to find an IN_PROGRESS gameweek
    let currentGameWeek = await prisma.gameWeek.findFirst({
      where: {
        leagueId: parseInt(leagueId),
        status: 'IN_PROGRESS'
      },
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        matches: {
          include: {
            match: {
              include: {
                homeTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true }
                },
                awayTeam: {
                  select: { id: true, name: true, shortName: true, logoUrl: true }
                },
                predictions: userId ? {
                  where: {
                    userId: userId
                  },
                  select: {
                    id: true,
                    predictedHomeScore: true,
                    predictedAwayScore: true,
                    totalPoints: true
                  }
                } : false
              }
            }
          },
          orderBy: {
            match: {
              matchDate: 'asc'
            }
          }
        },
        _count: {
          select: { matches: true }
        }
      },
      orderBy: {
        weekNumber: 'asc'
      }
    });

    // If no IN_PROGRESS, get the next SCHEDULED gameweek
    if (!currentGameWeek) {
      currentGameWeek = await prisma.gameWeek.findFirst({
        where: {
          leagueId: parseInt(leagueId),
          status: 'SCHEDULED'
        },
        include: {
          league: {
            select: { id: true, name: true, country: true, season: true, logoUrl: true }
          },
          matches: {
            include: {
              match: {
                include: {
                  homeTeam: {
                    select: { id: true, name: true, shortName: true, logoUrl: true }
                  },
                  awayTeam: {
                    select: { id: true, name: true, shortName: true, logoUrl: true }
                  },
                  predictions: userId ? {
                    where: {
                      userId: userId
                    },
                    select: {
                      id: true,
                      predictedHomeScore: true,
                      predictedAwayScore: true,
                      totalPoints: true
                    }
                  } : false
                }
              }
            },
            orderBy: {
              match: {
                matchDate: 'asc'
              }
            }
          },
          _count: {
            select: { matches: true }
          }
        },
        orderBy: {
          weekNumber: 'asc'
        }
      });
    }

    if (!currentGameWeek) {
      return res.status(404).json({
        success: false,
        message: 'No current or scheduled gameweek found'
      });
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
