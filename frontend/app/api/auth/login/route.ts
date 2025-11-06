/**
 * POST /api/auth/login
 *
 * Authenticate user and create session
 * Node runtime required for bcrypt and session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log login attempt
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        loginStatus: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        message: 'Login successful!',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
