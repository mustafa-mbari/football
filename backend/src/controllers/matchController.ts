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
