/**
 * GET /api/football-data/gameweeks/[id]/prepare-sync
 *
 * Prepares sync data for gameweek - shows what will be synced without actually doing it
 * Requires admin authentication
 * Node runtime for Prisma and external API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, handleError } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db/prisma';
import axios from 'axios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FOOTBALL_DATA_API_BASE_URL = 'https://api.football-data.org/v4';

// Helper function to get API token
const getApiToken = async (): Promise<string | null> => {
  if (process.env.FOOTBALL_DATA_API_TOKEN) {
    return process.env.FOOTBALL_DATA_API_TOKEN;
  }
  const setting = await prisma.appSettings.findUnique({
    where: { key: 'FOOTBALL_DATA_API_TOKEN' }
  });
  return setting ? setting.value : null;
};

/**
 * GET /api/football-data/gameweeks/[id]/prepare-sync
 * Prepare sync data for gameweek
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
    const gameWeekId = parseInt(id);

    // Get gameweek details
    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: gameWeekId },
      include: {
        league: true,
        matches: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        }
      }
    });

    if (!gameWeek) {
      return NextResponse.json(
        {
          success: false,
          message: 'GameWeek not found'
        },
        { status: 404 }
      );
    }

    // Map league names to competition codes
    const leagueToCompCodeMap: { [key: string]: string } = {
      'Premier League': 'PL',
      'La Liga': 'PD',
      'Bundesliga': 'BL1',
      'Serie A': 'SA',
      'Ligue 1': 'FL1',
      'Eredivisie': 'DED',
      'Primeira Liga': 'PPL',
      'Champions League': 'CL',
      'UEFA Champions League': 'CL',
      'Championship': 'ELC'
    };

    const competitionCode = leagueToCompCodeMap[gameWeek.league.name];
    if (!competitionCode) {
      return NextResponse.json(
        {
          success: false,
          message: `Competition code not found for league: ${gameWeek.league.name}. Please configure the mapping.`
        },
        { status: 400 }
      );
    }

    // Fetch matches from API
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

    const apiUrl = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/matches?matchday=${gameWeek.weekNumber}`;
    const apiResponse = await axios.get(apiUrl, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    const apiMatches = apiResponse.data.matches || [];

    // Fetch all teams in this league once and cache them
    const allLeagueTeams = await prisma.team.findMany({
      where: {
        leagues: {
          some: {
            leagueId: gameWeek.leagueId,
            isActive: true
          }
        }
      }
    });

    // Build lookup maps for fast matching
    const teamCache = new Map<string, any>();
    for (const team of allLeagueTeams) {
      if (team.apiName) teamCache.set(team.apiName.toLowerCase(), team);
      if (team.name) teamCache.set(team.name.toLowerCase(), team);
      if (team.shortName) teamCache.set(team.shortName.toLowerCase(), team);
    }

    // Helper function to match team using cache
    const matchTeamFromCache = (apiTeamName: string | null | undefined) => {
      if (!apiTeamName) return null;

      const nameLower = apiTeamName.toLowerCase();

      // Priority 1: Exact match
      if (teamCache.has(nameLower)) {
        return teamCache.get(nameLower);
      }

      // Priority 2: Fuzzy match (contains)
      for (const team of allLeagueTeams) {
        if (team.apiName?.toLowerCase().includes(nameLower) ||
            team.name?.toLowerCase().includes(nameLower) ||
            team.shortName?.toLowerCase().includes(nameLower) ||
            nameLower.includes(team.name?.toLowerCase() || '') ||
            nameLower.includes(team.shortName?.toLowerCase() || '')) {
          return team;
        }
      }

      return null;
    };

    // Process each API match and determine if it's new or an update
    const syncPlan = [];
    const unmatchedTeams = new Set<string>();

    // Collect all potential match lookups first
    const matchLookups: Array<{homeTeam: any, awayTeam: any, apiMatch: any}> = [];

    for (const apiMatch of apiMatches) {
      // Match teams using cache (no DB queries!)
      const homeTeam = matchTeamFromCache(apiMatch.homeTeam?.name);
      const awayTeam = matchTeamFromCache(apiMatch.awayTeam?.name);

      if (!homeTeam && apiMatch.homeTeam?.name) {
        unmatchedTeams.add(apiMatch.homeTeam.name);
      }
      if (!awayTeam && apiMatch.awayTeam?.name) {
        unmatchedTeams.add(apiMatch.awayTeam.name);
      }

      matchLookups.push({ homeTeam, awayTeam, apiMatch });
    }

    // Batch fetch all existing matches in one query
    const teamPairs = matchLookups
      .filter(m => m.homeTeam && m.awayTeam)
      .map(m => ({ homeTeamId: m.homeTeam.id, awayTeamId: m.awayTeam.id }));

    const existingMatches = teamPairs.length > 0 ? await prisma.match.findMany({
      where: {
        leagueId: gameWeek.leagueId,
        gameWeekMatches: {
          some: {
            gameWeekId: gameWeek.id
          }
        },
        OR: teamPairs.map(pair => ({
          homeTeamId: pair.homeTeamId,
          awayTeamId: pair.awayTeamId
        }))
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    }) : [];

    // Create a lookup map for existing matches
    const existingMatchMap = new Map<string, any>();
    for (const match of existingMatches) {
      const key = `${match.homeTeamId}-${match.awayTeamId}`;
      existingMatchMap.set(key, match);
    }

    // Build sync plan using cached data
    for (const { homeTeam, awayTeam, apiMatch } of matchLookups) {
      const existingMatch = homeTeam && awayTeam
        ? existingMatchMap.get(`${homeTeam.id}-${awayTeam.id}`)
        : null;

      const matchDate = new Date(apiMatch.utcDate);
      const status = apiMatch.status === 'FINISHED' ? 'FINISHED' :
                     apiMatch.status === 'IN_PLAY' ? 'LIVE' :
                     apiMatch.status === 'PAUSED' ? 'LIVE' :
                     'SCHEDULED';

      syncPlan.push({
        apiMatchId: apiMatch.id,
        homeTeam: {
          apiName: apiMatch.homeTeam?.name || 'Unknown',
          matched: homeTeam ? true : false,
          dbTeam: homeTeam ? { id: homeTeam.id, name: homeTeam.name } : null
        },
        awayTeam: {
          apiName: apiMatch.awayTeam?.name || 'Unknown',
          matched: awayTeam ? true : false,
          dbTeam: awayTeam ? { id: awayTeam.id, name: awayTeam.name } : null
        },
        matchDate: matchDate.toISOString(),
        status,
        homeScore: apiMatch.score?.fullTime?.home ?? null,
        awayScore: apiMatch.score?.fullTime?.away ?? null,
        action: existingMatch ? 'UPDATE' : 'CREATE',
        existingMatch: existingMatch ? {
          id: existingMatch.id,
          homeTeam: existingMatch.homeTeam.name,
          awayTeam: existingMatch.awayTeam.name,
          matchDate: existingMatch.matchDate,
          status: existingMatch.status,
          homeScore: existingMatch.homeScore,
          awayScore: existingMatch.awayScore
        } : null,
        canSync: homeTeam && awayTeam ? true : false
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          gameWeek: {
            id: gameWeek.id,
            weekNumber: gameWeek.weekNumber,
            league: gameWeek.league.name
          },
          competitionCode,
          totalApiMatches: apiMatches.length,
          syncPlan,
          unmatchedTeams: Array.from(unmatchedTeams),
          summary: {
            total: syncPlan.length,
            toCreate: syncPlan.filter(m => m.action === 'CREATE' && m.canSync).length,
            toUpdate: syncPlan.filter(m => m.action === 'UPDATE' && m.canSync).length,
            cannotSync: syncPlan.filter(m => !m.canSync).length
          }
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Error preparing sync:', error);
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
