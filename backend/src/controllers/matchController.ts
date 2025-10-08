import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { leagueId, status } = req.query;

    const where: any = {};
    if (leagueId) where.leagueId = parseInt(leagueId as string);
    if (status) where.status = status as string;

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      },
      orderBy: {
        matchDate: 'asc'
      }
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

    const match = await prisma.match.findUnique({
      where: { id: parseInt(id) },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        predictions: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
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

    const updateData: any = {};
    if (homeTeamId !== undefined) updateData.homeTeamId = parseInt(homeTeamId);
    if (awayTeamId !== undefined) updateData.awayTeamId = parseInt(awayTeamId);
    if (matchDate) updateData.matchDate = new Date(matchDate);
    if (status) updateData.status = status;
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;

    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      },
      data: updateData
    });

    res.json({
      success: true,
      data: match,
      message: 'Match updated successfully'
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
