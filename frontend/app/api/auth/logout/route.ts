/**
 * POST /api/auth/logout
 *
 * Destroy user session
 * Node runtime for session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await destroySession();

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      }
    );
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
