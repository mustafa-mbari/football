/**
 * POST /api/football-data/competitions/[code]/fetch-import-teams
 *
 * Fetches teams from football-data.org API and optionally imports them to database
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
 * POST /api/football-data/competitions/[code]/fetch-import-teams
 * Fetch teams from API and optionally import them to database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { code } = await params;
    const body = await request.json();
    const { season, leagueId, importSelected } = body;

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

    // Fetch teams from API
    let url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${code}/teams`;
    if (season) {
      url += `?season=${season}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    const apiTeams = response.data.teams || [];

    // If importSelected is provided and leagueId is provided, import the selected teams
    if (importSelected && Array.isArray(importSelected) && leagueId) {
      const leagueIdInt = parseInt(leagueId);

      // Verify league exists
      const league = await prisma.league.findUnique({
        where: { id: leagueIdInt }
      });

      if (!league) {
        return NextResponse.json(
          {
            success: false,
            message: 'League not found'
          },
          { status: 404 }
        );
      }

      let createdCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];
      const importedTeams: any[] = [];

      for (const teamId of importSelected) {
        // Find team in API response
        const apiTeam = apiTeams.find((t: any) => t.id === teamId);
        if (!apiTeam) {
          errors.push(`Team with API ID ${teamId} not found in API response`);
          continue;
        }

        try {
          // Generate a code from team name (e.g., "Manchester United" -> "MUN")
          const generateCode = (name: string): string => {
            const words = name.split(' ').filter(w => w.length > 2);
            if (words.length >= 2) {
              return words.slice(0, 2).map(w => w[0]).join('').toUpperCase() + words[words.length - 1][0].toUpperCase();
            }
            return name.substring(0, 3).toUpperCase();
          };

          let code = generateCode(apiTeam.name);

          // Check if code exists and make it unique if needed
          let codeExists = await prisma.team.findUnique({ where: { code } });
          let suffix = 1;
          while (codeExists) {
            code = `${generateCode(apiTeam.name)}${suffix}`;
            codeExists = await prisma.team.findUnique({ where: { code } });
            suffix++;
          }

          // Check if team already exists by name or shortName
          let existingTeam = await prisma.team.findFirst({
            where: {
              OR: [
                { name: { equals: apiTeam.name, mode: 'insensitive' } },
                { apiName: { equals: apiTeam.name, mode: 'insensitive' } },
                { shortName: { equals: apiTeam.shortName, mode: 'insensitive' } }
              ]
            }
          });

          if (existingTeam) {
            // Team exists, check if in league
            const inLeague = await prisma.teamLeague.findUnique({
              where: {
                teamId_leagueId: {
                  teamId: existingTeam.id,
                  leagueId: leagueIdInt
                }
              }
            });

            if (!inLeague) {
              // Add existing team to league
              await prisma.teamLeague.create({
                data: {
                  teamId: existingTeam.id,
                  leagueId: leagueIdInt,
                  isActive: true
                }
              });
              importedTeams.push(existingTeam);
              createdCount++;
            } else {
              skippedCount++;
            }
            continue;
          }

          // Create new team
          const team = await prisma.team.create({
            data: {
              name: apiTeam.name,
              code: code,
              shortName: apiTeam.shortName || null,
              apiName: apiTeam.name,
              logoUrl: apiTeam.crest || null,
              stadiumName: apiTeam.venue || null,
              foundedYear: apiTeam.founded || null,
              website: apiTeam.website || null,
              primaryColor: apiTeam.clubColors?.split('/')[0]?.trim() || null,
              leagues: {
                create: {
                  leagueId: leagueIdInt,
                  isActive: true
                }
              }
            },
            include: {
              leagues: {
                where: { isActive: true },
                include: {
                  league: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    }
                  }
                }
              }
            }
          });

          importedTeams.push(team);
          createdCount++;
        } catch (err: any) {
          errors.push(`Error importing ${apiTeam.name}: ${err.message}`);
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            apiTeams: apiTeams.map((t: any) => ({
              id: t.id,
              name: t.name,
              shortName: t.shortName,
              crest: t.crest,
              website: t.website,
              founded: t.founded,
              venue: t.venue,
              clubColors: t.clubColors
            })),
            imported: {
              count: createdCount,
              skipped: skippedCount,
              errors,
              teams: importedTeams
            }
          },
          message: `Successfully imported ${createdCount} teams. Skipped ${skippedCount}.`
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // If no import, just return the API teams
    return NextResponse.json(
      {
        success: true,
        data: {
          apiTeams: apiTeams.map((t: any) => ({
            id: t.id,
            name: t.name,
            shortName: t.shortName,
            crest: t.crest,
            website: t.website,
            founded: t.founded,
            venue: t.venue,
            clubColors: t.clubColors
          }))
        }
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
