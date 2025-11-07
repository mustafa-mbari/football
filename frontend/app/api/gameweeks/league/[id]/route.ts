/**
 * GET /api/gameweeks/league/[id] - Get all gameweeks for a league
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/gameweeks/league/[id]
 * Get all gameweeks for a league
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gameWeeks = await prisma.gameWeek.findMany({
      where: { leagueId: parseInt(id) },
      orderBy: { weekNumber: 'asc' },
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        },
        _count: {
          select: { matches: true }
        }
      }
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
