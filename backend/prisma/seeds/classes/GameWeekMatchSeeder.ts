import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface GameWeekMatchData {
  gameWeekNumber: number;
  matchIndex: number;
  isSynced?: boolean;
}

interface SeedData {
  premierLeague: GameWeekMatchData[];
  laLiga: GameWeekMatchData[];
  bundesliga: GameWeekMatchData[];
}

export class GameWeekMatchSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/gameweek-matches.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  private async linkMatchesToGameWeeks(
    gameWeekMatchData: GameWeekMatchData[],
    matches: any[],
    leagueId: number
  ) {
    const gameWeeks = await prisma.gameWeek.findMany({
      where: { leagueId },
      orderBy: { weekNumber: 'asc' },
    });

    const created = [];

    for (const gwm of gameWeekMatchData) {
      const gameWeek = gameWeeks.find((gw) => gw.weekNumber === gwm.gameWeekNumber);
      const match = matches[gwm.matchIndex];

      if (gameWeek && match) {
        const gameWeekMatch = await prisma.gameWeekMatch.create({
          data: {
            gameWeekId: gameWeek.id,
            matchId: match.id,
            isSynced: gwm.isSynced || false,
          },
        });
        created.push(gameWeekMatch);
      }
    }

    return created;
  }

  async seedGameWeekMatches(leagues: any, matches: any) {
    console.log('\n🔗 Linking matches to gameweeks...');

    const { premierLeague, laLiga, bundesliga } = leagues;
    const plMatches = matches.filter((m: any) => m.leagueId === premierLeague.id);
    const laLigaMatches = matches.filter((m: any) => m.leagueId === laLiga.id);
    const bundesligaMatches = matches.filter((m: any) => m.leagueId === bundesliga.id);

    // Premier League GameWeek Matches
    const createdPL = await this.linkMatchesToGameWeeks(
      this.data.premierLeague,
      plMatches,
      premierLeague.id
    );

    // La Liga GameWeek Matches
    const createdLaLiga = await this.linkMatchesToGameWeeks(
      this.data.laLiga,
      laLigaMatches,
      laLiga.id
    );

    // Bundesliga GameWeek Matches
    const createdBundesliga = await this.linkMatchesToGameWeeks(
      this.data.bundesliga,
      bundesligaMatches,
      bundesliga.id
    );

    const allGameWeekMatches = [...createdPL, ...createdLaLiga, ...createdBundesliga];

    console.log(`✅ Created ${allGameWeekMatches.length} gameweek-match links`);
    return allGameWeekMatches;
  }
}
