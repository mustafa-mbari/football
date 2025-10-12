/**
 * PointsCalculator Class
 * Handles all points calculation logic for predictions
 * Each rule has its own method for clarity and maintainability
 */

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
  exactScoreBonus: number;
  total: number;
}

export class PointsCalculator {
  // Points configuration (can be loaded from database)
  private static readonly POINTS = {
    EXACT_HOME_SCORE: 1,
    EXACT_AWAY_SCORE: 1,
    CORRECT_RESULT: 3,
    CORRECT_TOTAL_GOALS: 2,
    EXACT_SCORE_BONUS: 3,
  };

  /**
   * Main method to calculate total points for a prediction
   * Returns total points awarded
   */
  public static calculateTotalPoints(score: PredictionScore): number {
    const breakdown = this.calculatePointsBreakdown(score);
    return breakdown.total;
  }

  /**
   * Calculate points with detailed breakdown
   * Returns individual points for each rule plus total
   */
  public static calculatePointsBreakdown(score: PredictionScore): PointsBreakdown {
    const exactHomeScore = this.checkExactHomeScore(score);
    const exactAwayScore = this.checkExactAwayScore(score);
    const correctResult = this.checkCorrectResult(score);
    const correctTotalGoals = this.checkCorrectTotalGoals(score);
    const exactScoreBonus = this.checkExactScoreBonus(score);

    const total =
      exactHomeScore +
      exactAwayScore +
      correctResult +
      correctTotalGoals +
      exactScoreBonus;

    return {
      exactHomeScore,
      exactAwayScore,
      correctResult,
      correctTotalGoals,
      exactScoreBonus,
      total,
    };
  }

  /**
   * Rule 1: Exact Home Score
   * Check if predicted home score matches actual home score
   */
  private static checkExactHomeScore(score: PredictionScore): number {
    return score.predictedHomeScore === score.actualHomeScore
      ? this.POINTS.EXACT_HOME_SCORE
      : 0;
  }

  /**
   * Rule 2: Exact Away Score
   * Check if predicted away score matches actual away score
   */
  private static checkExactAwayScore(score: PredictionScore): number {
    return score.predictedAwayScore === score.actualAwayScore
      ? this.POINTS.EXACT_AWAY_SCORE
      : 0;
  }

  /**
   * Rule 3: Correct Result (Win/Draw/Loss)
   * Check if predicted match outcome matches actual outcome
   */
  private static checkCorrectResult(score: PredictionScore): number {
    const predictedOutcome = this.getMatchOutcome(
      score.predictedHomeScore,
      score.predictedAwayScore
    );
    const actualOutcome = this.getMatchOutcome(
      score.actualHomeScore,
      score.actualAwayScore
    );

    return predictedOutcome === actualOutcome ? this.POINTS.CORRECT_RESULT : 0;
  }

  /**
   * Rule 4: Correct Total Goals
   * Check if predicted total goals matches actual total goals
   */
  private static checkCorrectTotalGoals(score: PredictionScore): number {
    const predictedTotal =
      score.predictedHomeScore + score.predictedAwayScore;
    const actualTotal = score.actualHomeScore + score.actualAwayScore;

    return predictedTotal === actualTotal
      ? this.POINTS.CORRECT_TOTAL_GOALS
      : 0;
  }

  /**
   * Rule 5: Exact Score Bonus
   * Bonus points if both home and away scores are exactly correct
   */
  private static checkExactScoreBonus(score: PredictionScore): number {
    const isExactScore =
      score.predictedHomeScore === score.actualHomeScore &&
      score.predictedAwayScore === score.actualAwayScore;

    return isExactScore ? this.POINTS.EXACT_SCORE_BONUS : 0;
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
export const calculatePoints = (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number => {
  return PointsCalculator.calculateTotalPoints({
    predictedHomeScore: predictedHome,
    predictedAwayScore: predictedAway,
    actualHomeScore: actualHome,
    actualAwayScore: actualAway,
  });
};
