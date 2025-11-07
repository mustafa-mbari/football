/**
 * GET /api/predictions/user - Get authenticated user's predictions
 *
 * Query params:
 * - leagueId (optional): Filter by specific league
 * - limit (optional): Max 100, default 50
 * - offset (optional): For pagination, default 0
 *
 * Auth required
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/predictions/user
 * Get authenticated user's predictions
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = { userId: user.id };
    if (leagueId) {
      where.match = { leagueId: parseInt(leagueId) };
    }

    // Fetch with selective fields only
    const predictions = await prisma.prediction.findMany({
      where,
      select: {
        id: true,
        predictedHomeScore: true,
        predictedAwayScore: true,
        totalPoints: true,
        isProcessed: true,
        status: true,
        createdAt: true,
        match: {
          select: {
            id: true,
            matchDate: true,
            weekNumber: true,
            homeScore: true,
            awayScore: true,
            status: true,
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
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: predictions,
        meta: {
          total: predictions.length,
          limit,
          offset,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch user predictions');
  }
}
