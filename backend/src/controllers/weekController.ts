import { Request, Response } from 'express';
import prisma from '../config/database';

// Helper function to get week number from a date
const getWeekNumber = (date: Date): number => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return -1; // Past matches
  if (diffDays <= 7) return 1;
  if (diffDays <= 14) return 2;
  if (diffDays <= 21) return 3;
  if (diffDays <= 28) return 4;
  return 5; // Future matches beyond 4 weeks
};

export const getMatchesByWeek = async (req: Request, res: Response) => {
  try {
    const { leagueId, week } = req.query;
    const userId = (req as any).userId;

    if (!leagueId || !week) {
      return res.status(400).json({
        success: false,
        message: 'League ID and week are required'
      });
    }

    const weekNum = parseInt(week as string);
    const now = new Date();

    // Calculate date range for the requested week
    let startDate: Date;
    let endDate: Date;

    if (weekNum === -1) {
      // Past matches
      endDate = now;
      startDate = new Date(0); // Beginning of time
    } else if (weekNum === 1) {
      startDate = now;
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (weekNum === 2) {
      startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    } else if (weekNum === 3) {
      startDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    } else if (weekNum === 4) {
      startDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid week number. Use -1 for past, 1-4 for upcoming weeks'
      });
    }

    const matches = await prisma.match.findMany({
      where: {
        leagueId: parseInt(leagueId as string),
        matchDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        predictions: userId ? {
          where: {
            userId: userId
          },
          select: {
            id: true,
            predictedHomeScore: true,
            predictedAwayScore: true,
            totalPoints: true,
            userId: true
          }
        } : false
      },
      orderBy: {
        matchDate: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        week: weekNum,
        startDate,
        endDate,
        matches
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAvailableWeeks = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;

    if (!leagueId) {
      return res.status(400).json({
        success: false,
        message: 'League ID is required'
      });
    }

    const matches = await prisma.match.findMany({
      where: {
        leagueId: parseInt(leagueId as string)
      },
      select: {
        matchDate: true,
        status: true
      }
    });

    const now = new Date();
    const weekCounts = {
      past: 0,
      week1: 0,
      week2: 0,
      week3: 0,
      week4: 0
    };

    matches.forEach(match => {
      const week = getWeekNumber(new Date(match.matchDate));

      if (week === -1) weekCounts.past++;
      else if (week === 1) weekCounts.week1++;
      else if (week === 2) weekCounts.week2++;
      else if (week === 3) weekCounts.week3++;
      else if (week === 4) weekCounts.week4++;
    });

    const availableWeeks = [
      { week: -1, label: 'Past Matches', count: weekCounts.past },
      { week: 1, label: 'Week 1 (This Week)', count: weekCounts.week1 },
      { week: 2, label: 'Week 2', count: weekCounts.week2 },
      { week: 3, label: 'Week 3', count: weekCounts.week3 },
      { week: 4, label: 'Week 4', count: weekCounts.week4 }
    ].filter(w => w.count > 0);

    res.json({
      success: true,
      data: availableWeeks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCurrentWeek = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: {
        currentWeek: 1,
        startDate: now,
        endDate: nextWeek
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
