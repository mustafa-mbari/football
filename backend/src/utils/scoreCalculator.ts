export const calculatePoints = (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number => {
  // Exact score: 3 points
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }

  // Correct outcome (win/draw/loss): 1 point
  const predictedOutcome = getOutcome(predictedHome, predictedAway);
  const actualOutcome = getOutcome(actualHome, actualAway);

  if (predictedOutcome === actualOutcome) {
    return 1;
  }

  return 0;
};

const getOutcome = (homeScore: number, awayScore: number): string => {
  if (homeScore > awayScore) return 'home_win';
  if (homeScore < awayScore) return 'away_win';
  return 'draw';
};
