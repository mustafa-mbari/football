/**
 * Test Script: Multi-League Teams Functionality
 *
 * This script tests that the multi-league implementation works correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Testing Multi-League Teams Functionality\n');
  console.log('='.repeat(60) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  try {
    // Test 1: Verify TeamLeague migration
    console.log('Test 1: Verify TeamLeague migration completed');
    const teamLeagueCount = await prisma.teamLeague.count();
    const teamCount = await prisma.team.count();

    if (teamLeagueCount >= teamCount) {
      console.log(`✅ PASS - Found ${teamLeagueCount} TeamLeague records for ${teamCount} teams\n`);
      passedTests++;
    } else {
      console.log(`❌ FAIL - Expected at least ${teamCount} TeamLeague records, found ${teamLeagueCount}\n`);
      failedTests++;
    }

    // Test 2: Query teams by league
    console.log('Test 2: Query teams by league (Premier League)');
    const plLeague = await prisma.league.findFirst({
      where: { name: { contains: 'Premier', mode: 'insensitive' } }
    });

    if (plLeague) {
      const plTeams = await prisma.team.findMany({
        where: {
          leagues: {
            some: {
              leagueId: plLeague.id,
              isActive: true
            }
          }
        }
      });

      if (plTeams.length > 0) {
        console.log(`✅ PASS - Found ${plTeams.length} Premier League teams`);
        console.log(`   Sample teams: ${plTeams.slice(0, 3).map(t => t.name).join(', ')}\n`);
        passedTests++;
      } else {
        console.log(`❌ FAIL - No teams found for Premier League\n`);
        failedTests++;
      }
    } else {
      console.log(`⏭️  SKIP - Premier League not found in database\n`);
    }

    // Test 3: Get leagues for a team
    console.log('Test 3: Get all leagues for a single team');
    const sampleTeam = await prisma.team.findFirst({
      include: {
        leagues: {
          where: { isActive: true },
          include: {
            league: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (sampleTeam) {
      const leagueNames = sampleTeam.leagues.map(tl => tl.league.name);
      console.log(`✅ PASS - Team "${sampleTeam.name}" is in ${sampleTeam.leagues.length} league(s):`);
      console.log(`   Leagues: ${leagueNames.join(', ')}\n`);
      passedTests++;
    } else {
      console.log(`❌ FAIL - No teams found\n`);
      failedTests++;
    }

    // Test 4: Verify no orphaned teams (teams without leagues)
    console.log('Test 4: Check for orphaned teams (teams without leagues)');
    const orphanedTeams = await prisma.team.findMany({
      where: {
        leagues: {
          none: {}
        }
      }
    });

    if (orphanedTeams.length === 0) {
      console.log(`✅ PASS - No orphaned teams found\n`);
      passedTests++;
    } else {
      console.log(`⚠️  WARNING - Found ${orphanedTeams.length} orphaned teams:`);
      orphanedTeams.forEach(team => {
        console.log(`   - ${team.name} (ID: ${team.id})`);
      });
      console.log();
      failedTests++;
    }

    // Test 5: Test league teams query
    console.log('Test 5: Get teams for a league via League model');
    const leagueWithTeams = await prisma.league.findFirst({
      include: {
        teams: {
          where: { isActive: true },
          include: {
            team: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (leagueWithTeams && leagueWithTeams.teams.length > 0) {
      console.log(`✅ PASS - League "${leagueWithTeams.name}" has ${leagueWithTeams.teams.length} teams`);
      console.log(`   Sample: ${leagueWithTeams.teams.slice(0, 3).map(tl => tl.team.name).join(', ')}\n`);
      passedTests++;
    } else {
      console.log(`❌ FAIL - League query returned no teams\n`);
      failedTests++;
    }

    // Test 6: Verify unique constraint works
    console.log('Test 6: Test TeamLeague unique constraint (teamId, leagueId)');
    try {
      const firstTeamLeague = await prisma.teamLeague.findFirst();

      if (firstTeamLeague) {
        // Try to create duplicate
        await prisma.teamLeague.create({
          data: {
            teamId: firstTeamLeague.teamId,
            leagueId: firstTeamLeague.leagueId,
            isActive: true
          }
        });

        console.log(`❌ FAIL - Unique constraint not working (duplicate created)\n`);
        failedTests++;
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`✅ PASS - Unique constraint working (prevented duplicate)\n`);
        passedTests++;
      } else {
        console.log(`❌ FAIL - Unexpected error: ${error.message}\n`);
        failedTests++;
      }
    }

    // Test 7: Check if any team is in multiple leagues (Champions League scenario)
    console.log('Test 7: Check for teams in multiple leagues');
    const multiLeagueTeams = await prisma.team.findMany({
      where: {
        leagues: {
          some: {}
        }
      },
      include: {
        leagues: {
          where: { isActive: true },
          include: {
            league: {
              select: { name: true }
            }
          }
        }
      }
    });

    const teamsInMultipleLeagues = multiLeagueTeams.filter(t => t.leagues.length > 1);

    if (teamsInMultipleLeagues.length > 0) {
      console.log(`✅ SUCCESS - Found ${teamsInMultipleLeagues.length} team(s) in multiple leagues:`);
      teamsInMultipleLeagues.slice(0, 5).forEach(team => {
        const leagues = team.leagues.map(tl => tl.league.name).join(', ');
        console.log(`   - ${team.name}: ${leagues}`);
      });
      console.log();
    } else {
      console.log(`ℹ️  INFO - No teams currently in multiple leagues (ready for Champions League!)\n`);
    }

    // Test 8: Verify Table relations still work
    console.log('Test 8: Verify Table (standings) relations work');
    const standingsWithTeam = await prisma.table.findFirst({
      include: {
        team: {
          include: {
            leagues: {
              where: { isActive: true },
              include: {
                league: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    if (standingsWithTeam && standingsWithTeam.team) {
      console.log(`✅ PASS - Standings linked to team "${standingsWithTeam.team.name}"`);
      console.log(`   Team is in: ${standingsWithTeam.team.leagues.map(tl => tl.league.name).join(', ')}\n`);
      passedTests++;
    } else {
      console.log(`⏭️  SKIP - No standings data found\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 Test Summary:');
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📋 Total: ${passedTests + failedTests}`);
    console.log('='.repeat(60) + '\n');

    if (failedTests === 0) {
      console.log('🎉 All tests passed! Multi-league implementation is working correctly.\n');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Test suite error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runTests };
