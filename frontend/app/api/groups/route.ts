/**
 * GET /api/groups - List all groups (user's groups)
 * POST /api/groups - Create new group
 *
 * Node runtime for auth and writes
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List user's groups
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;

    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            isPrivate: true,
            isPublic: true,
            joinCode: true,
            logoUrl: true,
            leagueId: true,
            league: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        group: {
          isPublic: 'desc'
        }
      }
    });

    const groups = memberships.map(m => ({
      ...m.group,
      memberRole: m.role,
      memberPoints: m.totalPoints,
      memberPointsByLeague: m.pointsByLeague,
      memberCount: m.group._count.members
    }));

    return NextResponse.json(
      {
        success: true,
        data: groups
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate'
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new group
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;

    const body = await request.json();
    const { name, description, leagueId, allowedTeamIds, joinCode } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Group name is required' },
        { status: 400 }
      );
    }

    // Validate league if provided
    if (leagueId) {
      const league = await prisma.league.findUnique({
        where: { id: parseInt(leagueId) }
      });

      if (!league) {
        return NextResponse.json(
          { success: false, error: 'League not found' },
          { status: 404 }
        );
      }
    }

    // Generate join code if not provided
    const finalJoinCode = joinCode || `${name.substring(0, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;

    // Create group
    const group = await prisma.group.create({
      data: {
        name,
        description: description || '',
        ownerId: user.id,
        isPrivate: true,
        isPublic: false,
        leagueId: leagueId ? parseInt(leagueId) : null,
        allowedTeamIds: allowedTeamIds || [],
        joinCode: finalJoinCode,
        logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      },
      include: {
        league: true
      }
    });

    // Auto-add creator as owner member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: 'OWNER'
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: group,
        message: 'Group created successfully!'
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private'
        }
      }
    );
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
