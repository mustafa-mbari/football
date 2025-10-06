const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const matchCount = await prisma.match.count();
    const teamCount = await prisma.team.count();
    const leagueCount = await prisma.league.count();

    console.log('Database Status:');
    console.log('- Users:', userCount);
    console.log('- Leagues:', leagueCount);
    console.log('- Teams:', teamCount);
    console.log('- Matches:', matchCount);

    if (userCount > 0) {
      const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
      console.log('\nUsers:');
      users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
