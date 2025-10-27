import prisma from '../src/config/database';

async function checkMustafaGW9() {
  try {
    // Check all predictions for mustafa in Premier League
    const allPredictions = await prisma.prediction.findMany({
      where: {
        userId: 2, // mustafa
        match: {
          leagueId: 1 // Premier League
        }
      },
      include: {
        match: {
          select: {
            weekNumber: true,
            homeTeam: { select: { shortName: true } },
            awayTeam: { select: { shortName: true } },
            status: true,
            homeScore: true,
            awayScore: true
          }
        }
      },
      orderBy: {
        match: {
          weekNumber: 'asc'
        }
      }
    });

    console.log(`Total Premier League predictions for mustafa: ${allPredictions.length}\n`);

    // Group by week
    const byWeek: Record<number, any[]> = {};
    allPredictions.forEach(p => {
      const week = p.match.weekNumber || 0;
      if (!byWeek[week]) byWeek[week] = [];
      byWeek[week].push(p);
    });

    Object.keys(byWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
      console.log(`\n=== Gameweek ${week} (${byWeek[parseInt(week)].length} predictions) ===`);
      byWeek[parseInt(week)].forEach(p => {
        console.log(`${p.match.homeTeam.shortName} vs ${p.match.awayTeam.shortName}: Prediction ${p.predictedHomeScore}-${p.predictedAwayScore}, Actual ${p.match.homeScore}-${p.match.awayScore}, Points: ${p.totalPoints}, Status: ${p.match.status}, Processed: ${p.isProcessed}`);
      });
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkMustafaGW9();
