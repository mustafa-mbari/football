import prisma from '../src/config/database';
import { pointsUpdateService } from '../src/services/pointsUpdateService';

async function fixAllUnprocessedPredictions() {
  try {
    console.log('🔍 Checking for unprocessed predictions with points...\n');

    // Find all predictions that have points but aren't marked as processed
    const unprocessedPredictions = await prisma.prediction.findMany({
      where: {
        isProcessed: false,
        totalPoints: {
          gt: 0
        }
      },
      include: {
        match: {
          select: {
            weekNumber: true,
            status: true,
            league: {
              select: {
                id: true,
                name: true
              }
            },
            homeTeam: { select: { shortName: true } },
            awayTeam: { select: { shortName: true } }
          }
        },
        user: {
          select: {
            username: true
          }
        }
      }
    });

    console.log(`Found ${unprocessedPredictions.length} unprocessed predictions with points\n`);

    if (unprocessedPredictions.length === 0) {
      console.log('✅ All predictions are already processed!');
      await prisma.$disconnect();
      return;
    }

    // Group by league
    const byLeague: Record<string, typeof unprocessedPredictions> = {};
    unprocessedPredictions.forEach(p => {
      const leagueName = p.match.league.name;
      if (!byLeague[leagueName]) {
        byLeague[leagueName] = [];
      }
      byLeague[leagueName].push(p);
    });

    // Show summary
    console.log('📊 Summary by league:');
    Object.entries(byLeague).forEach(([league, preds]) => {
      console.log(`  ${league}: ${preds.length} predictions`);
    });
    console.log();

    // Update all unprocessed predictions
    console.log('🔄 Marking all as processed...\n');

    const updateResult = await prisma.prediction.updateMany({
      where: {
        isProcessed: false,
        totalPoints: {
          gt: 0
        }
      },
      data: {
        isProcessed: true,
        status: 'COMPLETED'
      }
    });

    console.log(`✅ Marked ${updateResult.count} predictions as processed\n`);

    // Now recalculate all group points
    console.log('🔄 Recalculating all group points...\n');

    const groups = await prisma.group.findMany({
      include: {
        league: true,
        members: true
      }
    });

    for (const group of groups) {
      console.log(`  Processing: ${group.name} (${group.members.length} members)`);
      await pointsUpdateService.recalculateGroupPoints(group.id);
    }

    console.log('\n✅ All done! All groups have been recalculated with correct gameweek points.');

    // Show sample results for each league
    console.log('\n📈 Sample results by league:\n');

    const leagues = await prisma.league.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        priority: 'asc'
      }
    });

    for (const league of leagues) {
      const publicGroup = await prisma.group.findFirst({
        where: {
          isPublic: true,
          leagueId: league.id
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  username: true
                }
              }
            },
            take: 1
          }
        }
      });

      if (publicGroup && publicGroup.members.length > 0) {
        const member = publicGroup.members[0];
        console.log(`${league.name}:`);
        console.log(`  Sample user: ${member.user.username}`);
        console.log(`  Total points: ${member.totalPoints}`);
        console.log(`  Points by gameweek:`, JSON.stringify(member.pointsByGameweek, null, 2));
        console.log();
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixAllUnprocessedPredictions();
