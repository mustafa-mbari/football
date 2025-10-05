import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Premier League
  const premierLeague = await prisma.league.create({
    data: {
      name: 'Premier League',
      country: 'England',
      season: '2025/26',
      logoUrl: 'https://resources.premierleague.com/premierleague/badges/t3.svg'
    }
  });
  console.log('✅ Created Premier League');

  // Premier League Teams
  const plTeams = [
    'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford', 'Brighton & Hove Albion',
    'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
    'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
    'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
  ];

  const createdPLTeams = [];
  for (const teamName of plTeams) {
    const team = await prisma.team.create({
      data: {
        name: teamName,
        leagueId: premierLeague.id
      }
    });
    createdPLTeams.push(team);
  }
  console.log(`✅ Created ${createdPLTeams.length} Premier League teams`);

  // Helper function to get dates for next 4 weeks
  const getUpcomingDate = (daysFromNow: number, hour: number = 15) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  // Create Premier League matches for next 4 weeks
  const plMatches = [
    // Week 1 - This weekend (Saturday)
    { home: 'Liverpool', away: 'AFC Bournemouth', date: getUpcomingDate(2, 12), round: 'Matchweek 1' },
    { home: 'Aston Villa', away: 'Newcastle United', date: getUpcomingDate(2, 15), round: 'Matchweek 1' },
    { home: 'Manchester United', away: 'Arsenal', date: getUpcomingDate(3, 16), round: 'Matchweek 1' },
    { home: 'Chelsea', away: 'Manchester City', date: getUpcomingDate(2, 17), round: 'Matchweek 1' },
    { home: 'Tottenham Hotspur', away: 'Everton', date: getUpcomingDate(2, 15), round: 'Matchweek 1' },
    { home: 'West Ham United', away: 'Sunderland', date: getUpcomingDate(2, 15), round: 'Matchweek 1' },
    { home: 'Brentford', away: 'Crystal Palace', date: getUpcomingDate(2, 15), round: 'Matchweek 1' },
    { home: 'Burnley', away: 'Fulham', date: getUpcomingDate(2, 15), round: 'Matchweek 1' },

    // Week 2 - Next weekend
    { home: 'Arsenal', away: 'Leeds United', date: getUpcomingDate(9, 12), round: 'Matchweek 2' },
    { home: 'Manchester City', away: 'Liverpool', date: getUpcomingDate(9, 17), round: 'Matchweek 2' },
    { home: 'Brighton & Hove Albion', away: 'Manchester United', date: getUpcomingDate(10, 16), round: 'Matchweek 2' },
    { home: 'Newcastle United', away: 'Chelsea', date: getUpcomingDate(9, 15), round: 'Matchweek 2' },
    { home: 'AFC Bournemouth', away: 'Tottenham Hotspur', date: getUpcomingDate(9, 15), round: 'Matchweek 2' },
    { home: 'Leeds United', away: 'West Ham United', date: getUpcomingDate(9, 15), round: 'Matchweek 2' },

    // Week 3
    { home: 'Liverpool', away: 'Chelsea', date: getUpcomingDate(16, 12), round: 'Matchweek 3' },
    { home: 'Arsenal', away: 'Manchester City', date: getUpcomingDate(16, 17), round: 'Matchweek 3' },
    { home: 'Manchester United', away: 'Tottenham Hotspur', date: getUpcomingDate(17, 16), round: 'Matchweek 3' },
    { home: 'Newcastle United', away: 'Brighton & Hove Albion', date: getUpcomingDate(16, 15), round: 'Matchweek 3' },
    { home: 'Everton', away: 'Aston Villa', date: getUpcomingDate(16, 15), round: 'Matchweek 3' },

    // Week 4
    { home: 'Manchester City', away: 'Manchester United', date: getUpcomingDate(23, 12), round: 'Matchweek 4' },
    { home: 'Chelsea', away: 'Arsenal', date: getUpcomingDate(23, 16), round: 'Matchweek 4' },
    { home: 'Tottenham Hotspur', away: 'Liverpool', date: getUpcomingDate(24, 16), round: 'Matchweek 4' },
    { home: 'Brighton & Hove Albion', away: 'Newcastle United', date: getUpcomingDate(23, 15), round: 'Matchweek 4' },
    { home: 'Aston Villa', away: 'Everton', date: getUpcomingDate(23, 15), round: 'Matchweek 4' }
  ];

  for (const match of plMatches) {
    const homeTeam = createdPLTeams.find(t => t.name === match.home);
    const awayTeam = createdPLTeams.find(t => t.name === match.away);
    if (homeTeam && awayTeam) {
      await prisma.match.create({
        data: {
          leagueId: premierLeague.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: match.date,
          round: match.round,
          status: match.date < new Date() ? 'finished' : 'scheduled'
        }
      });
    }
  }
  console.log(`✅ Created ${plMatches.length} Premier League matches`);

  // Create Bundesliga
  const bundesliga = await prisma.league.create({
    data: {
      name: 'Bundesliga',
      country: 'Germany',
      season: '2025/26',
      logoUrl: 'https://tmssl.akamaized.net/images/logo/normal/bundesliga.png'
    }
  });
  console.log('✅ Created Bundesliga');

  // Bundesliga Teams
  const blTeams = [
    'Bayern Munich', 'RB Leipzig', 'Bayer Leverkusen', 'Borussia Dortmund', 'Eintracht Frankfurt',
    'VfB Stuttgart', 'Borussia Mönchengladbach', 'TSG Hoffenheim', 'SC Freiburg', 'VfL Wolfsburg',
    'Werder Bremen', '1. FC Heidenheim', '1. FC Union Berlin', 'FC St. Pauli', 'FC Augsburg',
    'FSV Mainz 05', 'Hamburger SV', '1. FC Köln'
  ];

  const createdBLTeams = [];
  for (const teamName of blTeams) {
    const team = await prisma.team.create({
      data: {
        name: teamName,
        leagueId: bundesliga.id
      }
    });
    createdBLTeams.push(team);
  }
  console.log(`✅ Created ${createdBLTeams.length} Bundesliga teams`);

  // Create Bundesliga matches for next 4 weeks
  const blMatches = [
    // Week 1
    { home: 'Bayern Munich', away: 'RB Leipzig', date: getUpcomingDate(1, 18), round: 'Matchday 1' },
    { home: 'Borussia Dortmund', away: 'Bayer Leverkusen', date: getUpcomingDate(2, 15), round: 'Matchday 1' },
    { home: 'VfB Stuttgart', away: 'Eintracht Frankfurt', date: getUpcomingDate(2, 15), round: 'Matchday 1' },
    { home: 'Borussia Mönchengladbach', away: 'VfL Wolfsburg', date: getUpcomingDate(2, 15), round: 'Matchday 1' },
    { home: 'SC Freiburg', away: 'TSG Hoffenheim', date: getUpcomingDate(2, 15), round: 'Matchday 1' },

    // Week 2
    { home: 'RB Leipzig', away: 'Borussia Dortmund', date: getUpcomingDate(8, 18), round: 'Matchday 2' },
    { home: 'Bayer Leverkusen', away: 'Bayern Munich', date: getUpcomingDate(9, 15), round: 'Matchday 2' },
    { home: 'Eintracht Frankfurt', away: 'VfB Stuttgart', date: getUpcomingDate(9, 15), round: 'Matchday 2' },
    { home: 'VfL Wolfsburg', away: 'Borussia Mönchengladbach', date: getUpcomingDate(9, 15), round: 'Matchday 2' },

    // Week 3
    { home: 'Bayern Munich', away: 'Borussia Dortmund', date: getUpcomingDate(15, 18), round: 'Matchday 3' },
    { home: 'RB Leipzig', away: 'Bayer Leverkusen', date: getUpcomingDate(16, 15), round: 'Matchday 3' },
    { home: 'VfB Stuttgart', away: 'VfL Wolfsburg', date: getUpcomingDate(16, 15), round: 'Matchday 3' },

    // Week 4
    { home: 'Borussia Dortmund', away: 'Bayern Munich', date: getUpcomingDate(22, 18), round: 'Matchday 4' },
    { home: 'Bayer Leverkusen', away: 'RB Leipzig', date: getUpcomingDate(23, 15), round: 'Matchday 4' },
    { home: 'Eintracht Frankfurt', away: 'Borussia Mönchengladbach', date: getUpcomingDate(23, 15), round: 'Matchday 4' }
  ];

  for (const match of blMatches) {
    const homeTeam = createdBLTeams.find(t => t.name === match.home);
    const awayTeam = createdBLTeams.find(t => t.name === match.away);
    if (homeTeam && awayTeam) {
      await prisma.match.create({
        data: {
          leagueId: bundesliga.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: match.date,
          round: match.round,
          status: match.date < new Date() ? 'finished' : 'scheduled'
        }
      });
    }
  }
  console.log(`✅ Created ${blMatches.length} Bundesliga matches`);

  // Create La Liga
  const laLiga = await prisma.league.create({
    data: {
      name: 'La Liga',
      country: 'Spain',
      season: '2025/26',
      logoUrl: 'https://tmssl.akamaized.net/images/logo/normal/laliga.png'
    }
  });
  console.log('✅ Created La Liga');

  // La Liga Teams
  const llTeams = [
    'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Bilbao', 'Real Sociedad',
    'Villarreal', 'Real Betis', 'Sevilla', 'Valencia', 'Girona',
    'Real Mallorca', 'Getafe', 'Celta Vigo', 'Osasuna', 'Rayo Vallecano',
    'Alavés', 'Espanyol', 'Levante', 'Elche', 'Real Oviedo'
  ];

  const createdLLTeams = [];
  for (const teamName of llTeams) {
    const team = await prisma.team.create({
      data: {
        name: teamName,
        leagueId: laLiga.id
      }
    });
    createdLLTeams.push(team);
  }
  console.log(`✅ Created ${createdLLTeams.length} La Liga teams`);

  // Create La Liga matches for next 4 weeks
  const llMatches = [
    // Week 1
    { home: 'Real Madrid', away: 'FC Barcelona', date: getUpcomingDate(3, 20), round: 'Matchweek 1' },
    { home: 'Atlético Madrid', away: 'Sevilla', date: getUpcomingDate(2, 18), round: 'Matchweek 1' },
    { home: 'Athletic Bilbao', away: 'Villarreal', date: getUpcomingDate(2, 16), round: 'Matchweek 1' },
    { home: 'Real Sociedad', away: 'Valencia', date: getUpcomingDate(2, 14), round: 'Matchweek 1' },
    { home: 'Real Betis', away: 'Girona', date: getUpcomingDate(2, 16), round: 'Matchweek 1' },

    // Week 2
    { home: 'FC Barcelona', away: 'Atlético Madrid', date: getUpcomingDate(10, 20), round: 'Matchweek 2' },
    { home: 'Sevilla', away: 'Real Madrid', date: getUpcomingDate(9, 18), round: 'Matchweek 2' },
    { home: 'Valencia', away: 'Athletic Bilbao', date: getUpcomingDate(9, 16), round: 'Matchweek 2' },
    { home: 'Villarreal', away: 'Real Sociedad', date: getUpcomingDate(9, 14), round: 'Matchweek 2' },

    // Week 3
    { home: 'Real Madrid', away: 'Atlético Madrid', date: getUpcomingDate(17, 20), round: 'Matchweek 3' },
    { home: 'FC Barcelona', away: 'Sevilla', date: getUpcomingDate(16, 18), round: 'Matchweek 3' },
    { home: 'Athletic Bilbao', away: 'Real Sociedad', date: getUpcomingDate(16, 16), round: 'Matchweek 3' },
    { home: 'Valencia', away: 'Real Betis', date: getUpcomingDate(16, 14), round: 'Matchweek 3' },

    // Week 4
    { home: 'Atlético Madrid', away: 'FC Barcelona', date: getUpcomingDate(24, 20), round: 'Matchweek 4' },
    { home: 'Real Madrid', away: 'Valencia', date: getUpcomingDate(23, 18), round: 'Matchweek 4' },
    { home: 'Sevilla', away: 'Athletic Bilbao', date: getUpcomingDate(23, 16), round: 'Matchweek 4' },
    { home: 'Real Sociedad', away: 'Villarreal', date: getUpcomingDate(23, 14), round: 'Matchweek 4' }
  ];

  for (const match of llMatches) {
    const homeTeam = createdLLTeams.find(t => t.name === match.home);
    const awayTeam = createdLLTeams.find(t => t.name === match.away);
    if (homeTeam && awayTeam) {
      await prisma.match.create({
        data: {
          leagueId: laLiga.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          matchDate: match.date,
          round: match.round,
          status: match.date < new Date() ? 'finished' : 'scheduled'
        }
      });
    }
  }
  console.log(`✅ Created ${llMatches.length} La Liga matches`);

  // Create some test users
  const bcrypt = require('bcrypt');
  const testUsers = [
    { email: 'john@example.com', username: 'john_doe', password: await bcrypt.hash('password123', 10) },
    { email: 'jane@example.com', username: 'jane_smith', password: await bcrypt.hash('password123', 10) },
    { email: 'bob@example.com', username: 'bob_wilson', password: await bcrypt.hash('password123', 10) }
  ];

  for (const userData of testUsers) {
    await prisma.user.create({ data: userData });
  }
  console.log(`✅ Created ${testUsers.length} test users`);

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - 3 Leagues (Premier League, Bundesliga, La Liga)`);
  console.log(`   - ${createdPLTeams.length + createdBLTeams.length + createdLLTeams.length} Teams`);
  console.log(`   - ${plMatches.length + blMatches.length + llMatches.length} Matches`);
  console.log(`   - ${testUsers.length} Test users`);
  console.log('\nTest user credentials:');
  console.log('   Email: john@example.com | Password: password123');
  console.log('   Email: jane@example.com | Password: password123');
  console.log('   Email: bob@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
