/**
 * POST /api/predictions - Create or update prediction
 * GET /api/predictions - Get user's predictions
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/predictions
 * Create or update a prediction
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;

    // ✅ Input validation
    const body = await request.json();
    const { matchId, predictedHomeScore, predictedAwayScore } = body;

    if (!matchId || predictedHomeScore == null || predictedAwayScore == null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input. matchId, predictedHomeScore, and predictedAwayScore are required.'
        },
        { status: 400 }
      );
    }

    // Validate score values
    if (
      !Number.isInteger(predictedHomeScore) ||
      !Number.isInteger(predictedAwayScore) ||
      predictedHomeScore < 0 ||
      predictedAwayScore < 0 ||
      predictedHomeScore > 20 ||
      predictedAwayScore > 20
    ) {
      return NextResponse.json(
        { success: false, error: 'Scores must be integers between 0 and 20.' },
        { status: 400 }
      );
    }

    // ✅ Fetch match with minimal fields
    const match = await prisma.match.findUnique({
      where: { id: parseInt(matchId) },
      select: {
        id: true,
        matchDate: true,
        status: true,
        leagueId: true
      }
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found.' },
        { status: 404 }
      );
    }

    // ✅ Check if match already started
    if (match.status !== 'SCHEDULED') {
      return NextResponse.json(
        { success: false, error: 'Cannot predict for matches that have already started.' },
        { status: 400 }
      );
    }

    // ✅ Check prediction deadline (4 hours before kickoff)
    const deadlineHours = 4;
    const deadline = new Date(match.matchDate.getTime() - deadlineHours * 60 * 60 * 1000);
    const now = new Date();

    if (now > deadline) {
      return NextResponse.json(
        {
          success: false,
          error: `Prediction deadline has passed. Deadline was ${deadline.toLocaleString()}.`
        },
        { status: 400 }
      );
    }

    // ✅ Upsert prediction (create or update)
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId: parseInt(matchId)
        }
      },
      update: {
        predictedHomeScore,
        predictedAwayScore,
        updatedAt: now
      },
      create: {
        userId: user.id,
        matchId: parseInt(matchId),
        predictedHomeScore,
        predictedAwayScore
      },
      select: {
        id: true,
        predictedHomeScore: true,
        predictedAwayScore: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // ✅ Auto-join public group for this league (async, don't wait)
    prisma.groupMember
      .upsert({
        where: {
          groupId_userId: {
            groupId: 1, // Assuming public group ID (adjust as needed)
            userId: user.id
          }
        },
        update: {},
        create: {
          groupId: 1,
          userId: user.id,
          role: 'MEMBER'
        }
      })
      .catch(err => console.error('Auto-join group error:', err));

    return NextResponse.json(
      {
        success: true,
        data: prediction,
        message: 'Prediction saved successfully!'
      },
      {
        status: 201,
        headers: {
          // ✅ NO caching for writes
          'Cache-Control': 'no-store, no-cache, must-revalidate, private'
        }
      }
    );
  } catch (error: any) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create prediction.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/predictions
 * Get authenticated user's predictions
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // ✅ Build where clause
    const where: any = { userId: user.id };
    if (leagueId) {
      where.match = { leagueId: parseInt(leagueId) };
    }

    // ✅ Fetch with selective fields only
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
            homeScore: true,
            awayScore: true,
            status: true,
            weekNumber: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true
              }
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true
              }
            },
            league: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json(
      {
        success: true,
        data: predictions,
        pagination: {
          limit,
          offset,
          hasMore: predictions.length === limit
        }
      },
      {
        status: 200,
        headers: {
          // ✅ Short private cache for authenticated user data
          'Cache-Control': 'private, max-age=30, must-revalidate'
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
