/**
 * GET /api/groups/[id]/leaderboard - Get group leaderboard
 *
 * Query params:
 * - leagueId (optional): Filter by specific league
 * - weekNumber (optional): Filter by specific gameweek (requires leagueId)
 *
 * Returns ranked leaderboard with member points
 * Auth required (must be member for private groups)
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/groups/[id]/leaderboard
 * Get group leaderboard with optional filters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      return authResult.error;
    }
    const user = authResult.user;
    const { id } = await params;

    // Get query params
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const weekNumber = searchParams.get('weekNumber');

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      return errorResponse('Group not found', 404);
    }

    // Check if user is member (for private groups)
    const isMember = group.members.some(m => m.userId === user.id);
    if (group.isPrivate && !isMember) {
      return errorResponse('Access denied. You are not a member of this group.', 403);
    }

    // Calculate points based on league and gameweek filter
    const leaderboard = group.members.map(member => {
      const pointsByLeague = (member.pointsByLeague || {}) as Record<string, number>;
      const pointsByGameweek = (member.pointsByGameweek || {}) as Record<string, Record<string, number>>;

      let points = 0;

      // Determine which league to use
      const targetLeagueId = leagueId?.toString() || group.leagueId?.toString();

      if (weekNumber && targetLeagueId) {
        // Gameweek-specific points for a league
        const weekKey = weekNumber.toString();
        points = pointsByGameweek?.[targetLeagueId]?.[weekKey] || 0;
      } else if (targetLeagueId) {
        // All-time points for a specific league
        points = pointsByLeague[targetLeagueId] || 0;
      } else {
        // Cross-league private group - sum all leagues
        points = Object.values(pointsByLeague).reduce((sum, p) => sum + (p || 0), 0);
      }

      return {
        userId: member.user.id,
        username: member.user.username,
        email: member.user.email,
        avatar: member.user.avatar,
        points,
        role: member.role,
        joinedAt: member.joinedAt
      };
    });

    // Sort by points and add ranks
    leaderboard.sort((a, b) => b.points - a.points);
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    return NextResponse.json(
      {
        success: true,
        data: rankedLeaderboard
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch group leaderboard');
  }
}
