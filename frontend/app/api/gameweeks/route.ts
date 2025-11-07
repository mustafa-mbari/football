/**
 * GET /api/gameweeks - Get all gameweeks across all leagues
 *
 * Query params:
 * - leagueId (optional): Filter by specific league
 * - isCurrent (optional): Filter by current gameweeks only
 *
 * Returns all gameweeks with league info and counts
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/gameweeks
 * Get gameweeks (all or filtered by leagueId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const isCurrent = searchParams.get('isCurrent');

    // Build where clause
    const where: any = {};
    if (leagueId) where.leagueId = parseInt(leagueId);
    if (isCurrent === 'true') where.isCurrent = true;

    const gameWeeks = await prisma.gameWeek.findMany({
      where,
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        _count: {
          select: { matches: true, teamStats: true }
        }
      },
      orderBy: [
        { leagueId: 'asc' },
        { weekNumber: 'asc' }
      ]
    });

    return NextResponse.json(
      { success: true, data: gameWeeks },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch gameweeks');
  }
}
