import { Request, Response } from 'express';
import prisma from '../config/database';
import { calculatePoints } from '../utils/scoreCalculator';
import { autoJoinPublicGroup } from './groupController';
import { pointsUpdateService } from '../services/pointsUpdateService';

export const createPrediction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { matchId, predictedHomeScore, predictedAwayScore, groupId } = req.body;

    if (matchId === undefined || predictedHomeScore === undefined || predictedAwayScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Match ID and predicted scores are required'
      });
    }

    // Check if match exists and hasn't started yet
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Fetch prediction deadline setting
    const deadlineSetting = await prisma.appSettings.findUnique({
      where: { key: 'PREDICTION_DEADLINE_HOURS' }
    });

    const deadlineHours = deadlineSetting ? parseInt(deadlineSetting.value) : 4; // Default to 4 hours
    const now = new Date();
    const kickoff = new Date(match.matchDate);
    const deadline = new Date(kickoff.getTime() - deadlineHours * 60 * 60 * 1000);

    // Check if prediction deadline has passed
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: `Predictions are locked ${deadlineHours} hour${deadlineHours !== 1 ? 's' : ''} before kickoff. Deadline was ${deadline.toLocaleString()}`
      });
    }

    // Also check if match has already started (as a backup check)
    if (kickoff < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot predict for matches that have already started'
      });
    }

    // If groupId provided, validate team is allowed in group
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      if (group && group.allowedTeamIds && group.allowedTeamIds.length > 0) {
        const isAllowed =
          group.allowedTeamIds.includes(match.homeTeamId) ||
          group.allowedTeamIds.includes(match.awayTeamId);

        if (!isAllowed) {
          return res.status(400).json({
            success: false,
            message: 'This match is not available in the selected group'
          });
        }
      }
    }

    // Auto-join user to public group for this league
    await autoJoinPublicGroup(userId, match.leagueId);

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
            awayTeam: true,
            league: true
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

    // Get match with league info
    const matchData = await prisma.match.findUnique({
      where: { id: parseInt(matchId) }
    });

    if (!matchData) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Update match
    const match = await prisma.match.update({
      where: { id: parseInt(matchId) },
      data: {
        homeScore,
        awayScore,
        status: status || 'FINISHED',
        isPredictionLocked: true
      }
    });

    // Get all predictions for this match
    const predictions = await prisma.prediction.findMany({
      where: { matchId: parseInt(matchId) }
    });

    // Update points for each prediction and update group points
    for (const prediction of predictions) {
      const points = calculatePoints(
        prediction.predictedHomeScore,
        prediction.predictedAwayScore,
        homeScore,
        awayScore
      );

      // Update prediction points
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          totalPoints: points,
          isProcessed: true,
          status: 'COMPLETED'
        }
      });

      // Update group points for this user
      await pointsUpdateService.updateGroupPoints(
        prediction.userId,
        matchData.leagueId,
        points
      );
    }

    res.json({
      success: true,
      data: match,
      message: `Updated ${predictions.length} predictions and group points`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin endpoint to recalculate all prediction points
export const recalculateAllPoints = async (req: Request, res: Response) => {
  try {
    // Get all matches that have scores
    const matches = await prisma.match.findMany({
      where: {
        AND: [
          { homeScore: { not: null } },
          { awayScore: { not: null } }
        ]
      },
      include: {
        predictions: true
      }
    });

    let totalPredictions = 0;
    let updatedPredictions = 0;
    let totalPointsAwarded = 0;

    // Recalculate points for each prediction
    for (const match of matches) {
      for (const prediction of match.predictions) {
        totalPredictions++;

        const points = calculatePoints(
          prediction.predictedHomeScore,
          prediction.predictedAwayScore,
          match.homeScore!,
          match.awayScore!
        );

        await prisma.prediction.update({
          where: { id: prediction.id },
          data: { totalPoints: points }
        });

        updatedPredictions++;
        totalPointsAwarded += points;
      }
    }

    res.json({
      success: true,
      message: `Successfully recalculated points for ${updatedPredictions} predictions`,
      stats: {
        totalPredictions,
        updatedPredictions,
        totalPointsAwarded
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
