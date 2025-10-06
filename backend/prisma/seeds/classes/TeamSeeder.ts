import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TeamData {
  name: string;
  code: string;
  stadium: string;
  founded: number;
  color: string;
  logo: string;
}

interface FavoriteTeamData {
  userIndex: number;
  leagueKey: string;
  teamIndex: number;
}

interface SeedData {
  premierLeague: TeamData[];
  laLiga: TeamData[];
  bundesliga: TeamData[];
  favoriteTeams: FavoriteTeamData[];
}

export class TeamSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/teams.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedTeams(leagues: any) {
    console.log('\n⚽ Creating teams...');

    // Premier League Teams
    const plTeams = await Promise.all(
      this.data.premierLeague.map((team) =>
        prisma.team.create({
          data: {
            name: team.name,
            shortName: team.name,
            code: team.code,
            logoUrl: team.logo,
            stadiumName: team.stadium,
            foundedYear: team.founded,
            primaryColor: team.color,
            leagueId: leagues.premierLeague.id,
          },
        })
      )
    );

    // La Liga Teams
    const laLigaTeams = await Promise.all(
      this.data.laLiga.map((team) =>
        prisma.team.create({
          data: {
            name: team.name,
            shortName: team.name,
            code: team.code,
            logoUrl: team.logo,
            stadiumName: team.stadium,
            foundedYear: team.founded,
            primaryColor: team.color,
            leagueId: leagues.laLiga.id,
          },
        })
      )
    );

    // Bundesliga Teams
    const bundesligaTeams = await Promise.all(
      this.data.bundesliga.map((team) =>
        prisma.team.create({
          data: {
            name: team.name,
            shortName: team.name,
            code: team.code,
            logoUrl: team.logo,
            stadiumName: team.stadium,
            foundedYear: team.founded,
            primaryColor: team.color,
            leagueId: leagues.bundesliga.id,
          },
        })
      )
    );

    console.log(
      `✅ Created ${plTeams.length + laLigaTeams.length + bundesligaTeams.length} teams`
    );

    return { plTeams, laLigaTeams, bundesligaTeams };
  }

  async seedFavoriteTeams(users: any[], teams: any) {
    console.log('\n❤️ Creating favorite teams...');

    const favoriteTeamsData = this.data.favoriteTeams.map((favorite) => {
      let teamId: number;

      if (favorite.leagueKey === 'premierLeague') {
        teamId = teams.plTeams[favorite.teamIndex].id;
      } else if (favorite.leagueKey === 'laLiga') {
        teamId = teams.laLigaTeams[favorite.teamIndex].id;
      } else {
        teamId = teams.bundesligaTeams[favorite.teamIndex].id;
      }

      return {
        userId: users[favorite.userIndex].id,
        teamId,
      };
    });

    await prisma.userFavoriteTeam.createMany({ data: favoriteTeamsData });
    console.log(`✅ Created ${favoriteTeamsData.length} favorite team relationships`);
  }
}
