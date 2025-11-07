/**
 * GET /api/groups/[id] - Get group details
 * PUT /api/groups/[id] - Update group (owner only)
 * DELETE /api/groups/[id] - Delete group (owner only)
 *
 * Node runtime for auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuthentication, handleError, successResponse, errorResponse } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get group details with members
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

    console.log(`Fetching group with ID: ${id}`);

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        league: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
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
          },
          orderBy: {
            totalPoints: 'desc'
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    console.log(`Group query result:`, group ? `Found group: ${group.name}` : 'Group not found');

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is member (for private groups)
    const isMember = group.members.some(m => m.userId === user.id);
    if (group.isPrivate && !isMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You are not a member of this group.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: group
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, must-revalidate'
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update group (owner only)
export async function PUT(
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

    const body = await request.json();
    const { name, description, maxMembers } = body;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    if (group.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the group owner can update the group' },
        { status: 403 }
      );
    }

    if (group.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Cannot update public groups' },
        { status: 400 }
      );
    }

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(maxMembers && { maxMembers })
      },
      include: {
        league: true
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedGroup,
        message: 'Group updated successfully!'
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error: any) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete group (owner only)
export async function DELETE(
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

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    if (group.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the group owner can delete the group' },
        { status: 403 }
      );
    }

    if (group.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete public groups' },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Group deleted successfully'
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
