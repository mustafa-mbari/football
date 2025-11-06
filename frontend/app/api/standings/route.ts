/**
 * GET /api/standings
 *
 * Fetch league standings/table
 * Edge runtime with caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'edge';
export const revalidate = 120; // 2 minutes - updates more frequently

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json(
        { success: false, error: 'leagueId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('Table')
      .select(`
        id,
        position,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        form,
        team:teamId (
          id,
          name,
          shortName,
          code,
          logoUrl
        )
      `)
      .eq('leagueId', parseInt(leagueId))
      .order('position', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          leagueId: parseInt(leagueId),
          cached: true,
          timestamp: new Date().toISOString(),
          runtime: 'edge'
        }
      },
      {
        status: 200,
        headers: {
          // Moderate caching - standings update frequently during match days
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, s-maxage=180',
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
