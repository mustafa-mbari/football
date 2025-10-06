import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Hash password using bcrypt
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export async function seedUsers() {
  console.log('\n👥 Creating users...');

  // Hash all passwords first
  const hashedPassword = await hashPassword('password123');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Mustafa',
        email: 'mustafa@example.com',
        username: 'mustafa',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Mustafa&background=0D8ABC&color=fff',
        bio: 'Football enthusiast and prediction master!',
        totalPoints: 1250,
        weeklyPoints: 180,
        monthlyPoints: 520,
        seasonPoints: 1250,
        predictionAccuracy: 72.5,
        totalPredictions: 45,
        correctPredictions: 33,
        currentStreak: 5,
        bestStreak: 8,
        rank: 1,
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Youssef',
        email: 'youssef@example.com',
        username: 'youssef',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Youssef&background=17A2B8&color=fff',
        bio: 'La Liga expert, Real Madrid fan',
        totalPoints: 1150,
        weeklyPoints: 160,
        monthlyPoints: 480,
        seasonPoints: 1150,
        predictionAccuracy: 68.9,
        totalPredictions: 42,
        correctPredictions: 29,
        currentStreak: 3,
        bestStreak: 6,
        rank: 2,
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ali',
        email: 'ali@example.com',
        username: 'ali',
        passwordHash: hashedPassword,
        role: 'USER',
        isEmailVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Ali&background=28A745&color=fff',
        bio: 'Premier League predictions specialist',
        totalPoints: 980,
        weeklyPoints: 140,
        monthlyPoints: 410,
        seasonPoints: 980,
        predictionAccuracy: 65.3,
        totalPredictions: 38,
        correctPredictions: 25,
        currentStreak: 2,
        bestStreak: 5,
        rank: 3,
        lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mohammed',
        email: 'mohammed@example.com',
        username: 'mohammed',
        passwordHash: hashedPassword,
        role: 'USER',
        isEmailVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Mohammed&background=FFC107&color=000',
        bio: 'Bundesliga follower',
        totalPoints: 875,
        weeklyPoints: 120,
        monthlyPoints: 380,
        seasonPoints: 875,
        predictionAccuracy: 61.8,
        totalPredictions: 34,
        correctPredictions: 21,
        currentStreak: 1,
        bestStreak: 4,
        rank: 4,
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Majid',
        email: 'majid@example.com',
        username: 'majid',
        passwordHash: hashedPassword,
        role: 'USER',
        isEmailVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Majid&background=DC3545&color=fff',
        bio: 'New to predictions, learning the game',
        totalPoints: 650,
        weeklyPoints: 95,
        monthlyPoints: 290,
        seasonPoints: 650,
        predictionAccuracy: 58.2,
        totalPredictions: 28,
        correctPredictions: 16,
        currentStreak: 0,
        bestStreak: 3,
        rank: 5,
        lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  return users;
}

export async function seedUserSessions(users: any[]) {
  console.log('\n🔐 Creating sessions...');
  await prisma.session.createMany({
    data: [
      {
        userId: users[0].id,
        token: `session_${users[0].id}_${Date.now()}`,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: users[1].id,
        token: `session_${users[1].id}_${Date.now()}`,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created sessions');
}

export async function seedLoginHistory(users: any[]) {
  console.log('\n📝 Creating login history...');
  await prisma.loginHistory.createMany({
    data: [
      {
        userId: users[0].id,
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome 120',
        loginStatus: true,
        createdAt: new Date(),
      },
      {
        userId: users[1].id,
        ipAddress: '192.168.1.101',
        userAgent: 'Safari 16',
        loginStatus: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: users[2].id,
        ipAddress: '192.168.1.102',
        userAgent: 'Firefox 121',
        loginStatus: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Created login history');
}
