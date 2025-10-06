import { PrismaClient } from '@prisma/client';
import { seedUsers, seedUserSessions, seedLoginHistory } from './seeds/users.seed';
import { seedLeagues, seedTeams, seedFavoriteTeams } from './seeds/leagues-teams.seed';
import { seedMatches, seedMatchEvents } from './seeds/matches.seed';
import { seedPredictions, seedStandings } from './seeds/predictions-standings.seed';
import {
  seedGroups,
  seedGroupMembers,
  seedAchievements,
  seedUserAchievements,
  seedNotifications,
} from './seeds/groups-achievements.seed';
import { seedPointsRules, seedAnalytics, seedAuditLogs } from './seeds/system-data.seed';
import { seedGameWeeks, seedTeamGameWeekStats, seedStandingsSnapshots } from './seeds/gameweeks.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('📦 Modular seed structure enabled\n');

  try {
    // 1. Create Users
    const users = await seedUsers();
    await seedUserSessions(users);
    await seedLoginHistory(users);

    // 2. Create Leagues & Teams
    const leagues = await seedLeagues();
    const teams = await seedTeams(leagues);
    await seedFavoriteTeams(users, teams);

    // 3. Create Matches & Events
    const matches = await seedMatches(leagues, teams);
    await seedMatchEvents(matches);

    // 4. Create Predictions & Standings
    await seedPredictions(users, matches);
    await seedStandings(leagues, teams);

    // 4.5. Create GameWeeks and Weekly Tracking
    await seedGameWeeks();
    await seedTeamGameWeekStats();
    await seedStandingsSnapshots();

    // 5. Create Groups & Achievements
    const groups = await seedGroups(users);
    await seedGroupMembers(groups, users);
    const achievements = await seedAchievements();
    await seedUserAchievements(users, achievements);
    await seedNotifications(users);

    // 6. Create System Data
    await seedPointsRules();
    await seedAnalytics();
    await seedAuditLogs(users);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ ${users.length} Users (Mustafa, Youssef, Ali, Mohammed, Majid)`);
    console.log(`   ✅ 3 Leagues (Premier League, La Liga, Bundesliga)`);
    console.log(`   ✅ ${teams.plTeams.length + teams.laLigaTeams.length + teams.bundesligaTeams.length} Teams with real logos`);
    console.log(`   ✅ ${matches.length} Matches (finished, live, and scheduled)`);
    console.log(`   ✅ ${groups.length} Groups`);
    console.log(`   ✅ ${achievements.length} Achievements`);
    console.log(`   ✅ 11 Points Rules`);
    console.log(`   ✅ 31 Days of Analytics`);
    console.log(`   ✅ Notifications, Sessions, Login History, Audit Logs`);
    console.log('\n🔑 Test User Credentials (all passwords: password123):');
    console.log('   📧 mustafa@example.com - Rank #1 (Super Admin)');
    console.log('   📧 youssef@example.com - Rank #2 (Admin)');
    console.log('   📧 ali@example.com - Rank #3');
    console.log('   📧 mohammed@example.com - Rank #4');
    console.log('   📧 majid@example.com - Rank #5');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
