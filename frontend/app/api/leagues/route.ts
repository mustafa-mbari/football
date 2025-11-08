/**
 * GET /api/leagues - Get all leagues
 * POST /api/leagues - Create new league (admin only)
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidate every 10 minutes (leagues rarely change)

/**
 * GET /api/leagues
 * Fetch all leagues with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const leagues = await prisma.league.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        _count: {
          select: { teams: true, matches: true },
        },
      },
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(
      {
        success: true,
        data: leagues,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch leagues');
  }
}

/**
 * POST /api/leagues
 * Create a new league (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { name, code, country, logoUrl, season, startDate, endDate, isActive, priority } = body;

    // Validate required fields
    if (!name || !code || !season || !startDate || !endDate) {
      return errorResponse(
        'Missing required fields: name, code, season, startDate, endDate',
        400
      );
    }

    // Check if league with same code already exists
    const existingLeague = await prisma.league.findUnique({
      where: { code },
    });

    if (existingLeague) {
      return errorResponse('League with this code already exists', 400);
    }

    const league = await prisma.league.create({
      data: {
        name,
        code,
        country: country || null,
        logoUrl: logoUrl || null,
        season,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 0,
      },
      include: {
        _count: {
          select: { teams: true, matches: true },
        },
      },
    });

    return successResponse(league, 'League created successfully', 201);
  } catch (error: any) {
    return handleError(error, 'Failed to create league');
  }
}
