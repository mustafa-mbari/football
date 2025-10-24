import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLeagues() {
  const leagues = await prisma.league.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      season: true
    }
  });

  console.log('Existing leagues:');
  leagues.forEach(l => {
    console.log(`  ${l.id}. ${l.name} (${l.code}) - ${l.season}`);
  });

  await prisma.$disconnect();
}

checkLeagues();
