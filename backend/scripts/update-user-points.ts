import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserPoints() {
  console.log('🔄 Updating User Total Points...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, name: true },
    });

    console.log(`Found ${users.length} users to update\n`);

    let updatedCount = 0;
    let totalPointsAwarded = 0;

    for (const user of users) {
      // Sum all prediction points for this user
      const result = await prisma.prediction.aggregate({
        where: { userId: user.id },
        _sum: { totalPoints: true },
      });

      const userTotalPoints = result._sum.totalPoints || 0;
      totalPointsAwarded += userTotalPoints;

      // Update user's total points
      await prisma.user.update({
        where: { id: user.id },
        data: { totalPoints: userTotalPoints },
      });

      updatedCount++;
      console.log(`✓ ${user.name}: ${userTotalPoints} points`);
    }

    console.log('\n✅ User points updated successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users Updated: ${updatedCount}`);
    console.log(`   - Total Points Awarded: ${totalPointsAwarded}`);
    console.log(`   - Average Points per User: ${(totalPointsAwarded / updatedCount).toFixed(2)}\n`);
  } catch (error) {
    console.error('❌ Error updating user points:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPoints()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
