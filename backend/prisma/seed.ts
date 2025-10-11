import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeds/classes/UserSeeder';
import { LeagueSeeder } from './seeds/classes/LeagueSeeder';
import { TeamSeeder } from './seeds/classes/TeamSeeder';
import { MatchSeeder } from './seeds/classes/MatchSeeder';
import { PredictionSeeder } from './seeds/classes/PredictionSeeder';
import { GameWeekSeeder } from './seeds/classes/GameWeekSeeder';
import { GroupSeeder } from './seeds/classes/GroupSeeder';
import { AchievementSeeder } from './seeds/classes/AchievementSeeder';
import { NotificationSeeder } from './seeds/classes/NotificationSeeder';
import { SystemDataSeeder } from './seeds/classes/SystemDataSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('📦 Modular seed structure with separate data and classes\n');

  try {
    // Initialize all seeders
    const userSeeder = new UserSeeder();
    const leagueSeeder = new LeagueSeeder();
    const teamSeeder = new TeamSeeder();
    const matchSeeder = new MatchSeeder();
    const predictionSeeder = new PredictionSeeder();
    const gameWeekSeeder = new GameWeekSeeder();
    const groupSeeder = new GroupSeeder();
    const achievementSeeder = new AchievementSeeder();
    const notificationSeeder = new NotificationSeeder();
    const systemDataSeeder = new SystemDataSeeder();

    // 1. Create Users
    const users = await userSeeder.seedUsers();
    await userSeeder.seedUserSessions(users);
    await userSeeder.seedLoginHistory(users);

    // 2. Create Leagues & Teams
    const leagues = await leagueSeeder.seedLeagues();
    const teams = await teamSeeder.seedTeams(leagues);
    await teamSeeder.seedFavoriteTeams(users, teams);

    // 3. Create Matches & Events
    const matches = await matchSeeder.seedMatches(leagues, teams);
    await matchSeeder.seedMatchEvents(matches);

    // 4. Create Predictions & Standings
    await predictionSeeder.seedPredictions(users, matches);
    await predictionSeeder.seedStandings(leagues, teams);

    // 4.5. Create GameWeeks and Weekly Tracking
    await gameWeekSeeder.seedGameWeeks();
    await gameWeekSeeder.seedTeamGameWeekStats();
    await gameWeekSeeder.seedStandingsSnapshots();

    // 5. Create Groups & Achievements
    const groups = await groupSeeder.seedGroups(users);
    await groupSeeder.seedGroupMembers(groups, users);
    const achievements = await achievementSeeder.seedAchievements();
    await achievementSeeder.seedUserAchievements(users, achievements);
    await notificationSeeder.seedNotifications(users);

    // 6. Create System Data
    await systemDataSeeder.seedPointsRules();
    await systemDataSeeder.seedAnalytics();
    await systemDataSeeder.seedAuditLogs(users);
    await systemDataSeeder.seedAppSettings();

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ ${users.length} Users (Mustafa, Youssef, Ali, Mohammed, Majid)`);
    console.log(`   ✅ 3 Leagues (Premier League, La Liga, Bundesliga)`);
    console.log(
      `   ✅ ${teams.plTeams.length + teams.laLigaTeams.length + teams.bundesligaTeams.length} Teams with real logos`
    );
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
