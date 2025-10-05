import { Request, Response } from 'express';
import prisma from '../config/database';
import { calculatePoints } from '../utils/scoreCalculator';

export const createPrediction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { matchId, predictedHomeScore, predictedAwayScore } = req.body;

    if (matchId === undefined || predictedHomeScore === undefined || predictedAwayScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Match ID and predicted scores are required'
      });
    }

    // Check if match exists and hasn't started yet
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (new Date(match.matchDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot predict for matches that have already started'
      });
    }

    // Create or update prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId,
          matchId
        }
      },
      update: {
        predictedHomeScore,
        predictedAwayScore
      },
      create: {
        userId,
        matchId,
        predictedHomeScore,
        predictedAwayScore
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: prediction
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserPredictions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: predictions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMatchPredictions = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const predictions = await prisma.prediction.findMany({
      where: { matchId: parseInt(matchId) },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: predictions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin endpoint to update match scores and calculate points
export const updateMatchScore = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { homeScore, awayScore, status } = req.body;

    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Home and away scores are required'
      });
    }

    // Update match
    const match = await prisma.match.update({
      where: { id: parseInt(matchId) },
      data: {
        homeScore,
        awayScore,
        status: status || 'finished'
      }
    });

    // Get all predictions for this match
    const predictions = await prisma.prediction.findMany({
      where: { matchId: parseInt(matchId) }
    });

    // Update points for each prediction
    for (const prediction of predictions) {
      const points = calculatePoints(
        prediction.predictedHomeScore,
        prediction.predictedAwayScore,
        homeScore,
        awayScore
      );

      await prisma.prediction.update({
        where: { id: prediction.id },
        data: { points }
      });
    }

    res.json({
      success: true,
      data: match,
      message: `Updated ${predictions.length} predictions`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
