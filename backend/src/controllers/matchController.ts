import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { leagueId, status, limit = 100 } = req.query;

    const where: any = {};
    if (leagueId) where.leagueId = parseInt(leagueId as string);
    if (status) where.status = status as string;

    // OPTIMIZED: Select only necessary fields and add limit
    const matches = await prisma.match.findMany({
      where,
      select: {
        id: true,
        matchDate: true,
        weekNumber: true,
        homeScore: true,
        awayScore: true,
        status: true,
        isPredictionLocked: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true
          }
        },
        league: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        matchDate: 'asc'
      },
      take: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: matches
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // OPTIMIZED: Select only necessary fields
    const match = await prisma.match.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        matchDate: true,
        weekNumber: true,
        homeScore: true,
        awayScore: true,
        status: true,
        isPredictionLocked: true,
        isSynced: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true
          }
        },
        league: {
          select: {
            id: true,
            name: true,
            code: true,
            season: true
          }
        },
        predictions: {
          select: {
            id: true,
            predictedHomeScore: true,
            predictedAwayScore: true,
            totalPoints: true,
            isProcessed: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          take: 50 // Limit predictions to prevent huge payloads
        }
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUpcomingMatches = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const now = new Date();

    const where: any = {
      matchDate: {
        gte: now
      },
      status: 'scheduled'
    };

    if (leagueId) where.leagueId = parseInt(leagueId as string);

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      },
      orderBy: {
        matchDate: 'asc'
      },
      take: 20
    });

    res.json({
      success: true,
      data: matches
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { homeTeamId, awayTeamId, matchDate, status, homeScore, awayScore } = req.body;

    // Get the current match to check if it was synced
    const currentMatch = await prisma.match.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentMatch) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const updateData: any = {};
    if (homeTeamId !== undefined) updateData.homeTeamId = parseInt(homeTeamId);
    if (awayTeamId !== undefined) updateData.awayTeamId = parseInt(awayTeamId);
    if (matchDate) updateData.matchDate = new Date(matchDate);
    if (status) updateData.status = status;
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;

    // If the match was synced and scores are being changed, mark as unsynced
    // so it can be re-synced with the new scores
    const scoresChanged = (homeScore !== undefined && homeScore !== currentMatch.homeScore) ||
                         (awayScore !== undefined && awayScore !== currentMatch.awayScore);

    if (currentMatch.isSynced && scoresChanged) {
      updateData.isSynced = false;
    }

    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      },
      data: updateData
    });

    let message = 'Match updated successfully';
    if (currentMatch.isSynced && scoresChanged) {
      message += '. Match marked as unsynced - please sync again to update tables.';
    }

    res.json({
      success: true,
      data: match,
      message
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First, delete related records
    await prisma.prediction.deleteMany({
      where: { matchId: parseInt(id) }
    });

    await prisma.gameWeekMatch.deleteMany({
      where: { matchId: parseInt(id) }
    });

    // Then delete the match
    await prisma.match.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
