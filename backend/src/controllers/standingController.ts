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
    // Get all leagues
    const leagues = await prisma.league.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        season: true,
        logoUrl: true
      }
    });

    // Get standings for each league
    const standingsByLeague = await Promise.all(
      leagues.map(async (league: any) => {
        const standings = await prisma.table.findMany({
          where: { leagueId: league.id },
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

        return {
          league,
          standings: standings.map((standing: any, index: number) => ({
            ...standing,
            position: index + 1
          }))
        };
      })
    );

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
