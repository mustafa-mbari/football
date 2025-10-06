import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PredictionSeeder {
  async seedPredictions(users: any[], matches: any[]) {
    console.log('\n🔮 Creating predictions...');

    const matchesForPrediction = matches.filter(
      (m) => m.status === 'FINISHED' || m.status === 'LIVE'
    );
    let predictionCount = 0;

    for (const match of matchesForPrediction) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const accuracy = user.predictionAccuracy / 100;

        let predHome: number, predAway: number;

        // Generate predictions based on user accuracy
        if (
          Math.random() < accuracy &&
          match.homeScore !== null &&
          match.awayScore !== null
        ) {
          predHome =
            match.homeScore +
            (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
          predAway =
            match.awayScore +
            (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
          predHome = Math.max(0, predHome);
          predAway = Math.max(0, predAway);
        } else {
          predHome = Math.floor(Math.random() * 4);
          predAway = Math.floor(Math.random() * 4);
        }

        const predictedResult =
          predHome > predAway
            ? 'WIN_HOME'
            : predHome < predAway
            ? 'WIN_AWAY'
            : 'DRAW';

        const actualResult =
          match.homeScore! > match.awayScore!
            ? 'WIN_HOME'
            : match.homeScore! < match.awayScore!
            ? 'WIN_AWAY'
            : 'DRAW';

        const isExactScore =
          match.status === 'FINISHED' &&
          predHome === match.homeScore &&
          predAway === match.awayScore;

        const isCorrectResult =
          match.status === 'FINISHED' && predictedResult === actualResult;

        const scorePoints = isExactScore ? 10 : 0;
        const resultPoints = isCorrectResult ? 3 : 0;
        const bonusPoints = isExactScore ? 2 : 0;

        await prisma.prediction.create({
          data: {
            userId: user.id,
            matchId: match.id,
            predictedHomeScore: predHome,
            predictedAwayScore: predAway,
            predictedResult: predictedResult as any,
            confidence: 50 + Math.floor(Math.random() * 50),
            scorePoints,
            resultPoints,
            bonusPoints,
            totalPoints: scorePoints + resultPoints + bonusPoints,
            isProcessed: match.status === 'FINISHED',
          },
        });
        predictionCount++;
      }
    }

    console.log(`✅ Created ${predictionCount} predictions`);
  }

  async seedStandings(leagues: any, teams: any) {
    console.log('\n📊 Creating standings...');

    const generateStandings = (teamsList: any[], leagueId: number) => {
      const standings = [];
      const totalTeams = teamsList.length;

      for (let i = 0; i < totalTeams; i++) {
        const position = i + 1;
        const played = 5;

        let won: number, drawn: number, lost: number, gf: number, ga: number;

        if (position <= 4) {
          // Top 4 teams
          won = 4 - Math.floor(Math.random() * 2);
          drawn = Math.floor(Math.random() * 2);
          lost = played - won - drawn;
          gf = 10 + Math.floor(Math.random() * 5);
          ga = 3 + Math.floor(Math.random() * 3);
        } else if (position <= totalTeams - 3) {
          // Mid-table teams
          won = 2 + Math.floor(Math.random() * 2);
          drawn = 1 + Math.floor(Math.random() * 2);
          lost = played - won - drawn;
          gf = 6 + Math.floor(Math.random() * 4);
          ga = 6 + Math.floor(Math.random() * 4);
        } else {
          // Bottom 3 teams
          won = Math.floor(Math.random() * 2);
          drawn = Math.floor(Math.random() * 2);
          lost = played - won - drawn;
          gf = 2 + Math.floor(Math.random() * 4);
          ga = 8 + Math.floor(Math.random() * 5);
        }

        // Generate form (last 5 matches)
        const formResults = [];
        for (let j = 0; j < 5; j++) {
          const rand = Math.random();
          if (position <= 4) {
            formResults.push(rand < 0.7 ? 'W' : rand < 0.9 ? 'D' : 'L');
          } else if (position <= totalTeams - 3) {
            formResults.push(rand < 0.4 ? 'W' : rand < 0.7 ? 'D' : 'L');
          } else {
            formResults.push(rand < 0.2 ? 'W' : rand < 0.4 ? 'D' : 'L');
          }
        }

        standings.push({
          team: teamsList[i],
          position,
          played,
          won,
          drawn,
          lost,
          gf,
          ga,
          form: formResults.join(''),
        });
      }

      // Sort by points, then goal difference
      standings.sort((a, b) => {
        const pointsA = a.won * 3 + a.drawn;
        const pointsB = b.won * 3 + b.drawn;
        if (pointsA !== pointsB) return pointsB - pointsA;
        const gdA = a.gf - a.ga;
        const gdB = b.gf - b.ga;
        return gdB - gdA;
      });

      // Update positions after sorting
      standings.forEach((s, idx) => (s.position = idx + 1));

      return standings;
    };

    // Generate standings for all three leagues
    const plStandings = generateStandings(teams.plTeams, leagues.premierLeague.id);
    const laLigaStandings = generateStandings(
      teams.laLigaTeams,
      leagues.laLiga.id
    );
    const bundesligaStandings = generateStandings(
      teams.bundesligaTeams,
      leagues.bundesliga.id
    );

    let totalCount = 0;

    // Create Premier League standings
    for (const standing of plStandings) {
      await prisma.standing.create({
        data: {
          leagueId: leagues.premierLeague.id,
          teamId: standing.team.id,
          position: standing.position,
          played: standing.played,
          won: standing.won,
          drawn: standing.drawn,
          lost: standing.lost,
          goalsFor: standing.gf,
          goalsAgainst: standing.ga,
          goalDifference: standing.gf - standing.ga,
          points: standing.won * 3 + standing.drawn,
          form: standing.form,
        },
      });
      totalCount++;
    }

    // Create La Liga standings
    for (const standing of laLigaStandings) {
      await prisma.standing.create({
        data: {
          leagueId: leagues.laLiga.id,
          teamId: standing.team.id,
          position: standing.position,
          played: standing.played,
          won: standing.won,
          drawn: standing.drawn,
          lost: standing.lost,
          goalsFor: standing.gf,
          goalsAgainst: standing.ga,
          goalDifference: standing.gf - standing.ga,
          points: standing.won * 3 + standing.drawn,
          form: standing.form,
        },
      });
      totalCount++;
    }

    // Create Bundesliga standings
    for (const standing of bundesligaStandings) {
      await prisma.standing.create({
        data: {
          leagueId: leagues.bundesliga.id,
          teamId: standing.team.id,
          position: standing.position,
          played: standing.played,
          won: standing.won,
          drawn: standing.drawn,
          lost: standing.lost,
          goalsFor: standing.gf,
          goalsAgainst: standing.ga,
          goalDifference: standing.gf - standing.ga,
          points: standing.won * 3 + standing.drawn,
          form: standing.form,
        },
      });
      totalCount++;
    }

    console.log(
      `✅ Created ${totalCount} standings entries (PL: ${plStandings.length}, La Liga: ${laLigaStandings.length}, Bundesliga: ${bundesligaStandings.length})`
    );
  }
}
