import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LeagueData {
  name: string;
  code: string;
  country: string;
  logoUrl: string;
  season: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
}

interface SeedData {
  leagues: LeagueData[];
}

export class LeagueSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/leagues.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedLeagues() {
    console.log('\n🏆 Creating leagues...');

    const leagues = await Promise.all(
      this.data.leagues.map((leagueData) =>
        prisma.league.create({
          data: {
            name: leagueData.name,
            code: leagueData.code,
            country: leagueData.country,
            logoUrl: leagueData.logoUrl,
            season: leagueData.season,
            startDate: new Date(leagueData.startDate),
            endDate: new Date(leagueData.endDate),
            isActive: leagueData.isActive,
            priority: leagueData.priority,
          },
        })
      )
    );

    console.log(`✅ Created ${leagues.length} leagues`);

    return {
      premierLeague: leagues[0],
      laLiga: leagues[1],
      bundesliga: leagues[2],
    };
  }
}
