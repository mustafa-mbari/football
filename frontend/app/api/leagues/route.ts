/**
 * GET /api/leagues
 *
 * Fetch all leagues
 * Edge runtime - leagues are relatively static data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'edge';
export const revalidate = 300; // 5 minutes - leagues rarely change

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    let query = supabaseAdmin
      .from('League')
      .select(`
        id,
        name,
        code,
        country,
        logoUrl,
        season,
        startDate,
        endDate,
        isActive,
        priority
      `)
      .order('priority', { ascending: false })
      .order('name', { ascending: true });

    // Filter by active status if specified
    if (isActive !== null) {
      query = query.eq('isActive', isActive === 'true');
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
          // Aggressive caching for leagues
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=600',
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
