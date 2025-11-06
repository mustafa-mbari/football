/**
 * Supabase Client for Edge Runtime
 *
 * Use this for Edge API routes (read-only queries)
 * Standard Prisma doesn't work on Edge runtime
 */

import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Supabase client with service role key
 * ⚠️ ONLY use on server-side (API routes)
 * NEVER expose service role key to client
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
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
