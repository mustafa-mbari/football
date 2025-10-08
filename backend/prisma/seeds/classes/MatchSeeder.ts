import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MatchData {
  homeTeamIndex: number;
  awayTeamIndex: number;
  daysOffset: number;
  hour: number | string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  week: number;
}

interface SeedData {
  premierLeague: MatchData[];
  laLiga: MatchData[];
  bundesliga: MatchData[];
}

export class MatchSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/matches.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  private getDate(daysOffset: number, hour: number | string): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);

    if (hour === 'current') {
      // For live matches, use current hour
      date.setMinutes(0, 0, 0);
    } else {
      date.setHours(hour as number, 0, 0, 0);
    }

    return date;
  }

  private async createMatches(
    matchesData: MatchData[],
    leagueId: number,
    teams: any[]
  ) {
    return await Promise.all(
      matchesData.map((match) => {
        const matchDate = this.getDate(match.daysOffset, match.hour);
        const homeTeam = teams[match.homeTeamIndex];
        const awayTeam = teams[match.awayTeamIndex];

        return prisma.match.create({
          data: {
            leagueId,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            matchDate,
            weekNumber: match.week,
            status: match.status as any,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            isPredictionLocked: match.status !== 'SCHEDULED',
          },
        });
      })
    );
  }

  async seedMatches(leagues: any, teams: any) {
    console.log('\n📅 Creating matches...');

    const { premierLeague, laLiga, bundesliga } = leagues;
    const { plTeams, laLigaTeams, bundesligaTeams } = teams;

    // Premier League Matches
    const createdPLMatches = await this.createMatches(
      this.data.premierLeague,
      premierLeague.id,
      plTeams
    );

    // La Liga Matches
    const createdLaLigaMatches = await this.createMatches(
      this.data.laLiga,
      laLiga.id,
      laLigaTeams
    );

    // Bundesliga Matches
    const createdBundesligaMatches = await this.createMatches(
      this.data.bundesliga,
      bundesliga.id,
      bundesligaTeams
    );

    const allMatches = [
      ...createdPLMatches,
      ...createdLaLigaMatches,
      ...createdBundesligaMatches,
    ];

    console.log(`✅ Created ${allMatches.length} matches`);
    return allMatches;
  }

}
