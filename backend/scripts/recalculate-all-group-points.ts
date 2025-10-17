import { PrismaClient } from '@prisma/client';
import { pointsUpdateService } from '../src/services/pointsUpdateService';

const prisma = new PrismaClient();

async function recalculateAllGroupPoints() {
  console.log('🔄 Starting full group points recalculation...\n');

  try {
    // Recalculate all group points using the service
    await pointsUpdateService.recalculateAllGroupPoints();

    // Show summary
    const groups = await prisma.group.findMany({
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    console.log('\n📊 Summary:');
    console.log(`   Total groups: ${groups.length}`);

    for (const group of groups) {
      const members = await prisma.groupMember.findMany({
        where: { groupId: group.id },
        orderBy: { totalPoints: 'desc' },
        take: 3,
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      });

      console.log(`\n   Group: ${group.name}`);
      console.log(`   Members: ${group._count.members}`);
      console.log(`   Top 3:`);
      members.forEach((m, i) => {
        console.log(`      ${i + 1}. ${m.user.username}: ${m.totalPoints} points`);
      });
    }

    console.log('\n✅ Recalculation completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during recalculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recalculateAllGroupPoints()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
