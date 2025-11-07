/**
 * GET /api/groups/user - Get user's groups
 *
 * Returns all groups the authenticated user is a member of
 * Node runtime for auth and Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/groups/user
 * Get all groups the user is a member of
 */
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
          include: {
            league: true,
            owner: {
              select: {
                id: true,
                username: true
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
      memberPointsByLeague: m.pointsByLeague
    }));

    return NextResponse.json(
      {
        success: true,
        data: groups
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch user groups');
  }
}
