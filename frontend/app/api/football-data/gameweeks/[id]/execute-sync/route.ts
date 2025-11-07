/**
 * POST /api/football-data/gameweeks/[id]/execute-sync
 *
 * Execute sync - actually create/update matches from sync plan
 * Requires admin authentication
 * Node runtime for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, handleError } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/football-data/gameweeks/[id]/execute-sync
 * Execute sync plan to create/update matches
 */
export async function POST(
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
    const body = await request.json();
    const { syncPlan } = body;

    if (!syncPlan || !Array.isArray(syncPlan)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sync plan is required'
        },
        { status: 400 }
      );
    }

    // Get gameweek details
    const gameWeek = await prisma.gameWeek.findUnique({
      where: { id: gameWeekId },
      include: { league: true }
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

    return NextResponse.json(
      {
        success: true,
        message: `Sync completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
        data: results
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Error executing sync:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 }
    );
  }
}
