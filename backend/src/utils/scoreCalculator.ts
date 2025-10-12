/**
 * @deprecated Use PointsCalculator class instead for better maintainability
 * This file is kept for backward compatibility
 */

import { PointsCalculator } from './PointsCalculator';

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

// Export the new calculator for direct use
export { PointsCalculator } from './PointsCalculator';
