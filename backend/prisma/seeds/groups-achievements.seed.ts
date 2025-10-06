import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedGroups(users: any[]) {
  console.log('\n👥 Creating groups...');
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: 'Premier League Fans',
        description: 'For all Premier League enthusiasts',
        ownerId: users[0].id,
        isPrivate: false,
        logoUrl: 'https://ui-avatars.com/api/?name=PL+Fans&background=3D195B&color=fff',
      },
    }),
    prisma.group.create({
      data: {
        name: 'La Liga Experts',
        description: 'Spanish football predictions group',
        ownerId: users[1].id,
        isPrivate: false,
        logoUrl: 'https://ui-avatars.com/api/?name=La+Liga&background=FF6B00&color=fff',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Top Predictors',
        description: 'Elite prediction masters only',
        ownerId: users[0].id,
        isPrivate: true,
        joinCode: 'ELITE2025',
        logoUrl: 'https://ui-avatars.com/api/?name=Top+Predictors&background=FFD700&color=000',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Bundesliga Watchers',
        description: 'German football prediction group',
        ownerId: users[3].id,
        isPrivate: false,
        logoUrl: 'https://ui-avatars.com/api/?name=Bundesliga&background=D3010C&color=fff',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Weekend Warriors',
        description: 'Casual weekend match predictions',
        ownerId: users[2].id,
        isPrivate: false,
        logoUrl: 'https://ui-avatars.com/api/?name=Weekend+Warriors&background=28A745&color=fff',
      },
    }),
  ]);
  console.log(`✅ Created ${groups.length} groups`);
  return groups;
}

export async function seedGroupMembers(groups: any[], users: any[]) {
  console.log('\n👤 Adding group members...');
  await prisma.groupMember.createMany({
    data: [
      // Premier League Fans
      { groupId: groups[0].id, userId: users[0].id, role: 'OWNER' },
      { groupId: groups[0].id, userId: users[1].id, role: 'MEMBER' },
      { groupId: groups[0].id, userId: users[2].id, role: 'ADMIN' },
      { groupId: groups[0].id, userId: users[4].id, role: 'MEMBER' },

      // La Liga Experts
      { groupId: groups[1].id, userId: users[1].id, role: 'OWNER' },
      { groupId: groups[1].id, userId: users[0].id, role: 'MEMBER' },
      { groupId: groups[1].id, userId: users[3].id, role: 'MEMBER' },

      // Top Predictors (private)
      { groupId: groups[2].id, userId: users[0].id, role: 'OWNER' },
      { groupId: groups[2].id, userId: users[1].id, role: 'MEMBER' },
      { groupId: groups[2].id, userId: users[2].id, role: 'MEMBER' },

      // Bundesliga Watchers
      { groupId: groups[3].id, userId: users[3].id, role: 'OWNER' },
      { groupId: groups[3].id, userId: users[0].id, role: 'MEMBER' },

      // Weekend Warriors
      { groupId: groups[4].id, userId: users[2].id, role: 'OWNER' },
      { groupId: groups[4].id, userId: users[4].id, role: 'ADMIN' },
    ],
  });
  console.log('✅ Added group members');
}

export async function seedAchievements() {
  console.log('\n🏆 Creating achievements...');
  const achievements = await Promise.all([
    // Predictions category
    prisma.achievement.create({
      data: {
        name: 'First Prediction',
        description: 'Make your first match prediction',
        category: 'PREDICTIONS',
        requiredValue: 1,
        points: 10,
        iconUrl: '🎯',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Prediction Veteran',
        description: 'Make 50 predictions',
        category: 'PREDICTIONS',
        requiredValue: 50,
        points: 100,
        iconUrl: '📊',
      },
    }),

    // Accuracy category
    prisma.achievement.create({
      data: {
        name: 'Sharp Shooter',
        description: 'Achieve 70% prediction accuracy',
        category: 'ACCURACY',
        requiredValue: 70,
        points: 150,
        iconUrl: '🎪',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Perfect Score',
        description: 'Get 5 exact score predictions',
        category: 'ACCURACY',
        requiredValue: 5,
        points: 200,
        iconUrl: '💯',
      },
    }),

    // Streaks category
    prisma.achievement.create({
      data: {
        name: 'Hot Streak',
        description: 'Get 5 predictions correct in a row',
        category: 'STREAKS',
        requiredValue: 5,
        points: 100,
        iconUrl: '🔥',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Unstoppable',
        description: 'Get 10 predictions correct in a row',
        category: 'STREAKS',
        requiredValue: 10,
        points: 300,
        iconUrl: '⚡',
      },
    }),

    // Points category
    prisma.achievement.create({
      data: {
        name: 'Point Collector',
        description: 'Earn 500 total points',
        category: 'POINTS',
        requiredValue: 500,
        points: 50,
        iconUrl: '💰',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Point Master',
        description: 'Earn 1000 total points',
        category: 'POINTS',
        requiredValue: 1000,
        points: 150,
        iconUrl: '💎',
      },
    }),

    // Social category
    prisma.achievement.create({
      data: {
        name: 'Team Player',
        description: 'Join your first group',
        category: 'SOCIAL',
        requiredValue: 1,
        points: 25,
        iconUrl: '👥',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Social Butterfly',
        description: 'Join 5 different groups',
        category: 'SOCIAL',
        requiredValue: 5,
        points: 75,
        iconUrl: '🦋',
      },
    }),

    // Special category
    prisma.achievement.create({
      data: {
        name: 'Weekend Warrior',
        description: 'Predict all weekend matches correctly',
        category: 'SPECIAL',
        points: 250,
        iconUrl: '🏅',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Derby King',
        description: 'Correctly predict 3 derby matches',
        category: 'SPECIAL',
        requiredValue: 3,
        points: 200,
        iconUrl: '👑',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Early Bird',
        description: 'Make predictions 24h before match',
        category: 'SPECIAL',
        requiredValue: 10,
        points: 100,
        iconUrl: '🐦',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Underdog Expert',
        description: 'Correctly predict 5 underdog victories',
        category: 'SPECIAL',
        requiredValue: 5,
        points: 180,
        iconUrl: '🐕',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Clean Sheet Prophet',
        description: 'Predict 10 clean sheets correctly',
        category: 'SPECIAL',
        requiredValue: 10,
        points: 120,
        iconUrl: '🧤',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Goal Fest',
        description: 'Predict 5 high-scoring matches (4+ goals)',
        category: 'SPECIAL',
        requiredValue: 5,
        points: 150,
        iconUrl: '⚽',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'League Expert',
        description: 'Achieve 80% accuracy in one league',
        category: 'ACCURACY',
        requiredValue: 80,
        points: 250,
        iconUrl: '🎓',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Consistency King',
        description: 'Score points in 20 consecutive matches',
        category: 'STREAKS',
        requiredValue: 20,
        points: 400,
        iconUrl: '🔒',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Top of the League',
        description: 'Reach rank #1 in global leaderboard',
        category: 'POINTS',
        requiredValue: 1,
        points: 500,
        iconUrl: '🥇',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Community Leader',
        description: 'Create a group with 20+ members',
        category: 'SOCIAL',
        requiredValue: 20,
        points: 200,
        iconUrl: '🎖️',
      },
    }),
  ]);
  console.log(`✅ Created ${achievements.length} achievements`);
  return achievements;
}

export async function seedUserAchievements(users: any[], achievements: any[]) {
  console.log('\n🎖️ Unlocking user achievements...');
  await prisma.userAchievement.createMany({
    data: [
      // Mustafa (top player)
      { userId: users[0].id, achievementId: achievements[0].id, progress: 100 },
      { userId: users[0].id, achievementId: achievements[1].id, progress: 100 },
      { userId: users[0].id, achievementId: achievements[2].id, progress: 100 },
      { userId: users[0].id, achievementId: achievements[4].id, progress: 100 },
      { userId: users[0].id, achievementId: achievements[6].id, progress: 100 },
      { userId: users[0].id, achievementId: achievements[7].id, progress: 100 },
      { userId: users[0].id, achievementId: achievements[8].id, progress: 100 },

      // Youssef
      { userId: users[1].id, achievementId: achievements[0].id, progress: 100 },
      { userId: users[1].id, achievementId: achievements[2].id, progress: 100 },
      { userId: users[1].id, achievementId: achievements[6].id, progress: 100 },
      { userId: users[1].id, achievementId: achievements[7].id, progress: 100 },

      // Ali
      { userId: users[2].id, achievementId: achievements[0].id, progress: 100 },
      { userId: users[2].id, achievementId: achievements[6].id, progress: 100 },
      { userId: users[2].id, achievementId: achievements[8].id, progress: 100 },

      // Mohammed
      { userId: users[3].id, achievementId: achievements[0].id, progress: 100 },
      { userId: users[3].id, achievementId: achievements[6].id, progress: 100 },

      // Majid (new player)
      { userId: users[4].id, achievementId: achievements[0].id, progress: 100 },
    ],
  });
  console.log('✅ Unlocked achievements for users');
}

export async function seedNotifications(users: any[]) {
  console.log('\n🔔 Creating notifications...');
  const now = new Date();
  await prisma.notification.createMany({
    data: [
      // Mustafa notifications
      {
        userId: users[0].id,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'New Achievement!',
        message: 'You unlocked "Top of the League" achievement!',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: users[0].id,
        type: 'POINTS_EARNED',
        title: 'Points Earned!',
        message: 'You earned 15 points from your Arsenal prediction!',
        isRead: true,
        readAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        userId: users[0].id,
        type: 'MATCH_REMINDER',
        title: 'Upcoming Match',
        message: 'Liverpool vs Chelsea starts in 2 hours! Don\'t forget your prediction.',
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },

      // Youssef notifications
      {
        userId: users[1].id,
        type: 'LEADERBOARD_UPDATE',
        title: 'Leaderboard Update',
        message: 'You moved up to rank #2! Keep it up!',
        isRead: false,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        userId: users[1].id,
        type: 'GROUP_INVITATION',
        title: 'Group Invitation',
        message: 'Mustafa invited you to "Top Predictors" group',
        isRead: true,
        readAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },

      // Ali notifications
      {
        userId: users[2].id,
        type: 'PREDICTION_DEADLINE',
        title: 'Prediction Deadline',
        message: 'Only 1 hour left to predict Manchester City vs Tottenham!',
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        userId: users[2].id,
        type: 'MATCH_RESULT',
        title: 'Match Result',
        message: 'Liverpool won 3-1! Your prediction earned 3 points.',
        isRead: true,
        readAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },

      // Mohammed notifications
      {
        userId: users[3].id,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Achievement Unlocked',
        message: 'You unlocked "Point Collector" - 500 points milestone!',
        isRead: false,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },

      // Majid notifications
      {
        userId: users[4].id,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Welcome to Football Predictions!',
        message: 'Start making predictions to earn points and unlock achievements!',
        isRead: false,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created notifications');
}
