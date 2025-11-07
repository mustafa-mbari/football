/**
 * GET /api/points-rules - Get all points rules
 *
 * Query params:
 * - active: If "true", only return active rules
 *
 * Returns all points rules ordered by priority
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/points-rules
 * Get all points rules (optionally filtered by active status)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const whereClause = active === 'true' ? { isActive: true } : {};

    const rules = await prisma.pointsRule.findMany({
      where: whereClause,
      orderBy: {
        priority: 'asc'
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: rules
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch points rules');
  }
}
