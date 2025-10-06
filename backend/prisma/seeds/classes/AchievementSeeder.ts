import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AchievementData {
  name: string;
  description: string;
  category: string;
  requiredValue?: number;
  points: number;
  iconUrl: string;
}

interface UserAchievementData {
  userIndex: number;
  achievementIndex: number;
  progress: number;
}

interface SeedData {
  achievements: AchievementData[];
  userAchievements: UserAchievementData[];
}

export class AchievementSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/achievements.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedAchievements() {
    console.log('\n🏆 Creating achievements...');

    const achievements = await Promise.all(
      this.data.achievements.map((achData) =>
        prisma.achievement.create({
          data: {
            name: achData.name,
            description: achData.description,
            category: achData.category as any,
            requiredValue: achData.requiredValue,
            points: achData.points,
            iconUrl: achData.iconUrl,
          },
        })
      )
    );

    console.log(`✅ Created ${achievements.length} achievements`);
    return achievements;
  }

  async seedUserAchievements(users: any[], achievements: any[]) {
    console.log('\n🎖️ Unlocking user achievements...');

    const userAchievementsData = this.data.userAchievements.map((ua) => ({
      userId: users[ua.userIndex].id,
      achievementId: achievements[ua.achievementIndex].id,
      progress: ua.progress,
    }));

    await prisma.userAchievement.createMany({ data: userAchievementsData });
    console.log('✅ Unlocked achievements for users');
  }
}
