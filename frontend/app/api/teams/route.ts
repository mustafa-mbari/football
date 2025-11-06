/**
 * GET /api/teams
 *
 * Fetch all teams
 * Edge runtime - teams are relatively static
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'edge';
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    let query = supabaseAdmin
      .from('Team')
      .select(`
        id,
        name,
        shortName,
        code,
        logoUrl,
        stadiumName,
        primaryColor
      `)
      .order('name', { ascending: true })
      .limit(limit);

    // Filter by league if specified
    if (leagueId) {
      // Join through TeamLeague table
      const { data: teamLeagues } = await supabaseAdmin
        .from('TeamLeague')
        .select('teamId')
        .eq('leagueId', parseInt(leagueId))
        .eq('isActive', true);

      const teamIds = teamLeagues?.map(tl => tl.teamId) || [];

      if (teamIds.length > 0) {
        query = query.in('id', teamIds);
      } else {
        // No teams in this league
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
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
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
