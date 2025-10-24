import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Define available tables for export
export const EXPORTABLE_TABLES = {
  users: 'Users',
  leagues: 'Leagues',
  teams: 'Teams',
  matches: 'Matches',
  predictions: 'Predictions',
  gameWeeks: 'GameWeeks',
  gameWeekMatches: 'GameWeek Matches',
  teamGameWeekStats: 'Team GameWeek Stats',
  tableSnapshots: 'Table Snapshots',
  tables: 'Standings Tables',
  groups: 'Groups',
  groupMembers: 'Group Members',
  achievements: 'Achievements',
  userAchievements: 'User Achievements',
  notifications: 'Notifications',
  pointsRules: 'Points Rules',
  appSettings: 'App Settings',
  userFavoriteTeams: 'User Favorite Teams',
  sessions: 'Sessions',
  loginHistory: 'Login History',
  auditLogs: 'Audit Logs',
  analytics: 'Analytics'
} as const;

type ExportableTable = keyof typeof EXPORTABLE_TABLES;

/**
 * Get list of available tables for export
 */
export const getAvailableTables = async (req: Request, res: Response) => {
  try {
    const tables = Object.entries(EXPORTABLE_TABLES).map(([key, name]) => ({
      key,
      name
    }));

    res.json({
      success: true,
      data: tables
    });
  } catch (error: any) {
    console.error('Error getting available tables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available tables',
      error: error.message
    });
  }
};

/**
 * Export selected tables to JSON files
 */
export const exportData = async (req: Request, res: Response) => {
  try {
    const { tables } = req.body as { tables: ExportableTable[] };

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one table to export'
      });
    }

    // Validate all table names
    const invalidTables = tables.filter(table => !EXPORTABLE_TABLES[table]);
    if (invalidTables.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid table names: ${invalidTables.join(', ')}`
      });
    }

    // Export directly to the main seeds/data directory (not backup)
    const exportDir = path.join(__dirname, '../../prisma/seeds/data');

    // Create directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportedFiles: { table: string; fileName: string; count: number }[] = [];

    // Export each selected table
    for (const table of tables) {
      try {
        const data = await exportTable(table);
        // Use simple filename without timestamp - will overwrite existing file
        const fileName = `${table}.json`;
        const filePath = path.join(exportDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        exportedFiles.push({
          table: EXPORTABLE_TABLES[table],
          fileName,
          count: Array.isArray(data) ? data.length : 1
        });
      } catch (error: any) {
        console.error(`Error exporting ${table}:`, error);
        // Continue with other tables
      }
    }

    res.json({
      success: true,
      message: `Successfully exported ${exportedFiles.length} table(s)`,
      data: {
        exportedFiles,
        exportDir
      }
    });
  } catch (error: any) {
    console.error('Error during export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

/**
 * Export a single table based on table name
 */
async function exportTable(tableName: ExportableTable) {
  switch (tableName) {
    case 'users':
      return await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          username: true,
          passwordHash: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          avatar: true,
          bio: true,
          totalPoints: true,
          weeklyPoints: true,
          monthlyPoints: true,
          seasonPoints: true,
          predictionAccuracy: true,
          totalPredictions: true,
          correctPredictions: true,
          currentStreak: true,
          bestStreak: true,
          rank: true,
          lastLoginAt: true,
          createdAt: true
        }
      });

    case 'leagues':
      return await prisma.league.findMany();

    case 'teams':
      return await prisma.team.findMany({
        include: {
          league: {
            select: { code: true }
          }
        }
      });

    case 'matches':
      return await prisma.match.findMany({
        include: {
          league: { select: { code: true } },
          homeTeam: { select: { code: true, name: true } },
          awayTeam: { select: { code: true, name: true } }
        }
      });

    case 'predictions':
      const predictions = await prisma.prediction.findMany({
        include: {
          match: {
            select: {
              homeTeam: { select: { code: true } },
              awayTeam: { select: { code: true } },
              matchDate: true,
              league: { select: { code: true } }
            }
          },
          user: { select: { email: true } }
        }
      });

      return predictions.map(p => ({
        userEmail: p.user.email,
        leagueCode: p.match.league.code,
        homeTeamCode: p.match.homeTeam.code,
        awayTeamCode: p.match.awayTeam.code,
        matchDate: p.match.matchDate,
        predictedHomeScore: p.predictedHomeScore,
        predictedAwayScore: p.predictedAwayScore,
        predictedResult: p.predictedResult,
        confidence: p.confidence,
        resultPoints: p.resultPoints,
        scorePoints: p.scorePoints,
        bonusPoints: p.bonusPoints,
        totalPoints: p.totalPoints,
        isProcessed: p.isProcessed,
        isLate: p.isLate,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));

    case 'gameWeeks':
      return await prisma.gameWeek.findMany({
        include: {
          league: { select: { code: true } }
        }
      });

    case 'gameWeekMatches':
      return await prisma.gameWeekMatch.findMany({
        include: {
          gameWeek: {
            select: {
              weekNumber: true,
              league: { select: { code: true } }
            }
          },
          match: {
            select: {
              homeTeam: { select: { code: true } },
              awayTeam: { select: { code: true } },
              matchDate: true
            }
          }
        }
      });

    case 'teamGameWeekStats':
      return await prisma.teamGameWeekStats.findMany({
        include: {
          gameWeek: {
            select: {
              weekNumber: true,
              league: { select: { code: true } }
            }
          },
          team: { select: { code: true, name: true } }
        }
      });

    case 'tableSnapshots':
      return await prisma.tableSnapshot.findMany({
        include: {
          gameWeek: {
            select: {
              weekNumber: true,
              league: { select: { code: true } }
            }
          },
          team: { select: { code: true, name: true } }
        }
      });

    case 'tables':
      return await prisma.table.findMany({
        include: {
          league: { select: { code: true } },
          team: { select: { code: true, name: true } },
          nextOpponent: { select: { code: true, name: true } }
        }
      });

    case 'groups':
      const groups = await prisma.group.findMany({
        include: {
          owner: { select: { email: true } },
          league: { select: { code: true } },
          members: {
            include: {
              user: { select: { email: true } }
            }
          }
        }
      });

      return groups.map(g => ({
        name: g.name,
        description: g.description,
        code: g.code,
        isPrivate: g.isPrivate,
        isPublic: g.isPublic,
        joinCode: g.joinCode,
        maxMembers: g.maxMembers,
        ownerEmail: g.owner.email,
        logoUrl: g.logoUrl,
        leagueCode: g.league?.code,
        allowedTeamIds: g.allowedTeamIds,
        members: g.members.map(m => ({
          userEmail: m.user.email,
          role: m.role,
          pointsByLeague: m.pointsByLeague,
          totalPoints: m.totalPoints,
          joinedAt: m.joinedAt
        })),
        createdAt: g.createdAt
      }));

    case 'groupMembers':
      return await prisma.groupMember.findMany({
        include: {
          group: { select: { code: true, name: true } },
          user: { select: { email: true } }
        }
      });

    case 'achievements':
      return await prisma.achievement.findMany();

    case 'userAchievements':
      const userAchievements = await prisma.userAchievement.findMany({
        include: {
          user: { select: { email: true } },
          achievement: { select: { name: true } }
        }
      });

      return userAchievements.map(ua => ({
        userEmail: ua.user.email,
        achievementName: ua.achievement.name,
        progress: ua.progress,
        unlockedAt: ua.unlockedAt
      }));

    case 'notifications':
      return await prisma.notification.findMany({
        include: {
          user: { select: { email: true } }
        }
      });

    case 'pointsRules':
      return await prisma.pointsRule.findMany();

    case 'appSettings':
      return await prisma.appSettings.findMany();

    case 'userFavoriteTeams':
      const favoriteTeams = await prisma.userFavoriteTeam.findMany({
        include: {
          user: { select: { email: true } },
          team: { select: { code: true } }
        }
      });

      return favoriteTeams.map(ft => ({
        userEmail: ft.user.email,
        teamCode: ft.team.code,
        createdAt: ft.createdAt
      }));

    case 'sessions':
      return await prisma.session.findMany({
        include: {
          user: { select: { email: true } }
        }
      });

    case 'loginHistory':
      return await prisma.loginHistory.findMany({
        include: {
          user: { select: { email: true } }
        }
      });

    case 'auditLogs':
      return await prisma.auditLog.findMany();

    case 'analytics':
      return await prisma.analytics.findMany();

    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
}
