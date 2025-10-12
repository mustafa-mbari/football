import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePointsSystem() {
  console.log('🔄 Starting Points System Update...\n');

  try {
    // Step 1: Add new enum values (if not exists - handled by Prisma)
    console.log('✅ Step 1: Enum values will be validated by Prisma\n');

    // Step 2: Delete all old PointsRule records
    console.log('🗑️  Step 2: Deleting old PointsRule records...');
    const deletedRules = await prisma.pointsRule.deleteMany({});
    console.log(`   Deleted ${deletedRules.count} old rules\n`);

    // Step 3: Insert 5 new PointsRule records
    console.log('➕ Step 3: Inserting new PointsRule records...');
    const newRules = [
      {
        name: 'Exact Home Score',
        description: 'Predicting the exact home team score',
        points: 1,
        type: 'EXACT_HOME_SCORE',
        priority: 1,
        isActive: true,
      },
      {
        name: 'Exact Away Score',
        description: 'Predicting the exact away team score',
        points: 1,
        type: 'EXACT_AWAY_SCORE',
        priority: 2,
        isActive: true,
      },
      {
        name: 'Correct Total Goals',
        description: 'Predicting the correct total number of goals for both teams',
        points: 2,
        type: 'CORRECT_TOTAL_GOALS',
        priority: 4,
        isActive: true,
      },
      {
        name: 'Correct Result',
        description: 'Predicting the correct match outcome (win/draw/loss)',
        points: 2,
        type: 'CORRECT_RESULT',
        priority: 3,
        isActive: true,
      },
      {
        name: 'Exact Score Bonus',
        description: 'Bonus points for predicting the exact final score',
        points: 3,
        type: 'EXACT_SCORE_BONUS',
        priority: 5,
        isActive: true,
      },
    ];

    for (const rule of newRules) {
      await prisma.pointsRule.create({ data: rule as any });
      console.log(`   ✓ Created: ${rule.name} (${rule.points} points)`);
    }
    console.log();

    // Step 4: Reset all User points to zero
    console.log('🔄 Step 4: Resetting all User points to zero...');
    const updatedUsers = await prisma.user.updateMany({
      data: {
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        seasonPoints: 0,
      },
    });
    console.log(`   Reset points for ${updatedUsers.count} users\n`);

    // Step 5: Reset all Prediction points to zero
    console.log('🔄 Step 5: Resetting all Prediction points to zero...');
    const updatedPredictions = await prisma.prediction.updateMany({
      data: {
        resultPoints: 0,
        scorePoints: 0,
        bonusPoints: 0,
        totalPoints: 0,
      },
    });
    console.log(`   Reset points for ${updatedPredictions.count} predictions\n`);

    // Summary
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Points Rules: ${newRules.length}`);
    console.log(`   - Users Reset: ${updatedUsers.count}`);
    console.log(`   - Predictions Reset: ${updatedPredictions.count}`);
    console.log('\n🔔 Next Steps:');
    console.log('   1. Verify new rules at: http://localhost:8080/admin/predictions');
    console.log('   2. Recalculate points via API: POST /predictions/recalculate-all-points');
    console.log('   3. Update user aggregate points (run update-user-points.ts)\n');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePointsSystem()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
