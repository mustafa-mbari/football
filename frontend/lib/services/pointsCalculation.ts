/**
 * Points Calculation Service
 *
 * Calculates prediction points based on match results
 * Used by sync operations and manual calculations
 */

import { prisma } from '@/lib/db/prisma';

export interface PointsResult {
  resultPoints: number;
  scorePoints: number;
  totalPoints: number;
}

/**
 * Calculate points for a prediction
 *
 * Scoring rules:
 * - Exact score: 5 points for score + 3 points for result = 8 total
 * - Correct result only: 3 points
 * - Wrong: 0 points
 */
export function calculatePredictionPoints(
  predictedHomeScore: number,
  predictedAwayScore: number,
  actualHomeScore: number,
  actualAwayScore: number
): PointsResult {
  let resultPoints = 0;
  let scorePoints = 0;

  // Check for exact score match
  if (
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore
  ) {
    scorePoints = 5;
    resultPoints = 3;
    return {
      resultPoints,
      scorePoints,
      totalPoints: 8,
    };
  }

  // Check for correct result (win/draw/loss)
  const actualHomeWin = actualHomeScore > actualAwayScore;
  const actualAwayWin = actualAwayScore > actualHomeScore;
  const actualDraw = actualHomeScore === actualAwayScore;

  const predictedHomeWin = predictedHomeScore > predictedAwayScore;
  const predictedAwayWin = predictedAwayScore > predictedHomeScore;
  const predictedDraw = predictedHomeScore === predictedAwayScore;

  if (
    (predictedHomeWin && actualHomeWin) ||
    (predictedAwayWin && actualAwayWin) ||
    (predictedDraw && actualDraw)
  ) {
    resultPoints = 3;
  }

  return {
    resultPoints,
    scorePoints,
    totalPoints: resultPoints + scorePoints,
  };
}

/**
 * Process all predictions for a match and update scores
 */
export async function processPredictionsForMatch(matchId: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      predictions: {
        where: { isProcessed: false },
      },
    },
  });

  if (!match) {
    throw new Error('Match not found');
  }

  if (
    match.status !== 'FINISHED' ||
    match.homeScore === null ||
    match.awayScore === null
  ) {
    throw new Error('Match must be finished with scores to process predictions');
  }

  const userPointsUpdates: Map<
    number,
    { points: number; hasCorrect: boolean }
  > = new Map();

  // Calculate points for each prediction
  const predictionUpdates = match.predictions.map((prediction) => {
    const points = calculatePredictionPoints(
      prediction.predictedHomeScore,
      prediction.predictedAwayScore,
      match.homeScore!,
      match.awayScore!
    );

    // Track user points
    const existing = userPointsUpdates.get(prediction.userId) || {
      points: 0,
      hasCorrect: false,
    };
    existing.points += points.totalPoints;
    if (points.totalPoints > 0) {
      existing.hasCorrect = true;
    }
    userPointsUpdates.set(prediction.userId, existing);

    return prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        resultPoints: points.resultPoints,
        scorePoints: points.scorePoints,
        totalPoints: points.totalPoints,
        isProcessed: true,
        status: 'COMPLETED',
      },
    });
  });

  // Execute all prediction updates in parallel
  await Promise.all(predictionUpdates);

  // Update user statistics
  const userUpdates = Array.from(userPointsUpdates.entries()).map(
    ([userId, data]) =>
      prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: data.points },
          weeklyPoints: { increment: data.points },
          totalPredictions: { increment: 1 },
          correctPredictions: data.hasCorrect ? { increment: 1 } : undefined,
        },
      })
  );

  await Promise.all(userUpdates);

  return {
    predictionsProcessed: match.predictions.length,
    usersUpdated: userPointsUpdates.size,
  };
}

/**
 * Update team form (last 5 matches results)
 */
export async function updateTeamForm(
  leagueId: number,
  teamId: number
): Promise<string> {
  const recentMatches = await prisma.match.findMany({
    where: {
      leagueId,
      status: 'FINISHED',
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      homeScore: { not: null },
      awayScore: { not: null },
    },
    orderBy: { matchDate: 'desc' },
    take: 5,
  });

  const formString = recentMatches
    .reverse()
    .map((m) => {
      const isHome = m.homeTeamId === teamId;
      const teamScore = isHome ? m.homeScore! : m.awayScore!;
      const opponentScore = isHome ? m.awayScore! : m.homeScore!;

      if (teamScore > opponentScore) return 'W';
      if (teamScore < opponentScore) return 'L';
      return 'D';
    })
    .join('');

  // Update the table with form
  await prisma.table.update({
    where: {
      leagueId_teamId: {
        leagueId,
        teamId,
      },
    },
    data: { form: formString },
  });

  return formString;
}

/**
 * Recalculate all table positions for a league
 */
export async function recalculateLeaguePositions(leagueId: number) {
  const allStandings = await prisma.table.findMany({
    where: { leagueId },
    orderBy: [
      { points: 'desc' },
      { goalDifference: 'desc' },
      { goalsFor: 'desc' },
    ],
  });

  // Batch update positions
  const positionUpdates = allStandings.map((standing, index) =>
    prisma.table.update({
      where: { id: standing.id },
      data: { position: index + 1 },
    })
  );

  await Promise.all(positionUpdates);

  return allStandings.length;
}
