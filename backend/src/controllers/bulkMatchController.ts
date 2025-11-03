import { Request, Response } from 'express';
import prisma from '../config/database';

interface BulkMatchData {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  matchTime: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  weekNumber: number;
}

interface BulkMatchByIdData {
  homeTeamId: number;
  awayTeamId: number;
  matchDate: string;
  matchTime: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  weekNumber: number;
}

export const bulkImportMatches = async (req: Request, res: Response) => {
  try {
    const { league, matches } = req.body as {
      league: string;
      matches: BulkMatchData[];
    };

    if (!league || !matches || !Array.isArray(matches)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected: { league, matches }',
      });
    }

    // Get the league from database
    let leagueCode: string;
    switch (league) {
      case 'premierLeague':
        leagueCode = 'EPL';
        break;
      case 'laLiga':
        leagueCode = 'LALIGA';
        break;
      case 'bundesliga':
        leagueCode = 'BL1';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid league. Use: premierLeague, laLiga, or bundesliga',
        });
    }

    const dbLeague = await prisma.league.findFirst({
      where: { code: leagueCode },
      include: {
        teams: {
          where: { isActive: true },
          include: {
            team: true
          }
        }
      },
    });

    if (!dbLeague) {
      return res.status(404).json({
        success: false,
        message: `League not found: ${leagueCode}`,
      });
    }

    const createdMatches = [];
    const errors = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];

      try {
        // Find home team
        const homeTeamLeague = dbLeague.teams.find(
          (tl) =>
            tl.team.name.toLowerCase() === match.homeTeam.toLowerCase() ||
            tl.team.code.toLowerCase() === match.homeTeam.toLowerCase()
        );

        if (!homeTeamLeague) {
          errors.push({
            line: i + 1,
            error: `Home team not found: ${match.homeTeam}`,
          });
          continue;
        }

        // Find away team
        const awayTeamLeague = dbLeague.teams.find(
          (tl) =>
            tl.team.name.toLowerCase() === match.awayTeam.toLowerCase() ||
            tl.team.code.toLowerCase() === match.awayTeam.toLowerCase()
        );

        if (!awayTeamLeague) {
          errors.push({
            line: i + 1,
            error: `Away team not found: ${match.awayTeam}`,
          });
          continue;
        }

        // Combine date and time
        const matchDateTime = new Date(`${match.matchDate}T${match.matchTime}:00`);

        // Create match
        const createdMatch = await prisma.match.create({
          data: {
            leagueId: dbLeague.id,
            homeTeamId: homeTeamLeague.team.id,
            awayTeamId: awayTeamLeague.team.id,
            matchDate: matchDateTime,
            weekNumber: match.weekNumber,
            status: match.status as any,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            isPredictionLocked: match.status !== 'SCHEDULED',
          },
        });

        createdMatches.push(createdMatch);
      } catch (error: any) {
        errors.push({
          line: i + 1,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      count: createdMatches.length,
      imported: createdMatches.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${createdMatches.length} out of ${matches.length} matches`,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkImportMatchesByID = async (req: Request, res: Response) => {
  try {
    console.log('=== Bulk Import Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { league, matches } = req.body as {
      league: string;
      matches: BulkMatchByIdData[];
    };

    console.log('League:', league);
    console.log('Matches count:', matches?.length);
    console.log('Matches is array?', Array.isArray(matches));

    if (!league || !matches || !Array.isArray(matches)) {
      console.log('Validation failed - missing league or matches');
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected: { league, matches }',
      });
    }

    if (matches.length === 0) {
      console.log('No matches provided in request');
      return res.status(400).json({
        success: false,
        message: 'No matches provided',
      });
    }

    // Get the league from database
    let leagueCode: string;
    switch (league) {
      case 'premierLeague':
        leagueCode = 'EPL';
        break;
      case 'laLiga':
        leagueCode = 'LALIGA';
        break;
      case 'bundesliga':
        leagueCode = 'BL1';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid league. Use: premierLeague, laLiga, or bundesliga',
        });
    }

    const dbLeague = await prisma.league.findFirst({
      where: { code: leagueCode },
    });

    if (!dbLeague) {
      return res.status(404).json({
        success: false,
        message: `League not found: ${leagueCode}`,
      });
    }

    // Get all gameweeks for this league to map weekNumber -> gameWeekId
    const gameWeeks = await prisma.gameWeek.findMany({
      where: { leagueId: dbLeague.id },
      select: { id: true, weekNumber: true }
    });

    const gameWeekMap = new Map(gameWeeks.map(gw => [gw.weekNumber, gw.id]));

    const createdMatches = [];
    const gameWeekAssignments = [];
    const errors = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];

      try {
        console.log(`Processing match ${i + 1}/${matches.length}:`, match);

        // Combine date and time
        const matchDateTime = new Date(`${match.matchDate}T${match.matchTime}:00`);
        console.log(`Match date/time: ${matchDateTime}`);

        // Create match
        const createdMatch = await prisma.match.create({
          data: {
            leagueId: dbLeague.id,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            matchDate: matchDateTime,
            weekNumber: match.weekNumber,
            status: match.status as any,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            isPredictionLocked: match.status !== 'SCHEDULED',
          },
        });

        console.log(`Match created with ID: ${createdMatch.id}`);
        createdMatches.push(createdMatch);

        // Automatically assign to gameweek if weekNumber is provided and gameweek exists
        if (match.weekNumber) {
          const gameWeekId = gameWeekMap.get(match.weekNumber);

          if (gameWeekId) {
            try {
              await prisma.gameWeekMatch.create({
                data: {
                  gameWeekId: gameWeekId,
                  matchId: createdMatch.id,
                  isSynced: false
                }
              });
              gameWeekAssignments.push({
                matchId: createdMatch.id,
                gameWeekId: gameWeekId,
                weekNumber: match.weekNumber
              });
            } catch (gwError: any) {
              // If GameWeekMatch already exists, just continue
              if (!gwError.message.includes('Unique constraint')) {
                errors.push({
                  line: i + 1,
                  error: `Match created but gameweek assignment failed: ${gwError.message}`,
                });
              }
            }
          } else {
            errors.push({
              line: i + 1,
              error: `Match created but no gameweek found for week ${match.weekNumber}`,
            });
          }
        }
      } catch (error: any) {
        console.error(`Error processing match ${i + 1}:`, error);
        errors.push({
          line: i + 1,
          error: error.message,
        });
      }
    }

    console.log(`=== Import Complete ===`);
    console.log(`Created: ${createdMatches.length} matches`);
    console.log(`GameWeek assignments: ${gameWeekAssignments.length}`);
    console.log(`Errors: ${errors.length}`);

    res.json({
      success: true,
      count: createdMatches.length,
      imported: createdMatches.length,
      gameWeekAssignments: gameWeekAssignments.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${createdMatches.length} out of ${matches.length} matches and assigned ${gameWeekAssignments.length} to gameweeks`,
    });
  } catch (error: any) {
    console.error('Bulk import by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkDeleteScheduledMatches = async (req: Request, res: Response) => {
  try {
    console.log('=== Bulk Delete Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { leagueId, weekNumbers } = req.body as {
      leagueId: number;
      weekNumbers: number[];
    };

    if (!leagueId || !weekNumbers || !Array.isArray(weekNumbers) || weekNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected: { leagueId: number, weekNumbers: number[] }',
      });
    }

    // Find all gameweeks for the specified league and week numbers
    const gameWeeks = await prisma.gameWeek.findMany({
      where: {
        leagueId: leagueId,
        weekNumber: {
          in: weekNumbers
        }
      },
      select: { id: true, weekNumber: true }
    });

    if (gameWeeks.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: `No gameweeks found for weeks ${weekNumbers.join(', ')} in league ${leagueId}`,
      });
    }

    const gameWeekIds = gameWeeks.map(gw => gw.id);

    // Find all scheduled matches assigned to these gameweeks
    const gameWeekMatches = await prisma.gameWeekMatch.findMany({
      where: {
        gameWeekId: { in: gameWeekIds }
      },
      include: {
        match: {
          include: {
            homeTeam: { select: { name: true, code: true } },
            awayTeam: { select: { name: true, code: true } }
          }
        }
      }
    });

    // Filter only SCHEDULED matches
    const scheduledMatches = gameWeekMatches.filter(gwm => gwm.match.status === 'SCHEDULED');

    if (scheduledMatches.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: `No scheduled matches found for weeks ${weekNumbers.join(', ')} in league ${leagueId}`,
      });
    }

    const matchIds = scheduledMatches.map(gwm => gwm.match.id);

    // Delete related records first (predictions and gameweek assignments)
    const deletedPredictions = await prisma.prediction.deleteMany({
      where: { matchId: { in: matchIds } }
    });

    const deletedGameWeekMatches = await prisma.gameWeekMatch.deleteMany({
      where: { matchId: { in: matchIds } }
    });

    // Delete the matches
    const deleteResult = await prisma.match.deleteMany({
      where: {
        id: { in: matchIds }
      }
    });

    console.log(`=== Delete Complete ===`);
    console.log(`Deleted: ${deleteResult.count} scheduled matches`);
    console.log(`Deleted: ${deletedPredictions.count} predictions`);
    console.log(`Deleted: ${deletedGameWeekMatches.count} gameweek assignments`);
    console.log(`Weeks: ${weekNumbers.join(', ')}`);

    // Group deleted matches by week number
    const matchesByWeek = scheduledMatches.reduce((acc, gwm) => {
      const weekNumber = gameWeeks.find(gw => gw.id === gwm.gameWeekId)?.weekNumber || 0;
      if (!acc[weekNumber]) {
        acc[weekNumber] = [];
      }
      acc[weekNumber].push({
        id: gwm.match.id,
        homeTeam: gwm.match.homeTeam.name,
        awayTeam: gwm.match.awayTeam.name,
        matchDate: gwm.match.matchDate,
        homeTeamId: gwm.match.homeTeamId,
        awayTeamId: gwm.match.awayTeamId
      });
      return acc;
    }, {} as Record<number, any[]>);

    res.json({
      success: true,
      count: deleteResult.count,
      deletedPredictions: deletedPredictions.count,
      deletedGameWeekMatches: deletedGameWeekMatches.count,
      matchesByWeek: matchesByWeek,
      message: `Successfully deleted ${deleteResult.count} scheduled matches from weeks ${weekNumbers.join(', ')}`,
    });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
