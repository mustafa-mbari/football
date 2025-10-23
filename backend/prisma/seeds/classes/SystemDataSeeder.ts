import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PointsRuleData {
  name: string;
  description: string;
  points: number;
  type: string;
  priority: number;
}

interface SeedData {
  pointsRules: PointsRuleData[];
}

export class SystemDataSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/pointsRules.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedPointsRules() {
    console.log('\n📏 Creating points rules...');

    const pointsRulesData = this.data.pointsRules.map((rule) => ({
      name: rule.name,
      description: rule.description,
      points: rule.points,
      type: rule.type as any,
      priority: rule.priority,
    }));

    await prisma.pointsRule.createMany({ data: pointsRulesData });
    console.log(`✅ Created ${pointsRulesData.length} points rules`);
  }

  async seedAnalytics() {
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

  async seedAuditLogs(users: any[]) {
    console.log('\n🔍 Creating audit logs...');

    const auditLogsData = [
      {
        userId: users[0].id,
        action: 'CREATE' as any,
        entity: 'Prediction',
        entityId: 1,
        newData: { matchId: 1, predictedHomeScore: 2, predictedAwayScore: 1 },
        ipAddress: '192.168.1.100',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        userId: users[0].id,
        action: 'CREATE' as any,
        entity: 'Group',
        entityId: 1,
        newData: { name: 'Premier League Fans' },
        ipAddress: '192.168.1.100',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    await prisma.auditLog.createMany({ data: auditLogsData });
    console.log('✅ Created audit logs');
  }

  async seedAppSettings() {
    console.log('\n⚙️  Creating app settings...');

    const settingsData = [
      {
        key: 'PREDICTION_DEADLINE_HOURS',
        value: '4',
        description: 'Hours before match start when predictions are locked'
      },
      {
        key: 'FOOTBALL_DATA_API_TOKEN',
        value: '10dbc7b8a2ce4823b18e2e6dccfaf329',
        description: 'API token for football-data.org API (Free tier: 12 competitions, 10 calls/minute)'
      }
    ];

    await prisma.appSettings.createMany({ data: settingsData });
    console.log('✅ Created app settings');
  }
}
