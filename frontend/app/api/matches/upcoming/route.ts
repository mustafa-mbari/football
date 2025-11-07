/**
 * GET /api/matches/upcoming
 *
 * Fetch upcoming scheduled matches
 * Used by predictions page to show matches available for prediction
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/matches/upcoming
 * Query params: leagueId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const now = new Date();

    const where: any = {
      matchDate: {
        gte: now,
      },
      status: 'SCHEDULED',
    };

    if (leagueId) {
      where.leagueId = parseInt(leagueId);
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        matchDate: 'asc',
      },
      take: 50,
    });

    return NextResponse.json(
      {
        success: true,
        data: matches,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch upcoming matches');
  }
}
