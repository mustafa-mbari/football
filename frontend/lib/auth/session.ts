/**
 * Session Management for Next.js API Routes
 *
 * Uses iron-session for secure, encrypted sessions
 * Compatible with both Edge and Node runtimes
 */

import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: number;
  email?: string;
  username?: string;
  role?: string;
  isLoggedIn: boolean;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'football_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  },
};

/**
 * Get session from request
 * Works in both App Router (Server Components) and API Routes
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Verify user is authenticated
 * Returns userId or null
 */
export async function requireAuth(): Promise<number | null> {
  const session = await getSession();
  return session.isLoggedIn ? session.userId || null : null;
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    username: session.username,
    role: session.role,
  };
}

/**
 * Create session for user
 */
export async function createSession(user: {
  id: number;
  email: string;
  username?: string | null;
  role: string;
}) {
  const session = await getSession();

  session.userId = user.id;
  session.email = user.email;
  session.username = user.username || undefined;
  session.role = user.role;
  session.isLoggedIn = true;

  await session.save();
}

/**
 * Destroy session (logout)
 */
export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: string[]): Promise<boolean> {
  const session = await getSession();

  if (!session.isLoggedIn || !session.role) {
    return false;
  }

  return allowedRoles.includes(session.role);
}
