import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllLeagues = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;

    const leagues = await prisma.league.findMany({
      where: includeInactive === 'true' ? undefined : { isActive: true },
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
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

export const getTeamsByLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    const teams = await prisma.team.findMany({
      where: { leagueId: parseInt(leagueId) },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createLeague = async (req: Request, res: Response) => {
  try {
    const { name, code, country, logoUrl, season, startDate, endDate, isActive, priority } = req.body;

    // Validate required fields
    if (!name || !code || !season || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, code, season, startDate, endDate'
      });
    }

    // Check if league with same code already exists
    const existingLeague = await prisma.league.findUnique({
      where: { code }
    });

    if (existingLeague) {
      return res.status(400).json({
        success: false,
        message: 'League with this code already exists'
      });
    }

    const league = await prisma.league.create({
      data: {
        name,
        code,
        country: country || null,
        logoUrl: logoUrl || null,
        season,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 0
      },
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: league,
      message: 'League created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateLeague = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, country, logoUrl, season, startDate, endDate, isActive, priority } = req.body;

    // Check if league exists
    const existingLeague = await prisma.league.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLeague) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingLeague.code) {
      const codeExists = await prisma.league.findUnique({
        where: { code }
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'League with this code already exists'
        });
      }
    }

    const league = await prisma.league.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(country !== undefined && { country }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(season && { season }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority })
      },
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      }
    });

    res.json({
      success: true,
      data: league,
      message: 'League updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteLeague = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if league exists
    const existingLeague = await prisma.league.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { teams: true, matches: true, gameWeeks: true }
        }
      }
    });

    if (!existingLeague) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    // Check if league has associated data
    if (existingLeague._count.teams > 0 || existingLeague._count.matches > 0 || existingLeague._count.gameWeeks > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete league with associated teams, matches, or gameweeks. Please deactivate it instead.'
      });
    }

    await prisma.league.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'League deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const toggleLeagueActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const league = await prisma.league.findUnique({
      where: { id: parseInt(id) }
    });

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    const updatedLeague = await prisma.league.update({
      where: { id: parseInt(id) },
      data: { isActive: !league.isActive },
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedLeague,
      message: `League ${updatedLeague.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
