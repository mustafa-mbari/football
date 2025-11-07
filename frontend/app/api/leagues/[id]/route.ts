/**
 * GET /api/leagues/[id] - Get single league
 * PATCH /api/leagues/[id] - Update league (admin only)
 * DELETE /api/leagues/[id] - Delete league (admin only)
 *
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leagues/[id]
 * Fetch a single league with teams and matches
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = parseInt(params.id);

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          where: { isActive: true },
          include: {
            team: true,
          },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
          orderBy: {
            matchDate: 'asc',
          },
        },
      },
    });

    if (!league) {
      return errorResponse('League not found', 404);
    }

    return successResponse(league);
  } catch (error: any) {
    return handleError(error, 'Failed to fetch league');
  }
}

/**
 * PATCH /api/leagues/[id]
 * Update a league (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const leagueId = parseInt(params.id);
    const body = await request.json();
    const { name, code, country, logoUrl, season, startDate, endDate, isActive, priority } = body;

    // Check if league exists
    const existingLeague = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!existingLeague) {
      return errorResponse('League not found', 404);
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingLeague.code) {
      const codeExists = await prisma.league.findUnique({
        where: { code },
      });

      if (codeExists) {
        return errorResponse('League with this code already exists', 400);
      }
    }

    // If name or season is being changed, check for duplicate (name, season) combination
    const newName = name || existingLeague.name;
    const newSeason = season || existingLeague.season;

    if (
      (name && name !== existingLeague.name) ||
      (season && season !== existingLeague.season)
    ) {
      const duplicateExists = await prisma.league.findFirst({
        where: {
          AND: [
            { name: newName },
            { season: newSeason },
            { id: { not: leagueId } },
          ],
        },
      });

      if (duplicateExists) {
        return errorResponse(
          `A league named "${newName}" already exists for season "${newSeason}"`,
          400
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (country !== undefined) updateData.country = country;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (season) updateData.season = season;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = parseInt(priority as any);

    // Handle dates carefully
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return errorResponse(
          `Invalid start date format: "${startDate}". Please use YYYY-MM-DD format.`,
          400
        );
      }
      updateData.startDate = parsedStartDate;
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return errorResponse(
          `Invalid end date format: "${endDate}". Please use YYYY-MM-DD format.`,
          400
        );
      }
      updateData.endDate = parsedEndDate;
    }

    const league = await prisma.league.update({
      where: { id: leagueId },
      data: updateData,
      include: {
        _count: {
          select: { teams: true, matches: true },
        },
      },
    });

    return successResponse(league, 'League updated successfully');
  } catch (error: any) {
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return errorResponse(
        'A league with this combination of name and season already exists',
        400
      );
    }

    if (error.code === 'P2025') {
      return errorResponse('League not found', 404);
    }

    return handleError(error, 'Failed to update league');
  }
}

/**
 * DELETE /api/leagues/[id]
 * Delete a league (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permission
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const leagueId = parseInt(params.id);

    // Check if league exists
    const existingLeague = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        _count: {
          select: { teams: true, matches: true, gameWeeks: true },
        },
      },
    });

    if (!existingLeague) {
      return errorResponse('League not found', 404);
    }

    // Check if league has associated data
    if (
      existingLeague._count.teams > 0 ||
      existingLeague._count.matches > 0 ||
      existingLeague._count.gameWeeks > 0
    ) {
      return errorResponse(
        'Cannot delete league with associated teams, matches, or gameweeks. Please deactivate it instead.',
        400
      );
    }

    await prisma.league.delete({
      where: { id: leagueId },
    });

    return successResponse(null, 'League deleted successfully');
  } catch (error: any) {
    return handleError(error, 'Failed to delete league');
  }
}
