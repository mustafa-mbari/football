/**
 * GET /api/gameweeks
 *
 * Fetch gameweeks for a league
 * Edge runtime
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'edge';
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const isCurrent = searchParams.get('isCurrent');

    if (!leagueId) {
      return NextResponse.json(
        { success: false, error: 'leagueId is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('GameWeek')
      .select(`
        id,
        weekNumber,
        startDate,
        endDate,
        status,
        isCurrent
      `)
      .eq('leagueId', parseInt(leagueId))
      .order('weekNumber', { ascending: true });

    // Filter by current if specified
    if (isCurrent === 'true') {
      query = query.eq('isCurrent', true);
    }

    const { data, error } = await query;

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
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=600',
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching gameweeks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
