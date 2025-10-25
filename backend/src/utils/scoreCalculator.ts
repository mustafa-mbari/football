/**
 * @deprecated Use PointsCalculator class instead for better maintainability
 * This file is kept for backward compatibility
 */

import { PointsCalculator } from './PointsCalculator';

export const calculatePoints = async (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): Promise<number> => {
  return await PointsCalculator.calculateTotalPoints({
    predictedHomeScore: predictedHome,
    predictedAwayScore: predictedAway,
    actualHomeScore: actualHome,
    actualAwayScore: actualAway,
  });
};

// Export the new calculator for direct use
export { PointsCalculator } from './PointsCalculator';
