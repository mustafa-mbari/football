import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;

    const teams = await prisma.team.findMany({
      where: leagueId ? {
        leagues: {
          some: {
            leagueId: parseInt(leagueId as string),
            isActive: true
          }
        }
      } : undefined,
      include: {
        leagues: {
          where: { isActive: true },
          include: {
            league: {
              select: {
                id: true,
                name: true,
                code: true,
                logoUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTeamsNotInLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;

    const teams = await prisma.team.findMany({
      where: {
        leagues: {
          none: {
            leagueId: parseInt(leagueId),
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      shortName,
      apiName,
      logoUrl,
      stadiumName,
      foundedYear,
      website,
      primaryColor,
      leagueId
    } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name and code are required'
      });
    }

    // Check if team code already exists
    const existingTeam = await prisma.team.findUnique({
      where: { code }
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team with this code already exists'
      });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        code,
        shortName: shortName || null,
        apiName: apiName || null,
        logoUrl: logoUrl || null,
        stadiumName: stadiumName || null,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        website: website || null,
        primaryColor: primaryColor || null
      }
    });

    // If leagueId provided, add team to league
    if (leagueId) {
      await prisma.teamLeague.create({
        data: {
          teamId: team.id,
          leagueId: parseInt(leagueId),
          isActive: true
        }
      });
    }

    // Fetch team with league relations
    const teamWithLeagues = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        leagues: {
          where: { isActive: true },
          include: {
            league: {
              select: {
                id: true,
                name: true,
                code: true,
                logoUrl: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: teamWithLeagues,
      message: 'Team created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addTeamsToLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId, teamIds } = req.body;

    if (!leagueId || !teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: leagueId and teamIds (array) are required'
      });
    }

    // Check if league exists
    const league = await prisma.league.findUnique({
      where: { id: parseInt(leagueId) }
    });

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const teamId of teamIds) {
      try {
        // Check if team exists
        const team = await prisma.team.findUnique({
          where: { id: parseInt(teamId) }
        });

        if (!team) {
          errors.push(`Team with ID ${teamId} not found`);
          continue;
        }

        // Check if already in league
        const existing = await prisma.teamLeague.findUnique({
          where: {
            teamId_leagueId: {
              teamId: parseInt(teamId),
              leagueId: parseInt(leagueId)
            }
          }
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Add team to league
        await prisma.teamLeague.create({
          data: {
            teamId: parseInt(teamId),
            leagueId: parseInt(leagueId),
            isActive: true
          }
        });

        addedCount++;
      } catch (err: any) {
        errors.push(`Error adding team ${teamId}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        addedCount,
        skippedCount,
        errors
      },
      message: `Successfully added ${addedCount} teams to league. Skipped ${skippedCount} (already in league).`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createAndAddTeamsToLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId, teams } = req.body;

    if (!leagueId || !teams || !Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: leagueId and teams (array) are required'
      });
    }

    // Check if league exists
    const league = await prisma.league.findUnique({
      where: { id: parseInt(leagueId) }
    });

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const createdTeams: any[] = [];

    for (const teamData of teams) {
      try {
        const { name, code, shortName, apiName, logoUrl, stadiumName, foundedYear, website, primaryColor } = teamData;

        if (!name || !code) {
          errors.push(`Team missing name or code: ${JSON.stringify(teamData)}`);
          continue;
        }

        // Check if team code already exists
        const existingTeam = await prisma.team.findUnique({
          where: { code }
        });

        if (existingTeam) {
          // Team exists, check if in league
          const inLeague = await prisma.teamLeague.findUnique({
            where: {
              teamId_leagueId: {
                teamId: existingTeam.id,
                leagueId: parseInt(leagueId)
              }
            }
          });

          if (inLeague) {
            skippedCount++;
            continue;
          }

          // Add existing team to league
          await prisma.teamLeague.create({
            data: {
              teamId: existingTeam.id,
              leagueId: parseInt(leagueId),
              isActive: true
            }
          });

          createdTeams.push(existingTeam);
          createdCount++;
          continue;
        }

        // Create new team
        const team = await prisma.team.create({
          data: {
            name,
            code,
            shortName: shortName || null,
            apiName: apiName || null,
            logoUrl: logoUrl || null,
            stadiumName: stadiumName || null,
            foundedYear: foundedYear ? parseInt(foundedYear) : null,
            website: website || null,
            primaryColor: primaryColor || null,
            leagues: {
              create: {
                leagueId: parseInt(leagueId),
                isActive: true
              }
            }
          }
        });

        createdTeams.push(team);
        createdCount++;
      } catch (err: any) {
        errors.push(`Error creating team: ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        createdCount,
        skippedCount,
        errors,
        teams: createdTeams
      },
      message: `Successfully created/added ${createdCount} teams to league. Skipped ${skippedCount}.`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
