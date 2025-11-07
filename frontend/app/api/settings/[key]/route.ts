/**
 * GET /api/settings/[key] - Get specific setting
 * PUT /api/settings/[key] - Update/create setting (admin only)
 * DELETE /api/settings/[key] - Delete setting (admin only)
 *
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdmin, handleError, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/settings/[key]
 * Get a specific setting by key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    const setting = await prisma.appSettings.findUnique({
      where: { key }
    });

    if (!setting) {
      return errorResponse('Setting not found', 404);
    }

    return NextResponse.json(
      { success: true, data: setting },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to fetch setting');
  }
}

/**
 * PUT /api/settings/[key]
 * Update or create a setting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { key } = await params;
    const body = await request.json();
    const { value, description } = body;

    if (!value) {
      return errorResponse('Value is required', 400);
    }

    const setting = await prisma.appSettings.upsert({
      where: { key },
      update: {
        value: value.toString(),
        description: description || undefined
      },
      create: {
        key,
        value: value.toString(),
        description: description || undefined
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Setting updated successfully',
        data: setting
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to update setting');
  }
}

/**
 * DELETE /api/settings/[key]
 * Delete a setting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { key } = await params;

    await prisma.appSettings.delete({
      where: { key }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Setting deleted successfully'
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return handleError(error, 'Failed to delete setting');
  }
}
