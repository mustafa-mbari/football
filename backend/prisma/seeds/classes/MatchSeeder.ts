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
  htHome?: number;
  htAway?: number;
  minute?: number;
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
    teams: any[],
    roundPrefix: string
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
            round: `${roundPrefix} ${match.week}`,
            status: match.status as any,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            homeHalfTimeScore: match.htHome,
            awayHalfTimeScore: match.htAway,
            minute: match.minute,
            venue: homeTeam.stadiumName,
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
      plTeams,
      'Matchweek'
    );

    // La Liga Matches
    const createdLaLigaMatches = await this.createMatches(
      this.data.laLiga,
      laLiga.id,
      laLigaTeams,
      'Jornada'
    );

    // Bundesliga Matches
    const createdBundesligaMatches = await this.createMatches(
      this.data.bundesliga,
      bundesliga.id,
      bundesligaTeams,
      'Spieltag'
    );

    const allMatches = [
      ...createdPLMatches,
      ...createdLaLigaMatches,
      ...createdBundesligaMatches,
    ];

    console.log(`✅ Created ${allMatches.length} matches`);
    return allMatches;
  }

  async seedMatchEvents(matches: any[]) {
    console.log('\n⚡ Creating match events...');

    const finishedMatches = matches.filter((m) => m.status === 'FINISHED');
    let eventCount = 0;

    for (const match of finishedMatches.slice(0, 5)) {
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;

      // Create goal events for home team
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

      // Create goal events for away team
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
}
