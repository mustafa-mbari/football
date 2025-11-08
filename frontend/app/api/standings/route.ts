/**
 * GET /api/standings
 *
 * Fetch league standings/table
 * - Without leagueId: Returns all leagues with their standings
 * - With leagueId: Returns standings for specific league
 * Node runtime required for Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    // If leagueId is provided, return standings for that specific league
    if (leagueId) {
      const standings = await prisma.table.findMany({
        where: { leagueId: parseInt(leagueId) },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              shortName: true,
              code: true,
              logoUrl: true,
              primaryColor: true,
            },
          },
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
        ],
      });

      // Add position/rank and next opponent to each team
      const standingsWithRank = await Promise.all(
        standings.map(async (standing, index) => {
          // Find next scheduled match for this team
          const nextMatch = await prisma.match.findFirst({
            where: {
              leagueId: parseInt(leagueId),
              status: 'SCHEDULED',
              OR: [
                { homeTeamId: standing.teamId },
                { awayTeamId: standing.teamId },
              ],
            },
            orderBy: {
              matchDate: 'asc',
            },
            select: {
              homeTeamId: true,
              awayTeamId: true,
              homeTeam: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  code: true,
                  logoUrl: true,
                  primaryColor: true,
                },
              },
              awayTeam: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  code: true,
                  logoUrl: true,
                  primaryColor: true,
                },
              },
            },
          });

          const nextOpponent = nextMatch
            ? nextMatch.homeTeamId === standing.teamId
              ? nextMatch.awayTeam
              : nextMatch.homeTeam
            : null;

          return {
            ...standing,
            position: index + 1,
            nextOpponent,
          };
        })
      );

      return NextResponse.json(
        {
          success: true,
          data: standingsWithRank,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          },
        }
      );
    }

    // Otherwise, return all leagues with their standings
    const leagues = await prisma.league.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        country: true,
        season: true,
        logoUrl: true,
      },
    });

    // Get all standings for all leagues at once
    const allStandings = await prisma.table.findMany({
      where: {
        leagueId: {
          in: leagues.map((l) => l.id),
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
      orderBy: [
        { leagueId: 'asc' },
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' },
      ],
    });

    // Fetch all next scheduled matches at once to avoid connection pool exhaustion
    const allNextMatches = await prisma.match.findMany({
      where: {
        leagueId: {
          in: leagues.map((l) => l.id),
        },
        status: 'SCHEDULED',
      },
      orderBy: {
        matchDate: 'asc',
      },
      select: {
        id: true,
        leagueId: true,
        homeTeamId: true,
        awayTeamId: true,
        matchDate: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    // Group standings by league and add next opponent
    const standingsByLeague = leagues.map((league) => {
      const leagueStandings = allStandings.filter((s) => s.leagueId === league.id);

      const standingsWithNext = leagueStandings.map((standing, index) => {
        // Find next scheduled match for this team from the pre-fetched matches
        const nextMatch = allNextMatches.find(
          (match) =>
            match.leagueId === league.id &&
            (match.homeTeamId === standing.teamId || match.awayTeamId === standing.teamId)
        );

        const nextOpponent = nextMatch
          ? nextMatch.homeTeamId === standing.teamId
            ? nextMatch.awayTeam
            : nextMatch.homeTeam
          : null;

        return {
          ...standing,
          position: index + 1,
          nextOpponent,
        };
      });

      return {
        league,
        standings: standingsWithNext,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: standingsByLeague,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch standings',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
