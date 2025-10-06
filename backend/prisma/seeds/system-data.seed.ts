import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPointsRules() {
  console.log('\n📏 Creating points rules...');
  await prisma.pointsRule.createMany({
    data: [
      {
        name: 'Exact Score',
        description: 'Predicting the exact final score',
        points: 10,
        type: 'EXACT_SCORE',
        priority: 1,
      },
      {
        name: 'Correct Result',
        description: 'Predicting the correct match outcome (win/draw/loss)',
        points: 3,
        type: 'CORRECT_RESULT',
        priority: 2,
      },
      {
        name: 'Goal Difference',
        description: 'Predicting the correct goal difference',
        points: 2,
        type: 'GOAL_DIFFERENCE',
        priority: 3,
      },
      {
        name: 'One Team Score',
        description: 'Getting one team\'s score exactly right',
        points: 1,
        type: 'ONE_TEAM_SCORE',
        priority: 4,
      },
      {
        name: 'Total Goals',
        description: 'Predicting the correct total number of goals',
        points: 2,
        type: 'TOTAL_GOALS',
        priority: 5,
      },
      {
        name: 'Both Teams Score',
        description: 'Bonus for correctly predicting both teams to score',
        points: 1,
        type: 'BOTH_TEAMS_SCORE',
        priority: 6,
      },
      {
        name: 'Clean Sheet',
        description: 'Bonus for correctly predicting a clean sheet',
        points: 2,
        type: 'CLEAN_SHEET',
        priority: 7,
      },
      {
        name: 'High Scoring',
        description: 'Bonus for predicting high-scoring matches (4+ goals)',
        points: 3,
        type: 'HIGH_SCORING',
        priority: 8,
      },
      {
        name: 'Underdog Win',
        description: 'Bonus for correctly predicting underdog victory',
        points: 5,
        type: 'UNDERDOG_WIN',
        priority: 9,
      },
      {
        name: 'Weekly Streak',
        description: 'Bonus for 5+ consecutive correct predictions',
        points: 10,
        type: 'WEEKLY_STREAK',
        priority: 10,
      },
      {
        name: 'Perfect Week',
        description: 'All predictions correct in a gameweek',
        points: 25,
        type: 'PERFECT_WEEK',
        priority: 11,
      },
    ],
  });
  console.log('✅ Created 11 points rules');
}

export async function seedAnalytics() {
  console.log('\n📈 Creating analytics data...');
  const analyticsData = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    analyticsData.push({
      date,
      totalUsers: 5,
      activeUsers: Math.max(1, 5 - Math.floor(i / 10)),
      newUsers: i === 30 ? 1 : i === 15 ? 1 : i === 5 ? 1 : 0,
      totalPredictions: Math.floor(Math.random() * 20) + 5,
      avgPredictionsPerUser: parseFloat((Math.random() * 3 + 1).toFixed(2)),
    });
  }

  await prisma.analytics.createMany({ data: analyticsData });
  console.log(`✅ Created ${analyticsData.length} days of analytics`);
}

export async function seedAuditLogs(users: any[]) {
  console.log('\n🔍 Creating audit logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: users[0].id,
        action: 'CREATE',
        entity: 'Prediction',
        entityId: 1,
        newData: { matchId: 1, predictedHomeScore: 2, predictedAwayScore: 1 },
        ipAddress: '192.168.1.100',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        userId: users[0].id,
        action: 'CREATE',
        entity: 'Group',
        entityId: 1,
        newData: { name: 'Premier League Fans' },
        ipAddress: '192.168.1.100',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created audit logs');
}
