/**
 * Supabase Client for Edge Runtime
 *
 * Use this for Edge API routes (read-only queries)
 * Standard Prisma doesn't work on Edge runtime
 */

import { createClient } from '@supabase/supabase-js';

// Helper function to get environment variable with validation
function getEnvVar(key: string, fallback: string = ''): string {
  const value = process.env[key];

  if (!value && typeof window === 'undefined') {
    // Only warn in development, not during build
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Warning: Missing ${key} environment variable`);
    }
    return fallback;
  }

  return value || fallback;
}

// Lazy-loaded clients to avoid initialization during build
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;
let _supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Supabase client with service role key
 * ⚠️ ONLY use on server-side (API routes)
 * NEVER expose service role key to client
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
      const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBsYWNlaG9sZGVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      _supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }
    return (_supabaseAdmin as any)[prop];
  }
});

/**
 * Supabase client with anon key (client-safe)
 * Use for client-side if needed
 */
export const supabaseClient = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabaseClient) {
      const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
      const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBsYWNlaG9sZGVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      _supabaseClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true
          }
        }
      );
    }
    return (_supabaseClient as any)[prop];
  }
});

/**
 * Type-safe database queries
 * Maps Prisma model names to Supabase table names
 */
export const db = {
  user: () => supabaseAdmin.from('User'),
  match: () => supabaseAdmin.from('Match'),
  prediction: () => supabaseAdmin.from('Prediction'),
  league: () => supabaseAdmin.from('League'),
  team: () => supabaseAdmin.from('Team'),
  table: () => supabaseAdmin.from('Table'),
  group: () => supabaseAdmin.from('Group'),
  groupMember: () => supabaseAdmin.from('GroupMember'),
  gameWeek: () => supabaseAdmin.from('GameWeek'),
  session: () => supabaseAdmin.from('Session'),
};

/**
 * Execute raw SQL (Edge-compatible)
 * Use for complex queries, aggregations, etc.
 */
export async function executeSql<T = any>(query: string, params?: any[]): Promise<T[]> {
  const { data, error } = await supabaseAdmin.rpc('execute_sql', {
    query,
    params: params || []
  });

  if (error) {
    console.error('SQL execution error:', error);
    throw new Error(error.message);
  }

  return data as T[];
}
