/**
 * GET /api/matches - Get all matches with filters
 * POST /api/matches - Create new match (admin only)
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/matches
 * Query params: leagueId, status, limit, page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const leagueId = searchParams.get('leagueId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (leagueId) where.leagueId = parseInt(leagueId);
    if (status) where.status = status.toUpperCase();

    // Get total count for pagination
    const total = await prisma.match.count({ where });

    // Fetch matches with optimized fields
    const matches = await prisma.match.findMany({
      where,
      select: {
        id: true,
        matchDate: true,
        weekNumber: true,
        homeScore: true,
        awayScore: true,
        status: true,
        isPredictionLocked: true,
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
      skip: offset,
      take: limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: matches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + matches.length < total,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch matches');
  }
}

/**
 * POST /api/matches
 * Create a new match (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const {
      leagueId,
      homeTeamId,
      awayTeamId,
      matchDate,
      weekNumber,
      status,
      homeScore,
      awayScore,
    } = body;

    // Validate required fields
    if (!leagueId || !homeTeamId || !awayTeamId || !matchDate) {
      return errorResponse(
        'Missing required fields: leagueId, homeTeamId, awayTeamId, matchDate',
        400
      );
    }

    // Validate teams are different
    if (homeTeamId === awayTeamId) {
      return errorResponse('Home team and away team must be different', 400);
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        leagueId: parseInt(leagueId),
        homeTeamId: parseInt(homeTeamId),
        awayTeamId: parseInt(awayTeamId),
        matchDate: new Date(matchDate),
        weekNumber: weekNumber || null,
        status: status || 'SCHEDULED',
        homeScore: homeScore !== undefined ? parseInt(homeScore) : null,
        awayScore: awayScore !== undefined ? parseInt(awayScore) : null,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    });

    return successResponse(match, 'Match created successfully', 201);
  } catch (error: any) {
    return handleError(error, 'Failed to create match');
  }
}
