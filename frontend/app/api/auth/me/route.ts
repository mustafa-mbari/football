/**
 * GET /api/auth/me
 *
 * Get current authenticated user
 * Node runtime for session access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser || !sessionUser.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        currentStreak: true,
        rank: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      {
        status: 200,
        headers: {
          // Short cache for authenticated user data
          'Cache-Control': 'private, max-age=60, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
