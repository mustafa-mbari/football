/**
 * GET /api/football-data/teams/[id]/matches
 *
 * Fetches matches for a specific team from football-data.org API
 * Requires admin authentication
 * Node runtime for external API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, handleError } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db/prisma';
import axios from 'axios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FOOTBALL_DATA_API_BASE_URL = 'https://api.football-data.org/v4';

// Helper function to get API token from environment or database settings
const getApiToken = async (): Promise<string | null> => {
  // First, check environment variable
  if (process.env.FOOTBALL_DATA_API_TOKEN) {
    return process.env.FOOTBALL_DATA_API_TOKEN;
  }

  // Fall back to database setting
  const setting = await prisma.appSettings.findUnique({
    where: { key: 'FOOTBALL_DATA_API_TOKEN' }
  });
  return setting ? setting.value : null;
};

/**
 * GET /api/football-data/teams/[id]/matches
 * Get matches for a specific team with optional filters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const matchday = searchParams.get('matchday');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const season = searchParams.get('season');

    const apiToken = await getApiToken();
    if (!apiToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Football Data API token not configured'
        },
        { status: 500 }
      );
    }

    let url = `${FOOTBALL_DATA_API_BASE_URL}/teams/${id}/matches`;
    const queryParams: string[] = [];

    if (matchday) queryParams.push(`matchday=${matchday}`);
    if (dateFrom) queryParams.push(`dateFrom=${dateFrom}`);
    if (dateTo) queryParams.push(`dateTo=${dateTo}`);
    if (status) queryParams.push(`status=${status}`);
    if (season) queryParams.push(`season=${season}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: response.data
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('Football Data API error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
}
