/**
 * GET /api/teams - Get all teams
 * POST /api/teams - Create new team (admin only)
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/teams
 * Fetch all teams with optional league filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    const teams = await prisma.team.findMany({
      where: leagueId
        ? {
            leagues: {
              some: {
                leagueId: parseInt(leagueId),
                isActive: true,
              },
            },
          }
        : undefined,
      include: {
        leagues: {
          where: { isActive: true },
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
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch teams');
  }
}

/**
 * POST /api/teams
 * Create a new team (admin only)
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
      name,
      code,
      shortName,
      apiName,
      logoUrl,
      stadiumName,
      foundedYear,
      website,
      primaryColor,
      leagueId,
    } = body;

    // Validate required fields
    if (!name || !code) {
      return errorResponse('Missing required fields: name and code are required', 400);
    }

    // Check if team code already exists
    const existingTeam = await prisma.team.findUnique({
      where: { code },
    });

    if (existingTeam) {
      return errorResponse('Team with this code already exists', 400);
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        code,
        shortName: shortName || null,
        apiName: apiName || null,
        logoUrl: logoUrl || null,
        stadiumName: stadiumName || null,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        website: website || null,
        primaryColor: primaryColor || null,
      },
    });

    // If leagueId provided, add team to league
    if (leagueId) {
      await prisma.teamLeague.create({
        data: {
          teamId: team.id,
          leagueId: parseInt(leagueId),
          isActive: true,
        },
      });
    }

    // Fetch team with league relations
    const teamWithLeagues = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        leagues: {
          where: { isActive: true },
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
    });

    return successResponse(teamWithLeagues, 'Team created successfully', 201);
  } catch (error: any) {
    return handleError(error, 'Failed to create team');
  }
}
