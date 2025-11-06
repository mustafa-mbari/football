/**
 * Supabase Client for Edge Runtime
 *
 * Use this for Edge API routes (read-only queries)
 * Standard Prisma doesn't work on Edge runtime
 */

import { createClient } from '@supabase/supabase-js';

// Helper function to get environment variable with fallback
function getEnvVar(key: string, required = true): string {
  const value = process.env[key];

  // During build time, environment variables might not be available
  // Only throw if we're in runtime (not build)
  if (!value && required && typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`Warning: Missing ${key} environment variable`);
  }

  return value || '';
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

/**
 * Supabase client with service role key
 * ⚠️ ONLY use on server-side (API routes)
 * NEVER expose service role key to client
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Supabase client with anon key (client-safe)
 * Use for client-side if needed
 */
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

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
