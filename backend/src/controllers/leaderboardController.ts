import { Request, Response } from 'express';
import prisma from '../config/database';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;

    // Get all users with their total points
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        predictions: {
          where: leagueId ? {
            match: {
              leagueId: parseInt(leagueId as string)
            }
          } : undefined,
          select: {
            points: true
          }
        }
      }
    });

    // Calculate total points for each user
    const leaderboard = users
      .map(user => ({
        id: user.id,
        username: user.username,
        totalPoints: user.predictions.reduce((sum, pred) => sum + (pred.points || 0), 0),
        totalPredictions: user.predictions.length
      }))
      .filter(user => user.totalPredictions > 0) // Only show users who have made predictions
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        rank: index + 1,
        ...user
      }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error: any) {
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
        points: true,
        match: {
          select: {
            status: true
          }
        }
      }
    });

    const totalPredictions = predictions.length;
    const finishedPredictions = predictions.filter(p => p.match.status === 'finished');
    const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
    const exactScores = predictions.filter(p => p.points === 3).length;
    const correctOutcomes = predictions.filter(p => p.points === 1).length;

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
