import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getDate = (daysOffset: number, hour: number = 15) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, 0, 0, 0);
  return date;
};

export async function seedMatches(leagues: any, teams: any) {
  console.log('\n📅 Creating matches...');

  const { premierLeague, laLiga, bundesliga } = leagues;
  const { plTeams, laLigaTeams, bundesligaTeams } = teams;

  // Premier League Matches
  const plMatches = [
    // Empty - no seed data
  ];

  const createdPLMatches = await Promise.all(
    plMatches.map((match) =>
      prisma.match.create({
        data: {
          leagueId: premierLeague.id,
          homeTeamId: match.home.id,
          awayTeamId: match.away.id,
          matchDate: match.date,
          weekNumber: match.week,
          status: match.status as any,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          isPredictionLocked: match.status !== 'SCHEDULED',
        },
      })
    )
  );

  // La Liga Matches
  const laLigaMatches = [
    // Empty - no seed data
  ];

  const createdLaLigaMatches = await Promise.all(
    laLigaMatches.map((match) =>
      prisma.match.create({
        data: {
          leagueId: laLiga.id,
          homeTeamId: match.home.id,
          awayTeamId: match.away.id,
          matchDate: match.date,
          weekNumber: match.week,
          status: match.status as any,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          isPredictionLocked: match.status !== 'SCHEDULED',
        },
      })
    )
  );

  // Bundesliga Matches
  const bundesligaMatches = [
    // Empty - no seed data
  ];

  const createdBundesligaMatches = await Promise.all(
    bundesligaMatches.map((match) =>
      prisma.match.create({
        data: {
          leagueId: bundesliga.id,
          homeTeamId: match.home.id,
          awayTeamId: match.away.id,
          matchDate: match.date,
          weekNumber: match.week,
          status: match.status as any,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          isPredictionLocked: match.status !== 'SCHEDULED',
        },
      })
    )
  );

  const allMatches = [...createdPLMatches, ...createdLaLigaMatches, ...createdBundesligaMatches];
  console.log(`✅ Created ${allMatches.length} matches`);
  return allMatches;
}

