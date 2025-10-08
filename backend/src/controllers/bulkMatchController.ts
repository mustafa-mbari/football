import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      include: { teams: true },
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
        const homeTeam = dbLeague.teams.find(
          (t) =>
            t.name.toLowerCase() === match.homeTeam.toLowerCase() ||
            t.code.toLowerCase() === match.homeTeam.toLowerCase()
        );

        if (!homeTeam) {
          errors.push({
            line: i + 1,
            error: `Home team not found: ${match.homeTeam}`,
          });
          continue;
        }

        // Find away team
        const awayTeam = dbLeague.teams.find(
          (t) =>
            t.name.toLowerCase() === match.awayTeam.toLowerCase() ||
            t.code.toLowerCase() === match.awayTeam.toLowerCase()
        );

        if (!awayTeam) {
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
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
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
    const { league, matches } = req.body as {
      league: string;
      matches: BulkMatchByIdData[];
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
        // Combine date and time
        const matchDateTime = new Date(`${match.matchDate}T${match.matchTime}:00`);

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
    console.error('Bulk import by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
