import prisma from '../src/config/database';

async function showGameweekPoints() {
  try {
    const members = await prisma.groupMember.findMany({
      where: {
        group: {
          isPublic: true,
          leagueId: 1 // Premier League
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    console.log('Premier League Public Group Members:\n');

    for (const member of members) {
      console.log(`\n======== ${member.user.username} (ID: ${member.user.id}) ========`);
      console.log(`Total Points: ${member.totalPoints}`);
      console.log(`Points by League:`, member.pointsByLeague);
      console.log(`Points by Gameweek:`, JSON.stringify(member.pointsByGameweek, null, 2));
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

showGameweekPoints();
