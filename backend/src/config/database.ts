import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Optimized connection pool settings for Supabase/Vercel
const connectionUrl = process.env.DATABASE_URL;

// Singleton pattern for both development and production (essential for serverless)
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: connectionUrl
    }
  }
});

// Reuse PrismaClient across serverless function invocations
global.prisma = prisma;

// Gracefully handle disconnections
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
