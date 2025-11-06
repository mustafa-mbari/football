/**
 * EDGE-COMPATIBLE VERSION using Supabase Client
 *
 * Use this instead of Prisma for Edge runtime
 * Prisma doesn't work on Edge, but Supabase JS client does!
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'edge';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const leagueId = searchParams.get('leagueId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // ✅ Build Supabase query with selective fields
    let query = supabaseAdmin
      .from('Match')
      .select(
        `
        id,
        matchDate,
        homeScore,
        awayScore,
        status,
        weekNumber,
        isPredictionLocked,
        homeTeam:homeTeamId (
          id,
          name,
          shortName,
          code,
          logoUrl
        ),
        awayTeam:awayTeamId (
          id,
          name,
          shortName,
          code,
          logoUrl
        ),
        league:leagueId (
          id,
          name,
          code
        )
      `,
        { count: 'exact' }
      )
      .order('matchDate', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (leagueId) {
      query = query.eq('leagueId', parseInt(leagueId));
    }
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data, error, count } = await query;

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
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasMore: data.length === limit
        },
        meta: {
          cached: true,
          timestamp: new Date().toISOString(),
          runtime: 'edge'
        }
      },
      {
        status: 200,
        headers: {
          // ✅ Aggressive caching for match lists
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'CDN-Cache-Control': 'public, s-maxage=120',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
