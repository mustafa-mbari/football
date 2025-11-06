/**
 * Prisma Client for Node Runtime
 *
 * Use this for Node.js API routes (writes, complex queries)
 * Does NOT work on Edge runtime
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
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown
 */
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
