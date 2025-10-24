import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTeamLeague() {
  console.log('🔍 Verifying TeamLeague data...\n');

  const result = await prisma.$queryRaw<Array<{
    id: number;
    teamId: number;
    leagueId: number;
    team_name: string;
    league_name: string;
    isActive: boolean;
  }>>`
    SELECT
      tl.id,
      tl."teamId",
      tl."leagueId",
      tl."isActive",
      t.name as team_name,
      l.name as league_name
    FROM "TeamLeague" tl
    JOIN "Team" t ON t.id = tl."teamId"
    JOIN "League" l ON l.id = tl."leagueId"
    ORDER BY l.name, t.name
    LIMIT 20
  `;

  console.table(result);

  const count = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "TeamLeague"
  `;

  console.log(`\n✅ Total TeamLeague records: ${count[0].count}\n`);

  await prisma.$disconnect();
}

verifyTeamLeague();
