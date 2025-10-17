import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportExistingData() {
  console.log('📦 Exporting existing data to seed files...\n');

  try {
    const exportDir = path.join(__dirname, '../prisma/seeds/data/backup');

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
      console.log('✓ Created backup directory\n');
    }

    // Export Users
    console.log('👥 Exporting users...');
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        avatar: true,
        bio: true,
        totalPoints: true,
        weeklyPoints: true,
        monthlyPoints: true,
        seasonPoints: true,
        predictionAccuracy: true,
        totalPredictions: true,
        correctPredictions: true,
        currentStreak: true,
        bestStreak: true,
        rank: true,
        lastLoginAt: true,
        createdAt: true
      }
    });
    fs.writeFileSync(
      path.join(exportDir, 'users-backup.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`   ✓ Exported ${users.length} users\n`);

    // Export Predictions
    console.log('🎯 Exporting predictions...');
    const predictions = await prisma.prediction.findMany({
      include: {
        match: {
          select: {
            homeTeam: { select: { code: true } },
            awayTeam: { select: { code: true } },
            matchDate: true,
            league: { select: { code: true } }
          }
        },
        user: {
          select: { email: true }
        }
      }
    });

    const predictionsExport = predictions.map(p => ({
      userEmail: p.user.email,
      leagueCode: p.match.league.code,
      homeTeamCode: p.match.homeTeam.code,
      awayTeamCode: p.match.awayTeam.code,
      matchDate: p.match.matchDate,
      predictedHomeScore: p.predictedHomeScore,
      predictedAwayScore: p.predictedAwayScore,
      predictedResult: p.predictedResult,
      confidence: p.confidence,
      resultPoints: p.resultPoints,
      scorePoints: p.scorePoints,
      bonusPoints: p.bonusPoints,
      totalPoints: p.totalPoints,
      isProcessed: p.isProcessed,
      isLate: p.isLate,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    fs.writeFileSync(
      path.join(exportDir, 'predictions-backup.json'),
      JSON.stringify(predictionsExport, null, 2)
    );
    console.log(`   ✓ Exported ${predictions.length} predictions\n`);

    // Export Groups (old format)
    console.log('👥 Exporting groups...');
    const groups = await prisma.group.findMany({
      include: {
        owner: { select: { email: true } },
        members: {
          include: {
            user: { select: { email: true } }
          }
        }
      }
    });

    const groupsExport = groups.map(g => ({
      name: g.name,
      description: g.description,
      code: g.code,
      isPrivate: g.isPrivate,
      joinCode: g.joinCode,
      maxMembers: g.maxMembers,
      ownerEmail: g.owner.email,
      logoUrl: g.logoUrl,
      members: g.members.map(m => ({
        userEmail: m.user.email,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      createdAt: g.createdAt
    }));

    fs.writeFileSync(
      path.join(exportDir, 'groups-backup.json'),
      JSON.stringify(groupsExport, null, 2)
    );
    console.log(`   ✓ Exported ${groups.length} groups\n`);

    // Export User Achievements
    console.log('🏆 Exporting user achievements...');
    const userAchievements = await prisma.userAchievement.findMany({
      include: {
        user: { select: { email: true } },
        achievement: { select: { name: true } }
      }
    });

    const achievementsExport = userAchievements.map(ua => ({
      userEmail: ua.user.email,
      achievementName: ua.achievement.name,
      progress: ua.progress,
      unlockedAt: ua.unlockedAt
    }));

    fs.writeFileSync(
      path.join(exportDir, 'user-achievements-backup.json'),
      JSON.stringify(achievementsExport, null, 2)
    );
    console.log(`   ✓ Exported ${userAchievements.length} user achievements\n`);

    // Export Favorite Teams
    console.log('⭐ Exporting favorite teams...');
    const favoriteTeams = await prisma.userFavoriteTeam.findMany({
      include: {
        user: { select: { email: true } },
        team: { select: { code: true } }
      }
    });

    const favoritesExport = favoriteTeams.map(ft => ({
      userEmail: ft.user.email,
      teamCode: ft.team.code,
      createdAt: ft.createdAt
    }));

    fs.writeFileSync(
      path.join(exportDir, 'favorite-teams-backup.json'),
      JSON.stringify(favoritesExport, null, 2)
    );
    console.log(`   ✓ Exported ${favoriteTeams.length} favorite teams\n`);

    console.log('✅ Export completed successfully!\n');
    console.log('📁 Files saved to:', exportDir);
    console.log('\nBackup files created:');
    console.log('  - users-backup.json');
    console.log('  - predictions-backup.json');
    console.log('  - groups-backup.json');
    console.log('  - user-achievements-backup.json');
    console.log('  - favorite-teams-backup.json\n');

  } catch (error) {
    console.error('❌ Error during export:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportExistingData()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
