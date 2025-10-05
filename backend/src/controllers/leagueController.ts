import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllLeagues = async (req: Request, res: Response) => {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      }
    });

    res.json({
      success: true,
      data: leagues
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLeagueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const league = await prisma.league.findUnique({
      where: { id: parseInt(id) },
      include: {
        teams: true,
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true
          },
          orderBy: {
            matchDate: 'asc'
          }
        }
      }
    });

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    res.json({
      success: true,
      data: league
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
