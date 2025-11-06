/**
 * POST /api/auth/register
 *
 * Create new user account
 * Node runtime required for bcrypt
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
    const { email, username, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username?.toLowerCase() || '' },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existingUser.username === username?.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username?.toLowerCase() || null,
        name,
        passwordHash,
        role: 'USER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });

    // Create session (auto-login after registration)
    await createSession({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Log registration
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
          name: user.name,
          role: user.role,
        },
        message: 'Registration successful! You are now logged in.',
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
