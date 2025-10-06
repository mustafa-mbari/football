import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UserData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  avatar: string;
  bio: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  seasonPoints: number;
  predictionAccuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
}

interface SessionData {
  userIndex: number;
  ipAddress: string;
  userAgent: string;
  expiresInDays: number;
}

interface LoginHistoryData {
  userIndex: number;
  ipAddress: string;
  userAgent: string;
  loginStatus: boolean;
  hoursAgo: number;
}

interface SeedData {
  users: UserData[];
  sessions: SessionData[];
  loginHistory: LoginHistoryData[];
}

export class UserSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/users.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async seedUsers() {
    console.log('\n👥 Creating users...');

    const hashedPassword = await this.hashPassword('password123');
    const now = new Date();

    const users = await Promise.all(
      this.data.users.map(async (userData, index) => {
        // Calculate lastLoginAt based on rank
        let lastLoginDate: Date;
        if (index === 0) {
          lastLoginDate = now;
        } else if (index === 1) {
          lastLoginDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        } else if (index === 2) {
          lastLoginDate = new Date(now.getTime() - 5 * 60 * 60 * 1000);
        } else if (index === 3) {
          lastLoginDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        } else {
          lastLoginDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        }

        return prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            username: userData.username,
            passwordHash: hashedPassword,
            role: userData.role as any,
            isEmailVerified: userData.isEmailVerified,
            avatar: userData.avatar,
            bio: userData.bio,
            totalPoints: userData.totalPoints,
            weeklyPoints: userData.weeklyPoints,
            monthlyPoints: userData.monthlyPoints,
            seasonPoints: userData.seasonPoints,
            predictionAccuracy: userData.predictionAccuracy,
            totalPredictions: userData.totalPredictions,
            correctPredictions: userData.correctPredictions,
            currentStreak: userData.currentStreak,
            bestStreak: userData.bestStreak,
            rank: userData.rank,
            lastLoginAt: lastLoginDate,
          },
        });
      })
    );

    console.log(`✅ Created ${users.length} users`);
    return users;
  }

  async seedUserSessions(users: any[]) {
    console.log('\n🔐 Creating sessions...');

    const now = new Date();
    const sessionsData = this.data.sessions.map((session) => ({
      userId: users[session.userIndex].id,
      token: `session_${users[session.userIndex].id}_${Date.now()}`,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: new Date(now.getTime() + session.expiresInDays * 24 * 60 * 60 * 1000),
    }));

    await prisma.session.createMany({ data: sessionsData });
    console.log('✅ Created sessions');
  }

  async seedLoginHistory(users: any[]) {
    console.log('\n📝 Creating login history...');

    const now = new Date();
    const loginHistoryData = this.data.loginHistory.map((history) => ({
      userId: users[history.userIndex].id,
      ipAddress: history.ipAddress,
      userAgent: history.userAgent,
      loginStatus: history.loginStatus,
      createdAt: new Date(now.getTime() - history.hoursAgo * 60 * 60 * 1000),
    }));

    await prisma.loginHistory.createMany({ data: loginHistoryData });
    console.log('✅ Created login history');
  }
}
