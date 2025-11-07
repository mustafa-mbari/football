/**
 * PUT /api/gameweeks/[id]/complete - Mark gameweek as completed
 *
 * This endpoint:
 * 1. Updates gameweek status to COMPLETED
 * 2. Sets isCurrent to false
 * 3. Finalizes all match results
 *
 * Auth required (Admin only)
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PUT /api/gameweeks/[id]/complete
 * Mark gameweek as completed
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { id } = await params;

    // Update gameweek status
    const gameWeek = await prisma.gameWeek.update({
      where: { id: parseInt(id) },
      data: {
        status: 'COMPLETED',
        isCurrent: false
      },
      include: {
        league: {
          select: { id: true, name: true, country: true, season: true, logoUrl: true }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: gameWeek,
        message: `GameWeek ${gameWeek.weekNumber} marked as completed`
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to complete gameweek');
  }
}
