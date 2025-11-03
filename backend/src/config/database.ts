import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton pattern for both development and production (essential for serverless)
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Reuse PrismaClient across serverless function invocations
global.prisma = prisma;

export default prisma;
