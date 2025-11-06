import { Request, Response } from 'express';
import prisma from '../config/database';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;

    // OPTIMIZED: Use aggregation query instead of loading all predictions
    let leaderboardQuery;

    if (leagueId) {
      // League-specific leaderboard: aggregate points from predictions
      leaderboardQuery = await prisma.$queryRaw<Array<{
        id: number;
        username: string;
        totalPoints: bigint;
        totalPredictions: bigint;
      }>>`
        SELECT
          u.id,
          u.username,
          COALESCE(SUM(p."totalPoints"), 0) as "totalPoints",
          COUNT(p.id) as "totalPredictions"
        FROM "User" u
        LEFT JOIN "Prediction" p ON u.id = p."userId"
        LEFT JOIN "Match" m ON p."matchId" = m.id
        WHERE m."leagueId" = ${parseInt(leagueId as string)}
        GROUP BY u.id, u.username
        HAVING COUNT(p.id) > 0
        ORDER BY "totalPoints" DESC
      `;
    } else {
      // Global leaderboard: use pre-calculated totalPoints from User table
      leaderboardQuery = await prisma.user.findMany({
        where: {
          isActive: true,
          totalPredictions: { gt: 0 }
        },
        select: {
          id: true,
          username: true,
          totalPoints: true,
          totalPredictions: true
        },
        orderBy: {
          totalPoints: 'desc'
        },
        take: 100 // Limit to top 100 for performance
      });
    }

    // Format leaderboard with ranks
    const leaderboard = (leaderboardQuery as any[]).map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      totalPoints: Number(user.totalPoints),
      totalPredictions: Number(user.totalPredictions)
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const predictions = await prisma.prediction.findMany({
      where: { userId },
      select: {
        totalPoints: true,
        scorePoints: true,
        resultPoints: true,
        match: {
          select: {
            status: true
          }
        }
      }
    });

    const totalPredictions = predictions.length;
    const finishedPredictions = predictions.filter(p => p.match.status === 'FINISHED');
    const totalPoints = predictions.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
    const exactScores = predictions.filter(p => p.scorePoints > 0).length;
    const correctOutcomes = predictions.filter(p => p.resultPoints > 0).length;

    res.json({
      success: true,
      data: {
        totalPredictions,
        finishedPredictions: finishedPredictions.length,
        totalPoints,
        exactScores,
        correctOutcomes,
        averagePoints: finishedPredictions.length > 0
          ? (totalPoints / finishedPredictions.length).toFixed(2)
          : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
