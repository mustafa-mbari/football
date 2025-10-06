const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSeason() {
  const leagues = await prisma.league.findMany();
  console.log('Leagues:');
  leagues.forEach(league => {
    console.log(`  - ${league.name} (Season: ${league.season})`);
  });
  await prisma.$disconnect();
}

checkSeason();
