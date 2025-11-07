/**
 * Authentication Middleware for Next.js API Routes
 *
 * Provides utilities to protect API routes and verify user permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireAuth, requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export interface AuthenticatedUser {
  id: number;
  email?: string;
  username?: string;
  role?: string;
}

/**
 * Verify user is authenticated
 * Returns user data or error response
 */
export async function verifyAuthentication(): Promise<
  { user: AuthenticatedUser } | { error: NextResponse }
> {
  const userId = await requireAuth();

  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      ),
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      ),
    };
  }

  return { user: { id: user.id, email: user.email, username: user.username, role: user.role } };
}

/**
 * Verify user has required role
 * Returns user data or error response
 */
export async function verifyRole(
  allowedRoles: string[]
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  const authResult = await verifyAuthentication();

  if ('error' in authResult) {
    return authResult;
  }

  const hasRole = await requireRole(allowedRoles);

  if (!hasRole) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden. Insufficient permissions.' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Verify user is admin (ADMIN or SUPER_ADMIN)
 */
export async function verifyAdmin(): Promise<
  { user: AuthenticatedUser } | { error: NextResponse }
> {
  return verifyRole(['ADMIN', 'SUPER_ADMIN']);
}

/**
 * Verify user is super admin
 */
export async function verifySuperAdmin(): Promise<
  { user: AuthenticatedUser } | { error: NextResponse }
> {
  return verifyRole(['SUPER_ADMIN']);
}

/**
 * Verify group membership and permissions
 */
export async function verifyGroupMembership(
  groupId: number,
  userId: number,
  requiredRole?: 'OWNER' | 'ADMIN'
): Promise<{ isMember: boolean; role?: string; error?: NextResponse }> {
  try {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return {
        isMember: false,
        error: NextResponse.json(
          { success: false, error: 'You are not a member of this group' },
          { status: 403 }
        ),
      };
    }

    if (requiredRole) {
      const allowedRoles = requiredRole === 'OWNER' ? ['OWNER'] : ['OWNER', 'ADMIN'];
      if (!allowedRoles.includes(membership.role)) {
        return {
          isMember: true,
          role: membership.role,
          error: NextResponse.json(
            { success: false, error: 'Insufficient permissions in this group' },
            { status: 403 }
          ),
        };
      }
    }

    return {
      isMember: true,
      role: membership.role,
    };
  } catch (error: any) {
    console.error('Error verifying group membership:', error);
    return {
      isMember: false,
      error: NextResponse.json(
        { success: false, error: 'Failed to verify group membership' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Helper to handle errors consistently
 */
export function handleError(error: any, message: string = 'An error occurred') {
  console.error(message, error);
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
    { status: 500 }
  );
}

/**
 * Helper to return success response
 */
export function successResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Helper to return error response
 */
export function errorResponse(error: string, status: number = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}
