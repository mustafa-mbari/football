import { PrismaClient, GameWeekStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class GameWeekSeeder {
  async seedGameWeeks() {
    console.log('📅 Creating gameweeks...');

    try {
      // Get all leagues
      const leagues = await prisma.league.findMany({
        include: { teams: true },
      });

      for (const league of leagues) {
        // Determine number of gameweeks based on number of teams
        // 20 teams = 38 gameweeks, 18 teams = 34 gameweeks
        const numTeams = league.teams.length;
        const numGameWeeks = (numTeams - 1) * 2; // Each team plays each other twice

        // Season start and end dates
        const seasonStart = new Date(league.startDate);
        const seasonEnd = new Date(league.endDate);

        // Calculate approximate duration per gameweek
        const totalDays = Math.floor(
          (seasonEnd.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysPerWeek = Math.floor(totalDays / numGameWeeks);

        console.log(`  Creating ${numGameWeeks} gameweeks for ${league.name}...`);

        for (let weekNum = 1; weekNum <= numGameWeeks; weekNum++) {
          // Calculate start and end dates for this gameweek
          const startDate = new Date(seasonStart);
          startDate.setDate(startDate.getDate() + (weekNum - 1) * daysPerWeek);

          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysPerWeek - 1);

          // Determine status based on dates
          const now = new Date();
          let status: GameWeekStatus = GameWeekStatus.SCHEDULED;
          let isCurrent = false;

          if (now >= startDate && now <= endDate) {
            status = GameWeekStatus.IN_PROGRESS;
            isCurrent = true;
          } else if (now > endDate) {
            status = GameWeekStatus.COMPLETED;
          }

          await prisma.gameWeek.create({
            data: {
              leagueId: league.id,
              weekNumber: weekNum,
              startDate,
              endDate,
              status,
              isCurrent,
            },
          });
        }

        console.log(`  ✅ Created ${numGameWeeks} gameweeks for ${league.name}`);
      }

      // Get count of all gameweeks
      const totalGameWeeks = await prisma.gameWeek.count();
      console.log(`✅ Created ${totalGameWeeks} gameweeks total\n`);

      return totalGameWeeks;
    } catch (error) {
      console.error('❌ Error seeding gameweeks:', error);
      throw error;
    }
  }

  async seedTeamGameWeekStats() {
    console.log('📊 Creating team gameweek stats...');

    try {
      const gameWeeks = await prisma.gameWeek.findMany({
        include: {
          league: {
            include: { teams: true },
          },
        },
      });

      let statsCount = 0;

      for (const gameWeek of gameWeeks) {
        // Create stats entry for each team in the league
        for (const team of gameWeek.league.teams) {
          await prisma.teamGameWeekStats.create({
            data: {
              gameWeekId: gameWeek.id,
              teamId: team.id,
              matchesPlayed: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
              result: null,
            },
          });
          statsCount++;
        }
      }

      console.log(`✅ Created ${statsCount} team gameweek stats entries\n`);
      return statsCount;
    } catch (error) {
      console.error('❌ Error seeding team gameweek stats:', error);
      throw error;
    }
  }

  async seedTableSnapshots() {
    console.log('📸 Creating table snapshots...');

    try {
      // For now, just create empty snapshots for completed gameweeks
      // In production, these would be populated when matches are finalized
      const completedGameWeeks = await prisma.gameWeek.findMany({
        where: { status: GameWeekStatus.COMPLETED },
        include: {
          league: {
            include: { teams: true },
          },
        },
      });

      let snapshotCount = 0;

      for (const gameWeek of completedGameWeeks) {
        for (let position = 1; position <= gameWeek.league.teams.length; position++) {
          const team = gameWeek.league.teams[position - 1];

          await prisma.tableSnapshot.create({
            data: {
              gameWeekId: gameWeek.id,
              teamId: team.id,
              position,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
              form: null,
            },
          });
          snapshotCount++;
        }
      }

      console.log(`✅ Created ${snapshotCount} table snapshots\n`);
      return snapshotCount;
    } catch (error) {
      console.error('❌ Error seeding table snapshots:', error);
      throw error;
    }
  }
}
