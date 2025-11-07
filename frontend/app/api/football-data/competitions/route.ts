/**
 * GET /api/football-data/competitions
 *
 * Fetches available competitions from football-data.org API
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
 * GET /api/football-data/competitions
 * Get available competitions from football-data.org API
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

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

    const response = await axios.get(`${FOOTBALL_DATA_API_BASE_URL}/competitions`, {
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
          'Cache-Control': 'private, s-maxage=3600, stale-while-revalidate=7200',
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
