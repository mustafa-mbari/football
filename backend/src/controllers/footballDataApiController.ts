import { Request, Response } from 'express';
import prisma from '../config/database';
import axios from 'axios';

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

// Get available competitions/leagues
export const getCompetitions = async (req: Request, res: Response) => {
  try {
    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    const response = await axios.get(`${FOOTBALL_DATA_API_BASE_URL}/competitions`, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Get teams for a specific competition
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { competitionCode } = req.params;
    const { season } = req.query;

    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    let url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/teams`;
    if (season) {
      url += `?season=${season}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Get matches with various filters
export const getMatches = async (req: Request, res: Response) => {
  try {
    const { competitionCode, teamId } = req.params;
    const { matchday, dateFrom, dateTo, status, season } = req.query;

    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    let url: string;
    const params: string[] = [];

    // Build URL based on filters
    if (teamId) {
      url = `${FOOTBALL_DATA_API_BASE_URL}/teams/${teamId}/matches`;
    } else if (competitionCode) {
      url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/matches`;
    } else {
      url = `${FOOTBALL_DATA_API_BASE_URL}/matches`;
    }

    // Add query parameters
    if (matchday) params.push(`matchday=${matchday}`);
    if (dateFrom) params.push(`dateFrom=${dateFrom}`);
    if (dateTo) params.push(`dateTo=${dateTo}`);
    if (status) params.push(`status=${status}`);
    if (season) params.push(`season=${season}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Get standings for a competition
export const getStandings = async (req: Request, res: Response) => {
  try {
    const { competitionCode } = req.params;
    const { season, matchday } = req.query;

    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    let url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/standings`;
    const params: string[] = [];

    if (season) params.push(`season=${season}`);
    if (matchday) params.push(`matchday=${matchday}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Helper function to match team by name
const matchTeamByName = async (apiTeamName: string, leagueId: number) => {
  // Priority 1: Try exact match with apiName field (most reliable)
  let team = await prisma.team.findFirst({
    where: {
      leagues: {
        some: {
          leagueId,
          isActive: true
        }
      },
      apiName: { equals: apiTeamName, mode: 'insensitive' }
    }
  });

  if (team) return team;

  // Priority 2: Try exact match with name or shortName
  team = await prisma.team.findFirst({
    where: {
      leagues: {
        some: {
          leagueId,
          isActive: true
        }
      },
      OR: [
        { name: { equals: apiTeamName, mode: 'insensitive' } },
        { shortName: { equals: apiTeamName, mode: 'insensitive' } }
      ]
    }
  });

  if (team) return team;

  // Priority 3: Try fuzzy match (contains) - fallback only
  team = await prisma.team.findFirst({
    where: {
      leagues: {
        some: {
          leagueId,
          isActive: true
        }
      },
      OR: [
        { apiName: { contains: apiTeamName, mode: 'insensitive' } },
        { name: { contains: apiTeamName, mode: 'insensitive' } },
        { shortName: { contains: apiTeamName, mode: 'insensitive' } }
      ]
    }
  });

  return team;
};

// Prepare sync data for gameweek - shows what will be synced without actually doing it
export const prepareGameWeekSync = async (req: Request, res: Response) => {
  try {
    const { gameWeekId } = req.params;

    // Get gameweek details
    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(gameWeekId) },
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
      return res.status(404).json({
        success: false,
        message: 'GameWeek not found'
      });
    }

    // Get competition code from league (assuming you store it)
    // For now, we'll need to map league names to competition codes
    const leagueToCompCodeMap: { [key: string]: string } = {
      'Premier League': 'PL',
      'La Liga': 'PD',
      'Bundesliga': 'BL1',
      'Serie A': 'SA',
      'Ligue 1': 'FL1',
      'Eredivisie': 'DED',
      'Primeira Liga': 'PPL',
      'Champions League': 'CL',
      'Championship': 'ELC'
    };

    const competitionCode = leagueToCompCodeMap[gameWeek.league.name];
    if (!competitionCode) {
      return res.status(400).json({
        success: false,
        message: `Competition code not found for league: ${gameWeek.league.name}. Please configure the mapping.`
      });
    }

    // Fetch matches from API
    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    const apiUrl = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/matches?matchday=${gameWeek.weekNumber}`;
    const apiResponse = await axios.get(apiUrl, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    const apiMatches = apiResponse.data.matches || [];

    // Process each API match and determine if it's new or an update
    const syncPlan = [];
    const unmatchedTeams = new Set<string>();

    for (const apiMatch of apiMatches) {
      // Match teams
      const homeTeam = await matchTeamByName(apiMatch.homeTeam.name, gameWeek.leagueId);
      const awayTeam = await matchTeamByName(apiMatch.awayTeam.name, gameWeek.leagueId);

      if (!homeTeam) {
        unmatchedTeams.add(apiMatch.homeTeam.name);
      }
      if (!awayTeam) {
        unmatchedTeams.add(apiMatch.awayTeam.name);
      }

      // Check if match already exists in database
      const existingMatch = homeTeam && awayTeam ? await prisma.match.findFirst({
        where: {
          leagueId: gameWeek.leagueId,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          gameWeekMatches: {
            some: {
              gameWeekId: gameWeek.id
            }
          }
        },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      }) : null;

      const matchDate = new Date(apiMatch.utcDate);
      const status = apiMatch.status === 'FINISHED' ? 'FINISHED' :
                     apiMatch.status === 'IN_PLAY' ? 'LIVE' :
                     apiMatch.status === 'PAUSED' ? 'LIVE' :
                     'SCHEDULED';

      syncPlan.push({
        apiMatchId: apiMatch.id,
        homeTeam: {
          apiName: apiMatch.homeTeam.name,
          matched: homeTeam ? true : false,
          dbTeam: homeTeam ? { id: homeTeam.id, name: homeTeam.name } : null
        },
        awayTeam: {
          apiName: apiMatch.awayTeam.name,
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

    res.json({
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
    });
  } catch (error: any) {
    console.error('Error preparing sync:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Execute sync - actually create/update matches
export const executeGameWeekSync = async (req: Request, res: Response) => {
  try {
    const { gameWeekId } = req.params;
    const { syncPlan } = req.body;

    if (!syncPlan || !Array.isArray(syncPlan)) {
      return res.status(400).json({
        success: false,
        message: 'Sync plan is required'
      });
    }

    // Get gameweek details
    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: parseInt(gameWeekId) },
      include: { league: true }
    });

    if (!gameWeek) {
      return res.status(404).json({
        success: false,
        message: 'GameWeek not found'
      });
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const plan of syncPlan) {
      if (!plan.canSync) {
        results.skipped++;
        continue;
      }

      try {
        if (plan.action === 'CREATE') {
          // Create new match
          const match = await prisma.match.create({
            data: {
              leagueId: gameWeek.leagueId,
              homeTeamId: plan.homeTeam.dbTeam.id,
              awayTeamId: plan.awayTeam.dbTeam.id,
              matchDate: new Date(plan.matchDate),
              status: plan.status,
              homeScore: plan.homeScore,
              awayScore: plan.awayScore,
              weekNumber: gameWeek.weekNumber,
              isSynced: false
            }
          });

          // Link to gameweek
          await prisma.gameWeekMatch.create({
            data: {
              gameWeekId: gameWeek.id,
              matchId: match.id
            }
          });

          results.created++;
        } else if (plan.action === 'UPDATE' && plan.existingMatch) {
          // Update existing match
          await prisma.match.update({
            where: { id: plan.existingMatch.id },
            data: {
              matchDate: new Date(plan.matchDate),
              status: plan.status,
              homeScore: plan.homeScore,
              awayScore: plan.awayScore,
              isSynced: false // Mark as unsynced since we updated it
            }
          });

          results.updated++;
        }
      } catch (error: any) {
        results.errors.push(`${plan.homeTeam.apiName} vs ${plan.awayTeam.apiName}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Sync completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
      data: results
    });
  } catch (error: any) {
    console.error('Error executing sync:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
