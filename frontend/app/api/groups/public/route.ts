/**
 * GET /api/groups/public - Get all public groups
 *
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/groups/public
 * Get all public groups (no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.group.findMany({
      where: { isPublic: true },
      include: {
        league: true,
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        league: {
          priority: 'desc'
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: groups
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch public groups');
  }
}
