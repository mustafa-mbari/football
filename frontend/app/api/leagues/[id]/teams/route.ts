/**
 * GET /api/leagues/[id]/teams - Get teams for a league
 *
 * Returns all teams that belong to the specified league
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leagues/[id]/teams
 * Get all teams for a specific league
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leagueId = parseInt(id);

    const teams = await prisma.team.findMany({
      where: {
        leagues: {
          some: {
            leagueId,
            isActive: true,
          },
        },
      },
      include: {
        leagues: {
          where: {
            leagueId,
            isActive: true
          },
          include: {
            league: {
              select: {
                id: true,
                name: true,
                code: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: teams,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch league teams');
  }
}
