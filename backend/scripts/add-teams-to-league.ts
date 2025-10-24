/**
 * Helper Script: Add Existing Teams to a New League
 *
 * This script allows you to associate existing teams with a new league
 * (e.g., adding La Liga and Premier League teams to Champions League)
 *
 * Usage:
 *   npx ts-node scripts/add-teams-to-league.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTeamsToLeague() {
  console.log('🎯 Add Teams to League Script\n');

  // Example: Adding teams to Champions League
  // You can modify this to add any teams to any league

  try {
    // Step 1: Get or create the Champions League
    console.log('📋 Step 1: Checking for Champions League...');

    let championsLeague = await prisma.league.findFirst({
      where: {
        OR: [
          { code: 'CL' },
          { name: { contains: 'Champions League', mode: 'insensitive' } }
        ]
      }
    });

    if (!championsLeague) {
      console.log('   ⚠️  Champions League not found. Creating it...');

      championsLeague = await prisma.league.create({
        data: {
          name: 'UEFA Champions League',
          code: 'CL',
          country: 'Europe',
          logoUrl: 'https://example.com/champions-league-logo.svg',
          season: '2024/2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-05-31'),
          isActive: true,
          priority: 10
        }
      });

      console.log(`   ✅ Created Champions League (ID: ${championsLeague.id})\n`);
    } else {
      console.log(`   ✅ Found Champions League (ID: ${championsLeague.id})\n`);
    }

    // Step 2: Define teams to add (examples from different leagues)
    console.log('📋 Step 2: Selecting teams to add to Champions League...\n');

    // Example: Find teams by name across different leagues
    const teamNamesToAdd = [
      // Premier League teams
      'Manchester City',
      'Arsenal',
      'Liverpool',
      'Manchester United',

      // La Liga teams
      'Real Madrid',
      'Barcelona',
      'Atlético Madrid',

      // Bundesliga teams
      'Bayern Munich',
      'Borussia Dortmund',
      'RB Leipzig',

      // Serie A teams
      'Inter Milan',
      'AC Milan',
      'Juventus FC',
      'SSC Napoli'
    ];

    const teams = await prisma.team.findMany({
      where: {
        name: {
          in: teamNamesToAdd
        }
      },
      include: {
        leagues: {
          include: {
            league: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`   Found ${teams.length} teams matching the criteria:`);
    teams.forEach(team => {
      const currentLeagues = team.leagues.map(tl => tl.league.name).join(', ');
      console.log(`   - ${team.name} (currently in: ${currentLeagues})`);
    });
    console.log();

    // Step 3: Add teams to Champions League
    console.log('📋 Step 3: Adding teams to Champions League...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const team of teams) {
      // Check if team is already in Champions League
      const existing = await prisma.teamLeague.findUnique({
        where: {
          teamId_leagueId: {
            teamId: team.id,
            leagueId: championsLeague.id
          }
        }
      });

      if (existing) {
        console.log(`   ⏭️  ${team.name} - already in Champions League`);
        skippedCount++;
        continue;
      }

      // Add team to Champions League
      await prisma.teamLeague.create({
        data: {
          teamId: team.id,
          leagueId: championsLeague.id,
          isActive: true
        }
      });

      console.log(`   ✅ ${team.name} - added to Champions League`);
      addedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Teams added: ${addedCount}`);
    console.log(`   ⏭️  Teams skipped (already added): ${skippedCount}`);
    console.log(`   📋 Total teams processed: ${teams.length}\n`);

    // Step 4: Verify the final state
    console.log('📋 Step 4: Verifying Champions League teams...\n');

    const clTeams = await prisma.teamLeague.findMany({
      where: {
        leagueId: championsLeague.id,
        isActive: true
      },
      include: {
        team: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        team: {
          name: 'asc'
        }
      }
    });

    console.log(`   Champions League now has ${clTeams.length} teams:`);
    clTeams.forEach((tl, index) => {
      console.log(`   ${index + 1}. ${tl.team.name}`);
    });
    console.log();

    console.log('✅ Script completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative function: Add teams by team IDs
export async function addTeamsByIds(leagueId: number, teamIds: number[]) {
  console.log(`🎯 Adding ${teamIds.length} teams to league ID ${leagueId}...\n`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const teamId of teamIds) {
    const existing = await prisma.teamLeague.findUnique({
      where: {
        teamId_leagueId: {
          teamId,
          leagueId
        }
      }
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    await prisma.teamLeague.create({
      data: {
        teamId,
        leagueId,
        isActive: true
      }
    });

    addedCount++;
  }

  console.log(`✅ Added ${addedCount} teams, skipped ${skippedCount}\n`);
  await prisma.$disconnect();
}

// Run the main function
if (require.main === module) {
  addTeamsToLeague()
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
