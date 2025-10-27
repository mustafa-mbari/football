import prisma from '../src/config/database';

async function checkWeekNumbers() {
  try {
    // Check finished matches by weekNumber
    const matchesByWeek = await prisma.match.groupBy({
      by: ['weekNumber'],
      where: {
        leagueId: 1,
        status: 'FINISHED'
      },
      _count: {
        id: true
      },
      orderBy: {
        weekNumber: 'asc'
      }
    });

    console.log('Finished matches by week:');
    console.table(matchesByWeek);

    // Check a sample of finished matches
    const sampleMatches = await prisma.match.findMany({
      where: {
        leagueId: 1,
        status: 'FINISHED'
      },
      select: {
        id: true,
        weekNumber: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        homeScore: true,
        awayScore: true
      },
      take: 10
    });

    console.log('\nSample finished matches:');
    console.table(sampleMatches);

    // Check predictions with points
    const predictionsWithPoints = await prisma.prediction.findMany({
      where: {
        match: {
          leagueId: 1,
          status: 'FINISHED'
        },
        totalPoints: {
          gt: 0
        }
      },
      select: {
        userId: true,
        totalPoints: true,
        match: {
          select: {
            weekNumber: true,
            homeTeam: { select: { shortName: true } },
            awayTeam: { select: { shortName: true } }
          }
        }
      },
      take: 20
    });

    console.log(`\nPredictions with points: ${predictionsWithPoints.length}`);
    console.table(predictionsWithPoints);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkWeekNumbers();
