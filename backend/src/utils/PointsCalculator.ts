/**
 * PointsCalculator Class
 * Handles all points calculation logic for predictions
 * Each rule has its own method for clarity and maintainability
 */

import prisma from '../config/database';

export interface PredictionScore {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
}

export interface PointsBreakdown {
  exactHomeScore: number;
  exactAwayScore: number;
  correctResult: number;
  correctTotalGoals: number;
  correctGoalDifference: number;
  exactScoreBonus: number;
  total: number;
}

export class PointsCalculator {
  // Default points configuration (fallback if database is unavailable)
  private static readonly DEFAULT_POINTS = {
    EXACT_HOME_SCORE: 1,
    EXACT_AWAY_SCORE: 1,
    CORRECT_RESULT: 3,
    CORRECT_TOTAL_GOALS: 2,
    CORRECT_GOAL_DIFFERENCE: 1,
    EXACT_SCORE_BONUS: 2,
  };

  // Cached points from database
  private static cachedPoints: typeof PointsCalculator.DEFAULT_POINTS | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load points configuration from database
   * Uses caching to avoid excessive database queries
   */
  private static async loadPointsFromDatabase(): Promise<typeof PointsCalculator.DEFAULT_POINTS> {
    const now = Date.now();

    // Return cached points if still valid
    if (this.cachedPoints && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedPoints;
    }

    try {
      const rules = await prisma.pointsRule.findMany({
        where: { isActive: true }
      });

      const points = { ...this.DEFAULT_POINTS };

      rules.forEach(rule => {
        switch (rule.type) {
          case 'EXACT_HOME_SCORE':
            points.EXACT_HOME_SCORE = rule.points;
            break;
          case 'EXACT_AWAY_SCORE':
            points.EXACT_AWAY_SCORE = rule.points;
            break;
          case 'CORRECT_RESULT':
            points.CORRECT_RESULT = rule.points;
            break;
          case 'CORRECT_TOTAL_GOALS':
            points.CORRECT_TOTAL_GOALS = rule.points;
            break;
          case 'CORRECT_GOAL_DIFFERENCE':
            points.CORRECT_GOAL_DIFFERENCE = rule.points;
            break;
          case 'EXACT_SCORE_BONUS':
            points.EXACT_SCORE_BONUS = rule.points;
            break;
        }
      });

      this.cachedPoints = points;
      this.cacheTimestamp = now;

      return points;
    } catch (error) {
      console.error('Error loading points from database, using defaults:', error);
      return this.DEFAULT_POINTS;
    }
  }

  /**
   * Clear the points cache (useful for testing or when rules are updated)
   */
  public static clearCache(): void {
    this.cachedPoints = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Main method to calculate total points for a prediction
   * Returns total points awarded
   */
  public static async calculateTotalPoints(score: PredictionScore): Promise<number> {
    const breakdown = await this.calculatePointsBreakdown(score);
    return breakdown.total;
  }

  /**
   * Calculate points with detailed breakdown
   * Returns individual points for each rule plus total
   */
  public static async calculatePointsBreakdown(score: PredictionScore): Promise<PointsBreakdown> {
    const POINTS = await this.loadPointsFromDatabase();

    const exactHomeScore = this.checkExactHomeScore(score, POINTS.EXACT_HOME_SCORE);
    const exactAwayScore = this.checkExactAwayScore(score, POINTS.EXACT_AWAY_SCORE);
    const correctResult = this.checkCorrectResult(score, POINTS.CORRECT_RESULT);
    const correctTotalGoals = this.checkCorrectTotalGoals(score, POINTS.CORRECT_TOTAL_GOALS);
    const correctGoalDifference = this.checkCorrectGoalDifference(score, POINTS.CORRECT_GOAL_DIFFERENCE);
    const exactScoreBonus = this.checkExactScoreBonus(score, POINTS.EXACT_SCORE_BONUS);

    const total =
      exactHomeScore +
      exactAwayScore +
      correctResult +
      correctTotalGoals +
      correctGoalDifference +
      exactScoreBonus;

    return {
      exactHomeScore,
      exactAwayScore,
      correctResult,
      correctTotalGoals,
      correctGoalDifference,
      exactScoreBonus,
      total,
    };
  }

  /**
   * Rule 1: Exact Home Score
   * Check if predicted home score matches actual home score
   */
  private static checkExactHomeScore(score: PredictionScore, points: number): number {
    return score.predictedHomeScore === score.actualHomeScore ? points : 0;
  }

  /**
   * Rule 2: Exact Away Score
   * Check if predicted away score matches actual away score
   */
  private static checkExactAwayScore(score: PredictionScore, points: number): number {
    return score.predictedAwayScore === score.actualAwayScore ? points : 0;
  }

  /**
   * Rule 3: Correct Result (Win/Draw/Loss)
   * Check if predicted match outcome matches actual outcome
   */
  private static checkCorrectResult(score: PredictionScore, points: number): number {
    const predictedOutcome = this.getMatchOutcome(
      score.predictedHomeScore,
      score.predictedAwayScore
    );
    const actualOutcome = this.getMatchOutcome(
      score.actualHomeScore,
      score.actualAwayScore
    );

    return predictedOutcome === actualOutcome ? points : 0;
  }

  /**
   * Rule 4: Correct Total Goals
   * Check if predicted total goals matches actual total goals
   */
  private static checkCorrectTotalGoals(score: PredictionScore, points: number): number {
    const predictedTotal =
      score.predictedHomeScore + score.predictedAwayScore;
    const actualTotal = score.actualHomeScore + score.actualAwayScore;

    return predictedTotal === actualTotal ? points : 0;
  }

  /**
   * Rule 5: Correct Goal Difference
   * Check if predicted goal difference matches actual goal difference
   * Examples:
   * - Prediction: 4-3 (diff: +1), Actual: 2-1 (diff: +1) = 1 point
   * - Prediction: 1-1 (diff: 0), Actual: 5-5 (diff: 0) = 1 point
   * - Prediction: 1-2 (diff: -1), Actual: 0-1 (diff: -1) = 1 point
   */
  private static checkCorrectGoalDifference(score: PredictionScore, points: number): number {
    const predictedDifference =
      score.predictedHomeScore - score.predictedAwayScore;
    const actualDifference = score.actualHomeScore - score.actualAwayScore;

    return predictedDifference === actualDifference ? points : 0;
  }

  /**
   * Rule 6: Exact Score Bonus
   * Bonus points if both home and away scores are exactly correct
   */
  private static checkExactScoreBonus(score: PredictionScore, points: number): number {
    const isExactScore =
      score.predictedHomeScore === score.actualHomeScore &&
      score.predictedAwayScore === score.actualAwayScore;

    return isExactScore ? points : 0;
  }

  /**
   * Helper method to determine match outcome
   */
  private static getMatchOutcome(
    homeScore: number,
    awayScore: number
  ): 'HOME_WIN' | 'AWAY_WIN' | 'DRAW' {
    if (homeScore > awayScore) return 'HOME_WIN';
    if (homeScore < awayScore) return 'AWAY_WIN';
    return 'DRAW';
  }
}

// Backward compatibility - export the old function signature
export const calculatePoints = async (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): Promise<number> => {
  return PointsCalculator.calculateTotalPoints({
    predictedHomeScore: predictedHome,
    predictedAwayScore: predictedAway,
    actualHomeScore: actualHome,
    actualAwayScore: actualAway,
  });
};
