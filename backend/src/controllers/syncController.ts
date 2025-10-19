import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sync a single match - update standings, stats, predictions
export const syncMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: parseInt(matchId) },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        predictions: {
          include: {
            user: true
          }
        },
        gameWeekMatches: {
          include: {
            gameWeek: true
          }
        }
      }
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) {
      return res.status(400).json({
        success: false,
        message: 'Match must be finished with scores entered to sync'
      });
    }

    // Check if already synced
    if (match.isSynced) {
      return res.status(400).json({
        success: false,
        message: 'Match has already been synced. Cannot sync again to prevent duplicate data.'
      });
    }

    // 1. Calculate match result
    const homeWin = match.homeScore > match.awayScore;
    const awayWin = match.awayScore > match.homeScore;
    const draw = match.homeScore === match.awayScore;

    // 2. Update Standings
    const homeStanding = await prisma.table.upsert({
      where: {
        leagueId_teamId: {
          leagueId: match.leagueId,
          teamId: match.homeTeamId
        }
      },
      update: {
        played: { increment: 1 },
        won: homeWin ? { increment: 1 } : undefined,
        drawn: draw ? { increment: 1 } : undefined,
        lost: awayWin ? { increment: 1 } : undefined,
        goalsFor: { increment: match.homeScore },
        goalsAgainst: { increment: match.awayScore },
        goalDifference: { increment: match.homeScore - match.awayScore },
        points: { increment: homeWin ? 3 : draw ? 1 : 0 }
      },
      create: {
        leagueId: match.leagueId,
        teamId: match.homeTeamId,
        position: 0, // Will be recalculated
        played: 1,
        won: homeWin ? 1 : 0,
        drawn: draw ? 1 : 0,
        lost: awayWin ? 1 : 0,
        goalsFor: match.homeScore,
        goalsAgainst: match.awayScore,
        goalDifference: match.homeScore - match.awayScore,
        points: homeWin ? 3 : draw ? 1 : 0
      }
    });

    const awayStanding = await prisma.table.upsert({
      where: {
        leagueId_teamId: {
          leagueId: match.leagueId,
          teamId: match.awayTeamId
        }
      },
      update: {
        played: { increment: 1 },
        won: awayWin ? { increment: 1 } : undefined,
        drawn: draw ? { increment: 1 } : undefined,
        lost: homeWin ? { increment: 1 } : undefined,
        goalsFor: { increment: match.awayScore },
        goalsAgainst: { increment: match.homeScore },
        goalDifference: { increment: match.awayScore - match.homeScore },
        points: { increment: awayWin ? 3 : draw ? 1 : 0 }
      },
      create: {
        leagueId: match.leagueId,
        teamId: match.awayTeamId,
        position: 0, // Will be recalculated
        played: 1,
        won: awayWin ? 1 : 0,
        drawn: draw ? 1 : 0,
        lost: homeWin ? 1 : 0,
        goalsFor: match.awayScore,
        goalsAgainst: match.homeScore,
        goalDifference: match.awayScore - match.homeScore,
        points: awayWin ? 3 : draw ? 1 : 0
      }
    });

    // 3. Update TeamGameWeekStats if match belongs to a gameweek
    if (match.gameWeekMatches && match.gameWeekMatches.length > 0) {
      const gameWeek = match.gameWeekMatches[0].gameWeek;

      // Calculate result letters (W, D, L)
      const homeResult = homeWin ? 'W' : draw ? 'D' : 'L';
      const awayResult = awayWin ? 'W' : draw ? 'D' : 'L';

      // Update home team gameweek stats
      const homeStats = await prisma.teamGameWeekStats.findUnique({
        where: {
          gameWeekId_teamId: {
            gameWeekId: gameWeek.id,
            teamId: match.homeTeamId
          }
        }
      });

      if (homeStats) {
        await prisma.teamGameWeekStats.update({
          where: {
            gameWeekId_teamId: {
              gameWeekId: gameWeek.id,
              teamId: match.homeTeamId
            }
          },
          data: {
            matchesPlayed: { increment: 1 },
            won: homeWin ? { increment: 1 } : undefined,
            drawn: draw ? { increment: 1 } : undefined,
            lost: awayWin ? { increment: 1 } : undefined,
            goalsFor: { increment: match.homeScore },
            goalsAgainst: { increment: match.awayScore },
            goalDifference: { increment: match.homeScore - match.awayScore },
            points: { increment: homeWin ? 3 : draw ? 1 : 0 },
            result: homeStats.result ? `${homeStats.result}${homeResult}` : homeResult
          }
        });
      } else {
        await prisma.teamGameWeekStats.create({
          data: {
            gameWeekId: gameWeek.id,
            teamId: match.homeTeamId,
            matchesPlayed: 1,
            won: homeWin ? 1 : 0,
            drawn: draw ? 1 : 0,
            lost: awayWin ? 1 : 0,
            goalsFor: match.homeScore,
            goalsAgainst: match.awayScore,
            goalDifference: match.homeScore - match.awayScore,
            points: homeWin ? 3 : draw ? 1 : 0,
            result: homeResult
          }
        });
      }

      // Update away team gameweek stats
      const awayStats = await prisma.teamGameWeekStats.findUnique({
        where: {
          gameWeekId_teamId: {
            gameWeekId: gameWeek.id,
            teamId: match.awayTeamId
          }
        }
      });

      if (awayStats) {
        await prisma.teamGameWeekStats.update({
          where: {
            gameWeekId_teamId: {
              gameWeekId: gameWeek.id,
              teamId: match.awayTeamId
            }
          },
          data: {
            matchesPlayed: { increment: 1 },
            won: awayWin ? { increment: 1 } : undefined,
            drawn: draw ? { increment: 1 } : undefined,
            lost: homeWin ? { increment: 1 } : undefined,
            goalsFor: { increment: match.awayScore },
            goalsAgainst: { increment: match.homeScore },
            goalDifference: { increment: match.awayScore - match.homeScore },
            points: { increment: awayWin ? 3 : draw ? 1 : 0 },
            result: awayStats.result ? `${awayStats.result}${awayResult}` : awayResult
          }
        });
      } else {
        await prisma.teamGameWeekStats.create({
          data: {
            gameWeekId: gameWeek.id,
            teamId: match.awayTeamId,
            matchesPlayed: 1,
            won: awayWin ? 1 : 0,
            drawn: draw ? 1 : 0,
            lost: homeWin ? 1 : 0,
            goalsFor: match.awayScore,
            goalsAgainst: match.homeScore,
            goalDifference: match.awayScore - match.homeScore,
            points: awayWin ? 3 : draw ? 1 : 0,
            result: awayResult
          }
        });
      }
    }

    // 4. Update form for both teams (last 5 matches)
    const updateTeamForm = async (teamId: number) => {
      // Get last 5 finished matches for this team
      const recentMatches = await prisma.match.findMany({
        where: {
          leagueId: match.leagueId,
          status: 'FINISHED',
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
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
          const isHome = m.homeTeamId === teamId;
          const teamScore = isHome ? m.homeScore! : m.awayScore!;
          const opponentScore = isHome ? m.awayScore! : m.homeScore!;

          if (teamScore > opponentScore) return 'W';
          if (teamScore < opponentScore) return 'L';
          return 'D';
        })
        .join('');

      // Update the table with form
      await prisma.table.update({
        where: {
          leagueId_teamId: {
            leagueId: match.leagueId,
            teamId: teamId
          }
        },
        data: { form: formString }
      });
    };

    await updateTeamForm(match.homeTeamId);
    await updateTeamForm(match.awayTeamId);

    // 5. Recalculate positions
    const allStandings = await prisma.table.findMany({
      where: { leagueId: match.leagueId },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });

    // Update positions
    for (let i = 0; i < allStandings.length; i++) {
      await prisma.table.update({
        where: { id: allStandings[i].id },
        data: { position: i + 1 }
      });
    }

    // 6. Process predictions and award points
    let processedPredictions = 0;
    const userUpdates: { [key: number]: { points: number; correct: boolean } } = {};

    for (const prediction of match.predictions) {
      if (prediction.isProcessed) continue;

      let resultPoints = 0;
      let scorePoints = 0;
      let totalPoints = 0;

      // Exact score match
      if (prediction.predictedHomeScore === match.homeScore &&
          prediction.predictedAwayScore === match.awayScore) {
        scorePoints = 5;
        resultPoints = 3;
        totalPoints = 8;
      }
      // Correct result but not exact score
      else {
        const predictedHomeWin = prediction.predictedHomeScore > prediction.predictedAwayScore;
        const predictedAwayWin = prediction.predictedAwayScore > prediction.predictedHomeScore;
        const predictedDraw = prediction.predictedHomeScore === prediction.predictedAwayScore;

        if ((predictedHomeWin && homeWin) || (predictedAwayWin && awayWin) || (predictedDraw && draw)) {
          resultPoints = 3;
          totalPoints = 3;
        }
      }

      // Update prediction
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          resultPoints,
          scorePoints,
          totalPoints,
          isProcessed: true
        }
      });

      // Track user points
      if (!userUpdates[prediction.userId]) {
        userUpdates[prediction.userId] = { points: 0, correct: false };
      }
      userUpdates[prediction.userId].points += totalPoints;
      if (totalPoints > 0) {
        userUpdates[prediction.userId].correct = true;
      }

      processedPredictions++;
    }

    // 7. Update user statistics
    for (const [userId, data] of Object.entries(userUpdates)) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          totalPoints: { increment: data.points },
          weeklyPoints: { increment: data.points },
          totalPredictions: { increment: 1 },
          correctPredictions: data.correct ? { increment: 1 } : undefined
        }
      });
    }

    // 8. Mark match as synced
    await prisma.match.update({
      where: { id: match.id },
      data: { isSynced: true }
    });

    res.json({
      success: true,
      message: `Match synced successfully. Processed ${processedPredictions} predictions.`,
      data: {
        matchId: match.id,
        predictionsProcessed: processedPredictions,
        usersUpdated: Object.keys(userUpdates).length
      }
    });
  } catch (error: any) {
    console.error('Sync match error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// RE-SYNC entire gameweek - recalculate TeamGameWeekStats for THIS gameweek only
// Does NOT touch the main Table - that stays cumulative across all weeks
export const resyncGameWeek = async (req: Request, res: Response) => {
  try {
    const { gameWeekId } = req.params;

    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(gameWeekId) },
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
      return res.status(404).json({ success: false, message: 'GameWeek not found' });
    }

    // Get all finished matches with scores from THIS gameweek only
    const finishedMatches = gameWeek.matches
      .map(gwm => gwm.match)
      .filter(m => m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null);

    if (finishedMatches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No finished matches with scores found in this gameweek'
      });
    }

    // Step 1: Reset ONLY TeamGameWeekStats for this specific gameweek
    await prisma.teamGameWeekStats.deleteMany({
      where: { gameWeekId: gameWeek.id }
    });

    // Step 2: Recalculate TeamGameWeekStats for THIS gameweek only (NOT the main Table)
    let processedMatches = 0;
    const errors: string[] = [];

    for (const match of finishedMatches) {
      try {
        const homeWin = match.homeScore! > match.awayScore!;
        const awayWin = match.awayScore! > match.homeScore!;
        const draw = match.homeScore === match.awayScore;

        // Calculate result letters
        const homeResult = homeWin ? 'W' : draw ? 'D' : 'L';
        const awayResult = awayWin ? 'W' : draw ? 'D' : 'L';

        // Update/Create home team gameweek stats
        const homeStats = await prisma.teamGameWeekStats.findUnique({
          where: {
            gameWeekId_teamId: {
              gameWeekId: gameWeek.id,
              teamId: match.homeTeamId
            }
          }
        });

        if (homeStats) {
          await prisma.teamGameWeekStats.update({
            where: {
              gameWeekId_teamId: {
                gameWeekId: gameWeek.id,
                teamId: match.homeTeamId
              }
            },
            data: {
              matchesPlayed: { increment: 1 },
              won: homeWin ? { increment: 1 } : undefined,
              drawn: draw ? { increment: 1 } : undefined,
              lost: awayWin ? { increment: 1 } : undefined,
              goalsFor: { increment: match.homeScore! },
              goalsAgainst: { increment: match.awayScore! },
              goalDifference: { increment: match.homeScore! - match.awayScore! },
              points: { increment: homeWin ? 3 : draw ? 1 : 0 },
              result: homeStats.result ? `${homeStats.result}${homeResult}` : homeResult
            }
          });
        } else {
          await prisma.teamGameWeekStats.create({
            data: {
              gameWeekId: gameWeek.id,
              teamId: match.homeTeamId,
              matchesPlayed: 1,
              won: homeWin ? 1 : 0,
              drawn: draw ? 1 : 0,
              lost: awayWin ? 1 : 0,
              goalsFor: match.homeScore!,
              goalsAgainst: match.awayScore!,
              goalDifference: match.homeScore! - match.awayScore!,
              points: homeWin ? 3 : draw ? 1 : 0,
              result: homeResult
            }
          });
        }

        // Update/Create away team gameweek stats
        const awayStats = await prisma.teamGameWeekStats.findUnique({
          where: {
            gameWeekId_teamId: {
              gameWeekId: gameWeek.id,
              teamId: match.awayTeamId
            }
          }
        });

        if (awayStats) {
          await prisma.teamGameWeekStats.update({
            where: {
              gameWeekId_teamId: {
                gameWeekId: gameWeek.id,
                teamId: match.awayTeamId
              }
            },
            data: {
              matchesPlayed: { increment: 1 },
              won: awayWin ? { increment: 1 } : undefined,
              drawn: draw ? { increment: 1 } : undefined,
              lost: homeWin ? { increment: 1 } : undefined,
              goalsFor: { increment: match.awayScore! },
              goalsAgainst: { increment: match.homeScore! },
              goalDifference: { increment: match.awayScore! - match.homeScore! },
              points: { increment: awayWin ? 3 : draw ? 1 : 0 },
              result: awayStats.result ? `${awayStats.result}${awayResult}` : awayResult
            }
          });
        } else {
          await prisma.teamGameWeekStats.create({
            data: {
              gameWeekId: gameWeek.id,
              teamId: match.awayTeamId,
              matchesPlayed: 1,
              won: awayWin ? 1 : 0,
              drawn: draw ? 1 : 0,
              lost: homeWin ? 1 : 0,
              goalsFor: match.awayScore!,
              goalsAgainst: match.homeScore!,
              goalDifference: match.awayScore! - match.homeScore!,
              points: awayWin ? 3 : draw ? 1 : 0,
              result: awayResult
            }
          });
        }

        processedMatches++;
      } catch (error: any) {
        errors.push(`Match ${match.id}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `✅ GameWeek ${gameWeek.weekNumber} re-synced! Processed ${processedMatches} finished matches for THIS gameweek only.`,
      data: {
        gameWeekId: parseInt(gameWeekId),
        weekNumber: gameWeek.weekNumber,
        matchesProcessed: processedMatches,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('Resync gameweek error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync entire gameweek - sync all finished matches in the gameweek
export const syncGameWeek = async (req: Request, res: Response) => {
  try {
    const { gameWeekId } = req.params;

    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(gameWeekId) },
      include: {
        matches: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                predictions: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        league: true
      }
    });

    if (!gameWeek) {
      return res.status(404).json({ success: false, message: 'GameWeek not found' });
    }

    let syncedMatches = 0;
    let totalPredictionsProcessed = 0;
    const errors: string[] = [];

    // Sync each finished match in the gameweek
    for (const gwMatch of gameWeek.matches) {
      const match = gwMatch.match;

      if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) {
        continue; // Skip unfinished matches
      }

      // Skip already synced matches
      if (match.isSynced) {
        continue;
      }

      try {
        // Similar sync logic as syncMatch but inline
        const homeWin = match.homeScore > match.awayScore;
        const awayWin = match.awayScore > match.homeScore;
        const draw = match.homeScore === match.awayScore;

        // Update Standings
        await prisma.table.upsert({
          where: { leagueId_teamId: { leagueId: match.leagueId, teamId: match.homeTeamId } },
          update: {
            played: { increment: 1 },
            won: homeWin ? { increment: 1 } : undefined,
            drawn: draw ? { increment: 1 } : undefined,
            lost: awayWin ? { increment: 1 } : undefined,
            goalsFor: { increment: match.homeScore },
            goalsAgainst: { increment: match.awayScore },
            goalDifference: { increment: match.homeScore - match.awayScore },
            points: { increment: homeWin ? 3 : draw ? 1 : 0 }
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
            points: homeWin ? 3 : draw ? 1 : 0
          }
        });

        await prisma.table.upsert({
          where: { leagueId_teamId: { leagueId: match.leagueId, teamId: match.awayTeamId } },
          update: {
            played: { increment: 1 },
            won: awayWin ? { increment: 1 } : undefined,
            drawn: draw ? { increment: 1 } : undefined,
            lost: homeWin ? { increment: 1 } : undefined,
            goalsFor: { increment: match.awayScore },
            goalsAgainst: { increment: match.homeScore },
            goalDifference: { increment: match.awayScore - match.homeScore },
            points: { increment: awayWin ? 3 : draw ? 1 : 0 }
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
            points: awayWin ? 3 : draw ? 1 : 0
          }
        });

        // Update TeamGameWeekStats
        const homeResult = homeWin ? 'W' : draw ? 'D' : 'L';
        const awayResult = awayWin ? 'W' : draw ? 'D' : 'L';

        const homeStats = await prisma.teamGameWeekStats.findUnique({
          where: {
            gameWeekId_teamId: {
              gameWeekId: gameWeek.id,
              teamId: match.homeTeamId
            }
          }
        });

        if (homeStats) {
          await prisma.teamGameWeekStats.update({
            where: {
              gameWeekId_teamId: {
                gameWeekId: gameWeek.id,
                teamId: match.homeTeamId
              }
            },
            data: {
              matchesPlayed: { increment: 1 },
              won: homeWin ? { increment: 1 } : undefined,
              drawn: draw ? { increment: 1 } : undefined,
              lost: awayWin ? { increment: 1 } : undefined,
              goalsFor: { increment: match.homeScore },
              goalsAgainst: { increment: match.awayScore },
              goalDifference: { increment: match.homeScore - match.awayScore },
              points: { increment: homeWin ? 3 : draw ? 1 : 0 },
              result: homeStats.result ? `${homeStats.result}${homeResult}` : homeResult
            }
          });
        } else {
          await prisma.teamGameWeekStats.create({
            data: {
              gameWeekId: gameWeek.id,
              teamId: match.homeTeamId,
              matchesPlayed: 1,
              won: homeWin ? 1 : 0,
              drawn: draw ? 1 : 0,
              lost: awayWin ? 1 : 0,
              goalsFor: match.homeScore,
              goalsAgainst: match.awayScore,
              goalDifference: match.homeScore - match.awayScore,
              points: homeWin ? 3 : draw ? 1 : 0,
              result: homeResult
            }
          });
        }

        const awayStats = await prisma.teamGameWeekStats.findUnique({
          where: {
            gameWeekId_teamId: {
              gameWeekId: gameWeek.id,
              teamId: match.awayTeamId
            }
          }
        });

        if (awayStats) {
          await prisma.teamGameWeekStats.update({
            where: {
              gameWeekId_teamId: {
                gameWeekId: gameWeek.id,
                teamId: match.awayTeamId
              }
            },
            data: {
              matchesPlayed: { increment: 1 },
              won: awayWin ? { increment: 1 } : undefined,
              drawn: draw ? { increment: 1 } : undefined,
              lost: homeWin ? { increment: 1 } : undefined,
              goalsFor: { increment: match.awayScore },
              goalsAgainst: { increment: match.homeScore },
              goalDifference: { increment: match.awayScore - match.homeScore },
              points: { increment: awayWin ? 3 : draw ? 1 : 0 },
              result: awayStats.result ? `${awayStats.result}${awayResult}` : awayResult
            }
          });
        } else {
          await prisma.teamGameWeekStats.create({
            data: {
              gameWeekId: gameWeek.id,
              teamId: match.awayTeamId,
              matchesPlayed: 1,
              won: awayWin ? 1 : 0,
              drawn: draw ? 1 : 0,
              lost: homeWin ? 1 : 0,
              goalsFor: match.awayScore,
              goalsAgainst: match.homeScore,
              goalDifference: match.awayScore - match.homeScore,
              points: awayWin ? 3 : draw ? 1 : 0,
              result: awayResult
            }
          });
        }

        // Process predictions
        const userUpdates: { [key: number]: { points: number; correct: boolean } } = {};

        for (const prediction of match.predictions) {
          if (prediction.isProcessed) continue;

          let resultPoints = 0;
          let scorePoints = 0;
          let totalPoints = 0;

          if (prediction.predictedHomeScore === match.homeScore &&
              prediction.predictedAwayScore === match.awayScore) {
            scorePoints = 5;
            resultPoints = 3;
            totalPoints = 8;
          } else {
            const predictedHomeWin = prediction.predictedHomeScore > prediction.predictedAwayScore;
            const predictedAwayWin = prediction.predictedAwayScore > prediction.predictedHomeScore;
            const predictedDraw = prediction.predictedHomeScore === prediction.predictedAwayScore;

            if ((predictedHomeWin && homeWin) || (predictedAwayWin && awayWin) || (predictedDraw && draw)) {
              resultPoints = 3;
              totalPoints = 3;
            }
          }

          await prisma.prediction.update({
            where: { id: prediction.id },
            data: { resultPoints, scorePoints, totalPoints, isProcessed: true }
          });

          if (!userUpdates[prediction.userId]) {
            userUpdates[prediction.userId] = { points: 0, correct: false };
          }
          userUpdates[prediction.userId].points += totalPoints;
          if (totalPoints > 0) {
            userUpdates[prediction.userId].correct = true;
          }

          totalPredictionsProcessed++;
        }

        // Update user statistics
        for (const [userId, data] of Object.entries(userUpdates)) {
          await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
              totalPoints: { increment: data.points },
              weeklyPoints: { increment: data.points },
              totalPredictions: { increment: 1 },
              correctPredictions: data.correct ? { increment: 1 } : undefined
            }
          });
        }

        // Mark match as synced
        await prisma.match.update({
          where: { id: match.id },
          data: { isSynced: true }
        });

        syncedMatches++;
      } catch (error: any) {
        errors.push(`Match ${match.id}: ${error.message}`);
      }
    }

    // Update form for all teams in the league
    const updateTeamForm = async (teamId: number) => {
      const recentMatches = await prisma.match.findMany({
        where: {
          leagueId: gameWeek.leagueId,
          status: 'FINISHED',
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
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
          const isHome = m.homeTeamId === teamId;
          const teamScore = isHome ? m.homeScore! : m.awayScore!;
          const opponentScore = isHome ? m.awayScore! : m.homeScore!;

          if (teamScore > opponentScore) return 'W';
          if (teamScore < opponentScore) return 'L';
          return 'D';
        })
        .join('');

      await prisma.table.update({
        where: {
          leagueId_teamId: {
            leagueId: gameWeek.leagueId,
            teamId: teamId
          }
        },
        data: { form: formString }
      });
    };

    // Get all teams in standings and update their form
    const allTeams = await prisma.table.findMany({
      where: { leagueId: gameWeek.leagueId },
      select: { teamId: true }
    });

    for (const team of allTeams) {
      await updateTeamForm(team.teamId);
    }

    // Recalculate standings positions
    const allStandings = await prisma.table.findMany({
      where: { leagueId: gameWeek.leagueId },
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
      message: `GameWeek synced successfully. Synced ${syncedMatches} matches, processed ${totalPredictionsProcessed} predictions.`,
      data: {
        gameWeekId: parseInt(gameWeekId),
        matchesSynced: syncedMatches,
        predictionsProcessed: totalPredictionsProcessed,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('Sync gameweek error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
