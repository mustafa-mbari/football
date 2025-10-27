import prisma from '../src/config/database';

async function debugRecalculation() {
  try {
    const userId = 2; // mustafa
    const groupId = 9; // Premier League public group

    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Get all relevant predictions
    const predictions = await prisma.prediction.findMany({
      where: {
        userId,
        isProcessed: true,
        match: {
          leagueId: group.leagueId!
        }
      },
      include: {
        match: {
          select: {
            leagueId: true,
            weekNumber: true,
            homeTeam: { select: { shortName: true } },
            awayTeam: { select: { shortName: true } }
          }
        }
      }
    });

    console.log(`Total predictions: ${predictions.length}\n`);

    // Group points by league and by gameweek
    const pointsByLeague: Record<string, number> = {};
    const pointsByGameweek: Record<string, Record<string, number>> = {};

    for (const prediction of predictions) {
      const leagueKey = prediction.match.leagueId.toString();
      const weekNumber = prediction.match.weekNumber;

      console.log(`Match: ${prediction.match.homeTeam.shortName} vs ${prediction.match.awayTeam.shortName}, Week: ${weekNumber}, Points: ${prediction.totalPoints}`);

      // Accumulate league totals
      pointsByLeague[leagueKey] = (pointsByLeague[leagueKey] || 0) + prediction.totalPoints;

      // Accumulate gameweek totals
      if (weekNumber !== null && weekNumber !== undefined) {
        if (!pointsByGameweek[leagueKey]) {
          pointsByGameweek[leagueKey] = {};
        }
        const weekKey = weekNumber.toString();
        pointsByGameweek[leagueKey][weekKey] = (pointsByGameweek[leagueKey][weekKey] || 0) + prediction.totalPoints;
      }
    }

    console.log('\n\nFinal Results:');
    console.log('Points by League:', pointsByLeague);
    console.log('Points by Gameweek:', JSON.stringify(pointsByGameweek, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

debugRecalculation();
