import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

// ✅ EDGE RUNTIME - 10-100x faster for reads
export const runtime = 'edge';

// ✅ ISR-like behavior - Revalidate every 60 seconds
export const revalidate = 60;

/**
 * GET /api/matches
 *
 * Query params:
 * - leagueId: Filter by league
 * - status: Filter by match status (SCHEDULED, LIVE, FINISHED, etc.)
 * - limit: Number of results (default: 50, max: 100)
 * - page: Page number (default: 1)
 *
 * Performance optimizations:
 * - Edge runtime (global distribution, zero cold starts)
 * - Pagination (prevents large payloads)
 * - Selective fields (only essential data)
 * - HTTP caching (CDN + browser caching)
 * - ISR revalidation (updates every 60s)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters with validation
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

// ✅ OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
