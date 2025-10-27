import prisma from '../src/config/database';
import { pointsUpdateService } from '../src/services/pointsUpdateService';

async function recalculateAllPoints() {
  try {
    console.log('🔄 Starting recalculation of all gameweek points...\n');

    // Get all groups
    const groups = await prisma.group.findMany({
      include: {
        members: true
      }
    });

    console.log(`Found ${groups.length} groups\n`);

    for (const group of groups) {
      console.log(`📊 Processing group: ${group.name} (${group.members.length} members)`);
      await pointsUpdateService.recalculateGroupPoints(group.id);
    }

    console.log('\n✅ All points recalculated successfully!');

    // Show sample of results
    const sampleMember = await prisma.groupMember.findFirst({
      where: {
        group: {
          isPublic: true,
          leagueId: 1
        }
      },
      include: {
        user: true
      }
    });

    if (sampleMember) {
      console.log('\n📈 Sample member data:');
      console.log(`User: ${sampleMember.user.username}`);
      console.log(`Total points: ${sampleMember.totalPoints}`);
      console.log(`Points by league:`, sampleMember.pointsByLeague);
      console.log(`Points by gameweek:`, JSON.stringify(sampleMember.pointsByGameweek, null, 2));
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

recalculateAllPoints();
