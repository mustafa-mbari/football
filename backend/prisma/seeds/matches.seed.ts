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
    // Finished matches (past week)
    { home: plTeams[0], away: plTeams[4], date: getDate(-5, 15), status: 'FINISHED', homeScore: 2, awayScore: 1, htHome: 1, htAway: 0, week: 1 },
    { home: plTeams[1], away: plTeams[3], date: getDate(-5, 17), status: 'FINISHED', homeScore: 3, awayScore: 1, htHome: 2, htAway: 1, week: 1 },
    { home: plTeams[2], away: plTeams[5], date: getDate(-4, 12), status: 'FINISHED', homeScore: 1, awayScore: 1, htHome: 0, htAway: 1, week: 1 },
    { home: plTeams[6], away: plTeams[7], date: getDate(-4, 15), status: 'FINISHED', homeScore: 2, awayScore: 0, htHome: 1, htAway: 0, week: 1 },
    { home: plTeams[8], away: plTeams[9], date: getDate(-3, 15), status: 'FINISHED', homeScore: 1, awayScore: 2, htHome: 0, htAway: 1, week: 1 },

    // Live match (happening now)
    { home: plTeams[3], away: plTeams[2], date: getDate(0, new Date().getHours()), status: 'LIVE', homeScore: 1, awayScore: 0, htHome: 0, htAway: 0, minute: 67, week: 2 },

    // Scheduled matches (upcoming)
    { home: plTeams[4], away: plTeams[1], date: getDate(1, 17), status: 'SCHEDULED', week: 2 },
    { home: plTeams[5], away: plTeams[0], date: getDate(2, 12), status: 'SCHEDULED', week: 2 },
    { home: plTeams[7], away: plTeams[8], date: getDate(2, 15), status: 'SCHEDULED', week: 2 },
    { home: plTeams[9], away: plTeams[6], date: getDate(3, 16), status: 'SCHEDULED', week: 2 },
    { home: plTeams[0], away: plTeams[3], date: getDate(7, 12), status: 'SCHEDULED', week: 3 },
    { home: plTeams[1], away: plTeams[2], date: getDate(7, 17), status: 'SCHEDULED', week: 3 },
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
          round: `Matchweek ${match.week}`,
          status: match.status as any,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeHalfTimeScore: match.htHome,
          awayHalfTimeScore: match.htAway,
          minute: match.minute,
          venue: match.home.stadiumName,
          isPredictionLocked: match.status !== 'SCHEDULED',
        },
      })
    )
  );

  // La Liga Matches
  const laLigaMatches = [
    { home: laLigaTeams[0], away: laLigaTeams[1], date: getDate(-4, 20), status: 'FINISHED', homeScore: 2, awayScore: 1, htHome: 1, htAway: 0, week: 1 },
    { home: laLigaTeams[2], away: laLigaTeams[3], date: getDate(-3, 18), status: 'FINISHED', homeScore: 3, awayScore: 2, htHome: 2, htAway: 1, week: 1 },
    { home: laLigaTeams[4], away: laLigaTeams[5], date: getDate(-3, 16), status: 'FINISHED', homeScore: 0, awayScore: 0, htHome: 0, htAway: 0, week: 1 },
    { home: laLigaTeams[1], away: laLigaTeams[2], date: getDate(2, 20), status: 'SCHEDULED', week: 2 },
    { home: laLigaTeams[3], away: laLigaTeams[0], date: getDate(3, 18), status: 'SCHEDULED', week: 2 },
    { home: laLigaTeams[6], away: laLigaTeams[7], date: getDate(4, 16), status: 'SCHEDULED', week: 2 },
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
          round: `Jornada ${match.week}`,
          status: match.status as any,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeHalfTimeScore: match.htHome,
          awayHalfTimeScore: match.htAway,
          venue: match.home.stadiumName,
          isPredictionLocked: match.status !== 'SCHEDULED',
        },
      })
    )
  );

  // Bundesliga Matches
  const bundesligaMatches = [
    { home: bundesligaTeams[0], away: bundesligaTeams[1], date: getDate(-6, 18), status: 'FINISHED', homeScore: 4, awayScore: 2, htHome: 2, htAway: 1, week: 1 },
    { home: bundesligaTeams[2], away: bundesligaTeams[3], date: getDate(-5, 15), status: 'FINISHED', homeScore: 1, awayScore: 3, htHome: 0, htAway: 2, week: 1 },
    { home: bundesligaTeams[4], away: bundesligaTeams[5], date: getDate(1, 18), status: 'SCHEDULED', week: 2 },
    { home: bundesligaTeams[6], away: bundesligaTeams[7], date: getDate(2, 15), status: 'SCHEDULED', week: 2 },
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
          round: `Spieltag ${match.week}`,
          status: match.status as any,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeHalfTimeScore: match.htHome,
          awayHalfTimeScore: match.htAway,
          venue: match.home.stadiumName,
          isPredictionLocked: match.status !== 'SCHEDULED',
        },
      })
    )
  );

  const allMatches = [...createdPLMatches, ...createdLaLigaMatches, ...createdBundesligaMatches];
  console.log(`✅ Created ${allMatches.length} matches`);
  return allMatches;
}

export async function seedMatchEvents(matches: any[]) {
  console.log('\n⚡ Creating match events...');
  const finishedMatches = matches.filter(m => m.status === 'FINISHED');
  let eventCount = 0;

  for (const match of finishedMatches.slice(0, 5)) {
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;

    // Create goal events
    for (let i = 0; i < homeScore; i++) {
      await prisma.matchEvent.create({
        data: {
          matchId: match.id,
          type: 'GOAL',
          minute: 15 + i * 20,
          playerName: `Player ${i + 1}`,
          teamSide: 'HOME',
        },
      });
      eventCount++;
    }

    for (let i = 0; i < awayScore; i++) {
      await prisma.matchEvent.create({
        data: {
          matchId: match.id,
          type: 'GOAL',
          minute: 20 + i * 25,
          playerName: `Player ${i + 1}`,
          teamSide: 'AWAY',
        },
      });
      eventCount++;
    }
  }
  console.log(`✅ Created ${eventCount} match events`);
}
