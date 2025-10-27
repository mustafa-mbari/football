import prisma from '../src/config/database';

async function markGW9Processed() {
  try {
    // Update all gameweek 9 predictions that have points but aren't marked as processed
    const result = await prisma.prediction.updateMany({
      where: {
        match: {
          weekNumber: 9,
          leagueId: 1,
          status: 'FINISHED'
        },
        isProcessed: false
      },
      data: {
        isProcessed: true,
        status: 'COMPLETED'
      }
    });

    console.log(`✅ Marked ${result.count} Gameweek 9 predictions as processed`);

    // Now recalculate group points
    const { pointsUpdateService } = await import('../src/services/pointsUpdateService');

    console.log('\n🔄 Recalculating group points...');
    await pointsUpdateService.recalculateGroupPoints(9); // Premier League public group

    console.log('\n✅ Done! Gameweek 9 points should now appear.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

markGW9Processed();
