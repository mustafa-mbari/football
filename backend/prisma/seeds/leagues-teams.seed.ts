import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLeagues() {
  console.log('\n🏆 Creating leagues...');

  const premierLeague = await prisma.league.create({
    data: {
      name: 'Premier League',
      code: 'EPL',
      country: 'England',
      logoUrl: 'https://resources.premierleague.com/premierleague/badges/rb/t3.svg',
      season: '2025/26',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-05-24'),
      isActive: true,
      priority: 1,
    },
  });

  const laLiga = await prisma.league.create({
    data: {
      name: 'La Liga',
      code: 'LALIGA',
      country: 'Spain',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga_EA_Sports_2023_Vertical_Logo.svg/223px-LaLiga_EA_Sports_2023_Vertical_Logo.svg.svg',
      season: '2025/26',
      startDate: new Date('2025-08-14'),
      endDate: new Date('2026-05-24'),
      isActive: true,
      priority: 2,
    },
  });

  const bundesliga = await prisma.league.create({
    data: {
      name: 'Bundesliga',
      code: 'BL1',
      country: 'Germany',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/200px-Bundesliga_logo_%282017%29.svg.svg',
      season: '2025/26',
      startDate: new Date('2025-08-22'),
      endDate: new Date('2026-05-16'),
      isActive: true,
      priority: 3,
    },
  });

  console.log('✅ Created 3 leagues');
  return { premierLeague, laLiga, bundesliga };
}

export async function seedTeams(leagues: any) {
  console.log('\n⚽ Creating teams...');

  // Premier League Teams - All 20 teams for 2025/26 season
  // Promoted: Leeds United, Burnley, Sunderland
  // Relegated: Leicester City, Ipswich Town, Southampton
  const plTeamsData = [
    { name: 'Arsenal', code: 'ARS', stadium: 'Emirates Stadium', founded: 1886, color: '#EF0107', logo: '/logos/premier-league/arsenal.svg' },
    { name: 'Aston Villa', code: 'AVL', stadium: 'Villa Park', founded: 1874, color: '#95BFE5', logo: '/logos/premier-league/aston-villa.svg' },
    { name: 'Bournemouth', code: 'BOU', stadium: 'Vitality Stadium', founded: 1899, color: '#DA291C', logo: '/logos/premier-league/bournemouth.svg' },
    { name: 'Brentford', code: 'BRE', stadium: 'Gtech Community Stadium', founded: 1889, color: '#E30613', logo: '/logos/premier-league/brentford.svg' },
    { name: 'Brighton', code: 'BHA', stadium: 'Falmer Stadium', founded: 1901, color: '#0057B8', logo: '/logos/premier-league/brighton.svg' },
    { name: 'Burnley', code: 'BUR', stadium: 'Turf Moor', founded: 1882, color: '#6C1D45', logo: '/logos/premier-league/burnley.svg' },
    { name: 'Chelsea', code: 'CHE', stadium: 'Stamford Bridge', founded: 1905, color: '#034694', logo: '/logos/premier-league/chelsea.svg' },
    { name: 'Crystal Palace', code: 'CRY', stadium: 'Selhurst Park', founded: 1905, color: '#1B458F', logo: '/logos/premier-league/crystal-palace.svg' },
    { name: 'Everton', code: 'EVE', stadium: 'Goodison Park', founded: 1878, color: '#003399', logo: '/logos/premier-league/everton.svg' },
    { name: 'Fulham', code: 'FUL', stadium: 'Craven Cottage', founded: 1879, color: '#000000', logo: '/logos/premier-league/fulham.svg' },
    { name: 'Leeds United', code: 'LEE', stadium: 'Elland Road', founded: 1919, color: '#FFCD00', logo: '/logos/premier-league/leeds.svg' },
    { name: 'Liverpool', code: 'LIV', stadium: 'Anfield', founded: 1892, color: '#C8102E', logo: '/logos/premier-league/liverpool.svg' },
    { name: 'Manchester City', code: 'MCI', stadium: 'Etihad Stadium', founded: 1880, color: '#6CABDD', logo: '/logos/premier-league/man-city.svg' },
    { name: 'Manchester United', code: 'MUN', stadium: 'Old Trafford', founded: 1878, color: '#DA291C', logo: '/logos/premier-league/man-united.svg' },
    { name: 'Newcastle United', code: 'NEW', stadium: 'St. James\' Park', founded: 1892, color: '#241F20', logo: '/logos/premier-league/newcastle.svg' },
    { name: 'Nottingham Forest', code: 'NFO', stadium: 'City Ground', founded: 1865, color: '#DD0000', logo: '/logos/premier-league/nottingham-forest.svg' },
    { name: 'Sunderland', code: 'SUN', stadium: 'Stadium of Light', founded: 1879, color: '#EB172B', logo: '/logos/premier-league/sunderland.svg' },
    { name: 'Tottenham', code: 'TOT', stadium: 'Tottenham Hotspur Stadium', founded: 1882, color: '#132257', logo: '/logos/premier-league/tottenham.svg' },
    { name: 'West Ham', code: 'WHU', stadium: 'London Stadium', founded: 1895, color: '#7A263A', logo: '/logos/premier-league/west-ham.svg' },
    { name: 'Wolverhampton', code: 'WOL', stadium: 'Molineux Stadium', founded: 1877, color: '#FDB913', logo: '/logos/premier-league/wolves.svg' },
  ];

  const plTeams = await Promise.all(
    plTeamsData.map((team) =>
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

  // La Liga Teams - All 20 teams for 2025/26 season
  // Promoted: Levante, Elche, Oviedo
  // Relegated: Real Valladolid, Las Palmas, Leganés
  const laLigaTeamsData = [
    { name: 'Athletic Bilbao', code: 'ATH', stadium: 'San Mamés', founded: 1898, color: '#EE2523', logo: '/logos/la-liga/athletic-bilbao.svg' },
    { name: 'Atlético Madrid', code: 'ATM', stadium: 'Wanda Metropolitano', founded: 1903, color: '#CB3524', logo: '/logos/la-liga/atletico-madrid.png' },
    { name: 'Barcelona', code: 'BAR', stadium: 'Camp Nou', founded: 1899, color: '#004D98', logo: '/logos/la-liga/barcelona.svg' },
    { name: 'Celta Vigo', code: 'CEL', stadium: 'Balaídos', founded: 1923, color: '#7AC5CD', logo: '/logos/la-liga/celta-vigo.svg' },
    { name: 'Deportivo Alavés', code: 'ALA', stadium: 'Mendizorroza', founded: 1921, color: '#0E4C92', logo: '/logos/la-liga/alaves.png' },
    { name: 'Elche', code: 'ELC', stadium: 'Martínez Valero', founded: 1923, color: '#00814D', logo: '/logos/la-liga/elche.png' },
    { name: 'Espanyol', code: 'ESP', stadium: 'RCDE Stadium', founded: 1900, color: '#0E7EBE', logo: '/logos/la-liga/espanyol.png' },
    { name: 'Getafe', code: 'GET', stadium: 'Coliseum Alfonso Pérez', founded: 1983, color: '#005999', logo: '/logos/la-liga/getafe.png' },
    { name: 'Girona', code: 'GIR', stadium: 'Montilivi', founded: 1930, color: '#C7101F', logo: '/logos/la-liga/girona.png' },
    { name: 'Levante', code: 'LEV', stadium: 'Ciutat de València', founded: 1909, color: '#004F9E', logo: '/logos/la-liga/levante.png' },
    { name: 'Mallorca', code: 'MLL', stadium: 'Visit Mallorca Estadi', founded: 1916, color: '#E20613', logo: '/logos/la-liga/mallorca.png' },
    { name: 'Osasuna', code: 'OSA', stadium: 'El Sadar', founded: 1920, color: '#D81E05', logo: '/logos/la-liga/osasuna.png' },
    { name: 'Real Oviedo', code: 'OVI', stadium: 'Carlos Tartiere', founded: 1926, color: '#0064B0', logo: '/logos/la-liga/real-oviedo.png' },
    { name: 'Rayo Vallecano', code: 'RAY', stadium: 'Vallecas', founded: 1924, color: '#E62932', logo: '/logos/la-liga/rayo-vallecano.png' },
    { name: 'Real Betis', code: 'BET', stadium: 'Benito Villamarín', founded: 1907, color: '#00954C', logo: '/logos/la-liga/real-betis.svg' },
    { name: 'Real Madrid', code: 'RMA', stadium: 'Santiago Bernabéu', founded: 1902, color: '#FEBE10', logo: '/logos/la-liga/real-madrid.svg' },
    { name: 'Real Sociedad', code: 'RSO', stadium: 'Reale Arena', founded: 1909, color: '#0A3A82', logo: '/logos/la-liga/real-sociedad.svg' },
    { name: 'Sevilla', code: 'SEV', stadium: 'Ramón Sánchez Pizjuán', founded: 1890, color: '#F43333', logo: '/logos/la-liga/sevilla.svg' },
    { name: 'Valencia', code: 'VAL', stadium: 'Mestalla', founded: 1919, color: '#F77F00', logo: '/logos/la-liga/valencia.svg' },
    { name: 'Villarreal', code: 'VIL', stadium: 'Estadio de la Cerámica', founded: 1923, color: '#FFE667', logo: '/logos/la-liga/villarreal.png' },
  ];

  const laLigaTeams = await Promise.all(
    laLigaTeamsData.map((team) =>
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

  // Bundesliga Teams - All 18 teams for 2025/26 season
  // Promoted: Hamburger SV, 1. FC Köln
  // Relegated: Holstein Kiel, VfL Bochum
  const bundesligaTeamsData = [
    { name: 'FC Augsburg', code: 'AUG', stadium: 'WWK Arena', founded: 1907, color: '#BA3733', logo: '/logos/bundesliga/augsburg.png' },
    { name: 'Bayer Leverkusen', code: 'B04', stadium: 'BayArena', founded: 1904, color: '#E32221', logo: '/logos/bundesliga/leverkusen.svg' },
    { name: 'Bayern Munich', code: 'FCB', stadium: 'Allianz Arena', founded: 1900, color: '#DC052D', logo: '/logos/bundesliga/bayern.png' },
    { name: 'Borussia Dortmund', code: 'BVB', stadium: 'Signal Iduna Park', founded: 1909, color: '#FDE100', logo: '/logos/bundesliga/dortmund.svg' },
    { name: 'Borussia Mönchengladbach', code: 'BMG', stadium: 'Borussia-Park', founded: 1900, color: '#000000', logo: '/logos/bundesliga/gladbach.png' },
    { name: 'Eintracht Frankfurt', code: 'SGE', stadium: 'Deutsche Bank Park', founded: 1899, color: '#E1000F', logo: '/logos/bundesliga/frankfurt.png' },
    { name: 'SC Freiburg', code: 'SCF', stadium: 'Europa-Park Stadion', founded: 1904, color: '#E2001A', logo: '/logos/bundesliga/freiburg.png' },
    { name: 'Hamburger SV', code: 'HSV', stadium: 'Volksparkstadion', founded: 1887, color: '#0066B2', logo: '/logos/bundesliga/hamburg.png' },
    { name: 'FC Heidenheim', code: 'FCH', stadium: 'Voith-Arena', founded: 1846, color: '#003C7D', logo: '/logos/bundesliga/heidenheim.png' },
    { name: 'TSG Hoffenheim', code: 'HOF', stadium: 'PreZero Arena', founded: 1899, color: '#1961B5', logo: '/logos/bundesliga/hoffenheim.png' },
    { name: '1. FC Köln', code: 'KOE', stadium: 'RheinEnergieStadion', founded: 1948, color: '#ED1C24', logo: '/logos/bundesliga/koln.png' },
    { name: 'Mainz 05', code: 'M05', stadium: 'MEWA Arena', founded: 1905, color: '#C3141E', logo: '/logos/bundesliga/mainz.svg' },
    { name: 'RB Leipzig', code: 'RBL', stadium: 'Red Bull Arena', founded: 2009, color: '#DD0741', logo: '/logos/bundesliga/leipzig.svg' },
    { name: 'St. Pauli', code: 'STP', stadium: 'Millerntor-Stadion', founded: 1910, color: '#492F20', logo: '/logos/bundesliga/st-pauli.png' },
    { name: 'VfB Stuttgart', code: 'VFB', stadium: 'Mercedes-Benz Arena', founded: 1893, color: '#E20613', logo: '/logos/bundesliga/stuttgart.svg' },
    { name: 'Union Berlin', code: 'FCU', stadium: 'Stadion An der Alten Försterei', founded: 1966, color: '#EB1923', logo: '/logos/bundesliga/union-berlin.svg' },
    { name: 'Werder Bremen', code: 'SVW', stadium: 'Weserstadion', founded: 1899, color: '#1D9053', logo: '/logos/bundesliga/bremen.png' },
    { name: 'Wolfsburg', code: 'WOB', stadium: 'Volkswagen Arena', founded: 1945, color: '#65B32E', logo: '/logos/bundesliga/wolfsburg.svg' },
  ];

  const bundesligaTeams = await Promise.all(
    bundesligaTeamsData.map((team) =>
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

  console.log(`✅ Created ${plTeams.length + laLigaTeams.length + bundesligaTeams.length} teams`);
  return { plTeams, laLigaTeams, bundesligaTeams };
}

export async function seedFavoriteTeams(users: any[], teams: any) {
  console.log('\n❤️ Creating favorite teams...');
  await prisma.userFavoriteTeam.createMany({
    data: [
      { userId: users[0].id, teamId: teams.plTeams[0].id }, // Mustafa likes Arsenal
      { userId: users[0].id, teamId: teams.laLigaTeams[14].id }, // and Real Madrid
      { userId: users[1].id, teamId: teams.laLigaTeams[14].id }, // Youssef likes Real Madrid
      { userId: users[2].id, teamId: teams.plTeams[11].id }, // Ali likes Liverpool
      { userId: users[3].id, teamId: teams.bundesligaTeams[2].id }, // Mohammed likes Bayern Munich
      { userId: users[4].id, teamId: teams.plTeams[12].id }, // Majid likes Man City
    ],
  });
  console.log('✅ Created 6 favorite team relationships');
}
