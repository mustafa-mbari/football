/**
 * GET /api/settings - Get all settings
 *
 * Returns all app settings
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/settings
 * Get all settings
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.appSettings.findMany({
      orderBy: { key: 'asc' }
    });

    return NextResponse.json(
      { success: true, data: settings },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch settings');
  }
}
