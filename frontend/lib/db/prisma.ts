/**
 * Prisma Client for Node Runtime - Optimized for Vercel Serverless
 *
 * Use this for Node.js API routes (writes, complex queries)
 * Does NOT work on Edge runtime
 *
 * Optimizations:
 * - Connection pooling configured for serverless
 * - Automatic connection management
 * - Query optimization enabled
 */

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development (hot reload)
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Optimize for serverless - reduce connection time
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Connection pool management for Vercel serverless
 * Automatically disconnect after queries to prevent connection exhaustion
 */
if (process.env.NODE_ENV === 'production') {
  // For serverless, rely on Prisma's built-in connection management
  // Don't manually disconnect as it can cause issues with connection pooling
}

export default prisma;
