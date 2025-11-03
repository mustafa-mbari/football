'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

type League = 'premierLeague' | 'laLiga' | 'bundesliga';

type Team = {
  id: number;
  name: string;
  shortName: string | null;
  code: string;
  leagueId: number;
};

// Static team mappings as fallback (copied from DB)
const STATIC_TEAMS: Team[] = [
  // Premier League (League ID: 1)
  { id: 1, name: 'Brighton', shortName: 'Brighton', code: 'BHA', leagueId: 1 },
  { id: 2, name: 'West Ham', shortName: 'West Ham', code: 'WHU', leagueId: 1 },
  { id: 3, name: 'Sunderland', shortName: 'Sunderland', code: 'SUN', leagueId: 1 },
  { id: 4, name: 'Tottenham', shortName: 'Spurs', code: 'TOT', leagueId: 1 },
  { id: 5, name: 'Arsenal', shortName: 'Arsenal', code: 'ARS', leagueId: 1 },
  { id: 6, name: 'Bournemouth', shortName: 'Bournemouth', code: 'BOU', leagueId: 1 },
  { id: 7, name: 'Burnley', shortName: 'Burnley', code: 'BUR', leagueId: 1 },
  { id: 8, name: 'Everton', shortName: 'Everton', code: 'EVE', leagueId: 1 },
  { id: 9, name: 'Fulham', shortName: 'Fulham', code: 'FUL', leagueId: 1 },
  { id: 10, name: 'Chelsea', shortName: 'Chelsea', code: 'CHE', leagueId: 1 },
  { id: 11, name: 'Manchester United', shortName: 'Man Utd', code: 'MUN', leagueId: 1 },
  { id: 12, name: 'Brentford', shortName: 'Brentford', code: 'BRE', leagueId: 1 },
  { id: 13, name: 'Leeds United', shortName: 'Leeds', code: 'LEE', leagueId: 1 },
  { id: 14, name: 'Nottingham Forest', shortName: 'Nott\'m Forest', code: 'NFO', leagueId: 1 },
  { id: 15, name: 'Liverpool', shortName: 'Liverpool', code: 'LIV', leagueId: 1 },
  { id: 16, name: 'Newcastle United', shortName: 'Newcastle', code: 'NEW', leagueId: 1 },
  { id: 17, name: 'Crystal Palace', shortName: 'Palace', code: 'CRY', leagueId: 1 },
  { id: 18, name: 'Wolverhampton', shortName: 'Wolves', code: 'WOL', leagueId: 1 },
  { id: 19, name: 'Manchester City', shortName: 'Man City', code: 'MCI', leagueId: 1 },
  { id: 20, name: 'Aston Villa', shortName: 'Villa', code: 'AVL', leagueId: 1 },

  // La Liga (League ID: 2)
  { id: 21, name: 'Levante', shortName: 'Levante', code: 'LEV', leagueId: 2 },
  { id: 22, name: 'Real Oviedo', shortName: 'Oviedo', code: 'OVI', leagueId: 2 },
  { id: 23, name: 'Girona', shortName: 'Girona', code: 'GIR', leagueId: 2 },
  { id: 24, name: 'Real Betis', shortName: 'Betis', code: 'BET', leagueId: 2 },
  { id: 25, name: 'Getafe', shortName: 'Getafe', code: 'GET', leagueId: 2 },
  { id: 26, name: 'Atlético Madrid', shortName: 'Atlético', code: 'ATM', leagueId: 2 },
  { id: 27, name: 'Osasuna', shortName: 'Osasuna', code: 'OSA', leagueId: 2 },
  { id: 28, name: 'Athletic Bilbao', shortName: 'Athletic', code: 'ATH', leagueId: 2 },
  { id: 29, name: 'Real Madrid', shortName: 'Madrid', code: 'RMA', leagueId: 2 },
  { id: 30, name: 'Mallorca', shortName: 'Mallorca', code: 'MAL', leagueId: 2 },
  { id: 31, name: 'Deportivo Alavés', shortName: 'Alavés', code: 'ALA', leagueId: 2 },
  { id: 32, name: 'Elche', shortName: 'Elche', code: 'ELC', leagueId: 2 },
  { id: 33, name: 'Celta Vigo', shortName: 'Celta', code: 'CEL', leagueId: 2 },
  { id: 34, name: 'Rayo Vallecano', shortName: 'Vallecano', code: 'RAY', leagueId: 2 },
  { id: 35, name: 'Sevilla', shortName: 'Sevilla', code: 'SEV', leagueId: 2 },
  { id: 36, name: 'Espanyol', shortName: 'Espanyol', code: 'ESP', leagueId: 2 },
  { id: 37, name: 'Barcelona', shortName: 'Barcelona', code: 'BAR', leagueId: 2 },
  { id: 38, name: 'Real Sociedad', shortName: 'Sociedad', code: 'RSO', leagueId: 2 },
  { id: 39, name: 'Villarreal', shortName: 'Villarreal', code: 'VIL', leagueId: 2 },
  { id: 40, name: 'Valencia', shortName: 'Valencia', code: 'VAL', leagueId: 2 },

  // Bundesliga (League ID: 3)
  { id: 41, name: 'Bayern Munich', shortName: 'Bayern', code: 'BAY', leagueId: 3 },
  { id: 42, name: 'FC Augsburg', shortName: 'Augsburg', code: 'AUG', leagueId: 3 },
  { id: 43, name: 'Bayer Leverkusen', shortName: 'Leverkusen', code: 'LEV', leagueId: 3 },
  { id: 44, name: 'Eintracht Frankfurt', shortName: 'Frankfurt', code: 'FRA', leagueId: 3 },
  { id: 45, name: 'Hamburger SV', shortName: 'Hamburg', code: 'HAM', leagueId: 3 },
  { id: 46, name: 'Borussia Mönchengladbach', shortName: 'M\'gladbach', code: 'BMG', leagueId: 3 },
  { id: 47, name: 'FC Heidenheim', shortName: 'Heidenheim', code: 'HEI', leagueId: 3 },
  { id: 48, name: 'TSG Hoffenheim', shortName: 'Hoffenheim', code: 'HOF', leagueId: 3 },
  { id: 49, name: 'St. Pauli', shortName: 'St. Pauli', code: 'STP', leagueId: 3 },
  { id: 50, name: 'SC Freiburg', shortName: 'Freiburg', code: 'FRE', leagueId: 3 },
  { id: 51, name: 'Borussia Dortmund', shortName: 'Dortmund', code: 'DOR', leagueId: 3 },
  { id: 52, name: 'RB Leipzig', shortName: 'Leipzig', code: 'RBL', leagueId: 3 },
  { id: 53, name: 'Union Berlin', shortName: 'Union', code: 'UNI', leagueId: 3 },
  { id: 54, name: 'Mainz 05', shortName: 'Mainz', code: 'MAI', leagueId: 3 },
  { id: 55, name: 'VfB Stuttgart', shortName: 'Stuttgart', code: 'STU', leagueId: 3 },
  { id: 56, name: 'Werder Bremen', shortName: 'Bremen', code: 'BRE', leagueId: 3 },
  { id: 57, name: '1. FC Köln', shortName: 'Köln', code: 'KOL', leagueId: 3 },
  { id: 58, name: 'Wolfsburg', shortName: 'Wolfsburg', code: 'WOL', leagueId: 3 },
];

export default function BulkMatchImportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeLeague, setActiveLeague] = useState<League>('premierLeague');
  const [matchData, setMatchData] = useState('');
  const [importing, setImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameWeeks, setGameWeeks] = useState<any[]>([]);
  const [conversionStats, setConversionStats] = useState<{total: number, converted: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteData, setDeleteData] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeamsAndGameWeeks();
  }, [activeLeague]);

  const fetchTeamsAndGameWeeks = async () => {
    try {
      // Fetch all teams for all 3 leagues
      const [plTeamsRes, laLigaTeamsRes, bundesligaTeamsRes, gameWeeksRes] = await Promise.all([
        fetch('${getApiUrl()}/api/teams/league/1', { credentials: 'include' }), // Premier League
        fetch('${getApiUrl()}/api/teams/league/2', { credentials: 'include' }), // La Liga
        fetch('${getApiUrl()}/api/teams/league/3', { credentials: 'include' }), // Bundesliga
        fetch('${getApiUrl()}/api/gameweeks', { credentials: 'include' })
      ]);

      const allTeams: Team[] = [];

      if (plTeamsRes.ok) {
        const plTeamsData = await plTeamsRes.json();
        const plTeams = Array.isArray(plTeamsData) ? plTeamsData : (plTeamsData.teams || []);
        allTeams.push(...plTeams);
      }

      if (laLigaTeamsRes.ok) {
        const laLigaTeamsData = await laLigaTeamsRes.json();
        const laLigaTeams = Array.isArray(laLigaTeamsData) ? laLigaTeamsData : (laLigaTeamsData.teams || []);
        allTeams.push(...laLigaTeams);
      }

      if (bundesligaTeamsRes.ok) {
        const bundesligaTeamsData = await bundesligaTeamsRes.json();
        const bundesligaTeams = Array.isArray(bundesligaTeamsData) ? bundesligaTeamsData : (bundesligaTeamsData.teams || []);
        allTeams.push(...bundesligaTeams);
      }

      setTeams(allTeams);
      console.log('Loaded total teams:', allTeams.length);

      if (gameWeeksRes.ok) {
        const gameWeeksData = await gameWeeksRes.json();
        setGameWeeks(gameWeeksData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    router.push('/');
    return null;
  }

  const parseMatches = () => {
    const lines = matchData.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split(',').map(p => p.trim());

      if (parts.length < 6) {
        errors.push(`Line ${i + 1}: Invalid format (expected at least 6 parts)`);
        continue;
      }

      let [homeTeamId, awayTeamId, date, time, homeScore, awayScore, status, week] = parts;

      // Validate team IDs are numbers
      if (isNaN(parseInt(homeTeamId)) || isNaN(parseInt(awayTeamId))) {
        errors.push(`Line ${i + 1}: Team IDs must be numbers`);
        continue;
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push(`Line ${i + 1}: Date must be in YYYY-MM-DD format`);
        continue;
      }

      // Auto-convert 0 to 18:00
      if (time === '0') {
        time = '18:00';
      }

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(time)) {
        errors.push(`Line ${i + 1}: Time must be in HH:MM format or 0 for default time`);
        continue;
      }

      parsed.push({
        homeTeamId: parseInt(homeTeamId),
        awayTeamId: parseInt(awayTeamId),
        matchDate: date,
        matchTime: time,
        homeScore: homeScore && !isNaN(parseInt(homeScore)) ? parseInt(homeScore) : undefined,
        awayScore: awayScore && !isNaN(parseInt(awayScore)) ? parseInt(awayScore) : undefined,
        status: status || 'SCHEDULED',
        weekNumber: week && !isNaN(parseInt(week)) ? parseInt(week) : undefined,
      });
    }

    return { parsed, errors };
  };

  const handleImport = async () => {
    const { parsed, errors } = parseMatches();

    if (errors.length > 0) {
      alert('Validation errors:\n' + errors.join('\n'));
      return;
    }

    if (parsed.length === 0) {
      alert('No valid matches to import');
      return;
    }

    const confirmed = confirm(
      `Import ${parsed.length} matches for ${getLeagueName(activeLeague)}?`
    );
    if (!confirmed) return;

    try {
      setImporting(true);

      const response = await fetch('${getApiUrl()}/api/matches/bulk-import-by-id', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league: activeLeague,
          matches: parsed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! Imported ${data.count} matches.`);
        setMatchData('');
        router.push('/admin/matches');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to import matches');
      }
    } catch (error) {
      alert('Failed to import matches');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const getLeagueName = (league: League) => {
    switch (league) {
      case 'premierLeague':
        return 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿';
      case 'laLiga':
        return 'La Liga 🇪🇸';
      case 'bundesliga':
        return 'Bundesliga 🇩🇪';
    }
  };

  const getLeagueIdByType = (league: League) => {
    switch (league) {
      case 'premierLeague': return 1;
      case 'laLiga': return 2;
      case 'bundesliga': return 3;
    }
  };

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCsvFile(file);

    // Read file content
    const text = await file.text();
    setCsvData(text);

    // Detect league from filename and wait for it to update
    const fileName = file.name.toLowerCase();
    let detectedLeague: League = activeLeague;
    if (fileName.includes('pl')) {
      detectedLeague = 'premierLeague';
      setActiveLeague('premierLeague');
    } else if (fileName.includes('sl')) {
      detectedLeague = 'laLiga';
      setActiveLeague('laLiga');
    } else if (fileName.includes('bl')) {
      detectedLeague = 'bundesliga';
      setActiveLeague('bundesliga');
    }

    // Force reload teams and gameweeks for the detected league
    console.log('Fetching teams and gameweeks for', detectedLeague);
    try {
      const [plTeamsRes, laLigaTeamsRes, bundesligaTeamsRes, gameWeeksRes] = await Promise.all([
        fetch('${getApiUrl()}/api/teams/league/1', { credentials: 'include' }),
        fetch('${getApiUrl()}/api/teams/league/2', { credentials: 'include' }),
        fetch('${getApiUrl()}/api/teams/league/3', { credentials: 'include' }),
        fetch('${getApiUrl()}/api/gameweeks', { credentials: 'include' })
      ]);

      let fetchedTeams: Team[] = [];
      let fetchedGameWeeks: any[] = [];

      if (plTeamsRes.ok) {
        const plTeamsData = await plTeamsRes.json();
        const plTeams = Array.isArray(plTeamsData) ? plTeamsData : (plTeamsData.teams || []);
        fetchedTeams.push(...plTeams);
      }

      if (laLigaTeamsRes.ok) {
        const laLigaTeamsData = await laLigaTeamsRes.json();
        const laLigaTeams = Array.isArray(laLigaTeamsData) ? laLigaTeamsData : (laLigaTeamsData.teams || []);
        fetchedTeams.push(...laLigaTeams);
      }

      if (bundesligaTeamsRes.ok) {
        const bundesligaTeamsData = await bundesligaTeamsRes.json();
        const bundesligaTeams = Array.isArray(bundesligaTeamsData) ? bundesligaTeamsData : (bundesligaTeamsData.teams || []);
        fetchedTeams.push(...bundesligaTeams);
      }

      setTeams(fetchedTeams);
      console.log('Fetched teams:', fetchedTeams.length);
      console.log('All teams:', fetchedTeams.map(t => `${t.name} (League ID: ${t.leagueId})`).join(', '));

      if (gameWeeksRes.ok) {
        fetchedGameWeeks = await gameWeeksRes.json();
        setGameWeeks(fetchedGameWeeks);
        console.log('Fetched gameweeks:', fetchedGameWeeks.length);
      }

      console.log('Starting CSV conversion...');

      // Parse and convert CSV to match format using fetched data
      const { converted, stats } = parseCsvToMatchesWithData(text, detectedLeague, fetchedTeams, fetchedGameWeeks);
      console.log('Converted matches:', converted);
      setMatchData(converted);
      setConversionStats(stats);
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Failed to process CSV file. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCsvToMatchesWithData = (
    csvText: string,
    league: League,
    teamsData: Team[],
    gameWeeksData: any[]
  ): { converted: string, stats: {total: number, converted: number} } => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return { converted: '', stats: { total: 0, converted: 0 } };

    // Team name aliases for matching CSV names to DB names
    const teamAliases: Record<string, string> = {
      // Premier League
      'Man United': 'Manchester United',
      'Man City': 'Manchester City',
      "Nott'm Forest": 'Nottingham Forest',
      'Wolves': 'Wolverhampton',

      // La Liga (add if needed)
      'Atletico Madrid': 'Atlético Madrid',
      'Atlético': 'Atlético Madrid',
      'Deportivo Alaves': 'Deportivo Alavés',

      // Bundesliga (add if needed)
      'Ein Frankfurt': 'Eintracht Frankfurt',
      'FC Koln': '1. FC Köln',
      'Monchengladbach': 'Borussia Mönchengladbach',
      'M\'gladbach': 'Borussia Mönchengladbach',
    };

    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim());

    // Find column indices
    const dateIdx = headers.findIndex(h => h === 'Date');
    const timeIdx = headers.findIndex(h => h === 'Time');
    const homeTeamIdx = headers.findIndex(h => h === 'HomeTeam');
    const awayTeamIdx = headers.findIndex(h => h === 'AwayTeam');
    const fthgIdx = headers.findIndex(h => h === 'FTHG' || h === 'HG');
    const ftagIdx = headers.findIndex(h => h === 'FTAG' || h === 'AG');
    const ftrIdx = headers.findIndex(h => h === 'FTR' || h === 'Res');

    const leagueId = getLeagueIdByType(league);
    console.log('Parsing CSV - League:', league, 'Expected LeagueID:', leagueId);

    // Use static teams if no teams data provided (fallback)
    const teamsToUse = teamsData.length > 0 ? teamsData : STATIC_TEAMS;
    console.log('Total teams available:', teamsToUse.length);
    console.log('Using teams from:', teamsData.length > 0 ? 'API' : 'Static fallback');

    const leagueTeams = teamsToUse.filter(t => t.leagueId === leagueId);

    console.log('Filtered teams for league:', leagueTeams.length);
    console.log('Team names:', leagueTeams.map(t => t.name).join(', '));
    console.log('Total CSV lines:', lines.length);

    const matchLines: string[] = [];
    const teamWeekTracker = new Map<number, number>(); // Track which week each team is on

    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const row = line.split(',').map(cell => cell.trim());

      // Extract data
      const dateStr = row[dateIdx]; // Format: dd/mm/yy
      const timeStr = row[timeIdx]; // Format: HH:MM
      const homeTeamName = row[homeTeamIdx];
      const awayTeamName = row[awayTeamIdx];
      const homeScore = row[fthgIdx];
      const awayScore = row[ftagIdx];
      const result = row[ftrIdx];

      if (!dateStr || !homeTeamName || !awayTeamName) {
        console.warn(`Line ${i}: Missing required data`);
        continue;
      }

      // Convert date from dd/mm/yy to YYYY-MM-DD
      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) {
        console.warn(`Line ${i}: Invalid date format: ${dateStr}`);
        continue;
      }

      const day = dateParts[0].padStart(2, '0');
      const month = dateParts[1].padStart(2, '0');
      let year = dateParts[2];
      // Convert 2-digit year to 4-digit (25 -> 2025, 24 -> 2024)
      if (year.length === 2) {
        year = '20' + year;
      }
      const isoDate = `${year}-${month}-${day}`;

      // Apply team name aliases
      const resolvedHomeTeamName = teamAliases[homeTeamName] || homeTeamName;
      const resolvedAwayTeamName = teamAliases[awayTeamName] || awayTeamName;

      // Find team IDs
      const homeTeam = leagueTeams.find(t =>
        t.name === resolvedHomeTeamName ||
        t.shortName === resolvedHomeTeamName ||
        t.name.toLowerCase() === resolvedHomeTeamName.toLowerCase()
      );
      const awayTeam = leagueTeams.find(t =>
        t.name === resolvedAwayTeamName ||
        t.shortName === resolvedAwayTeamName ||
        t.name.toLowerCase() === resolvedAwayTeamName.toLowerCase()
      );

      if (!homeTeam || !awayTeam) {
        console.warn(`Line ${i}: Teams not found - ${homeTeamName} vs ${awayTeamName}`);
        console.warn('Available teams:', leagueTeams.map(t => t.name));
        continue;
      }

      // Determine match status
      let status = 'SCHEDULED';
      if (homeScore && awayScore && result) {
        status = 'FINISHED';
      }

      // Calculate week number based on first appearance of each team
      // First match for any team = week 1, then increment for each subsequent match
      const homeTeamWeek = teamWeekTracker.get(homeTeam.id) || 0;
      const awayTeamWeek = teamWeekTracker.get(awayTeam.id) || 0;

      // The week number is the maximum of both teams' current week + 1
      const weekNumber = Math.max(homeTeamWeek, awayTeamWeek) + 1;

      // Update tracker for both teams
      teamWeekTracker.set(homeTeam.id, weekNumber);
      teamWeekTracker.set(awayTeam.id, weekNumber);

      // Format: HomeTeamID,AwayTeamID,YYYY-MM-DD,HH:MM,HomeScore,AwayScore,Status,WeekNumber
      const matchLine = [
        homeTeam.id,
        awayTeam.id,
        isoDate,
        timeStr || '18:00',
        homeScore || '',
        awayScore || '',
        status,
        weekNumber
      ].join(',');

      matchLines.push(matchLine);
    }

    const totalRows = lines.length - 1; // Exclude header
    console.log(`Successfully converted ${matchLines.length} matches out of ${totalRows} total rows`);

    return {
      converted: matchLines.join('\n'),
      stats: { total: totalRows, converted: matchLines.length }
    };
  };

  const parseDeleteData = () => {
    const lines = deleteData.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split(',').map(p => p.trim());

      if (parts.length !== 2) {
        errors.push(`Line ${i + 1}: Invalid format (expected: LeagueId,WeekNumbers)`);
        continue;
      }

      const [leagueIdStr, weekNumbersStr] = parts;

      // Validate league ID
      const leagueId = parseInt(leagueIdStr);
      if (isNaN(leagueId)) {
        errors.push(`Line ${i + 1}: League ID must be a number`);
        continue;
      }

      // Parse week numbers (can be single or range like "10-11-12")
      const weekNumbers = weekNumbersStr.split('-').map(w => parseInt(w.trim())).filter(n => !isNaN(n));

      if (weekNumbers.length === 0) {
        errors.push(`Line ${i + 1}: No valid week numbers found`);
        continue;
      }

      parsed.push({
        leagueId,
        weekNumbers,
      });
    }

    return { parsed, errors };
  };

  const handleDelete = async () => {
    const { parsed, errors } = parseDeleteData();

    if (errors.length > 0) {
      alert('Validation errors:\n' + errors.join('\n'));
      return;
    }

    if (parsed.length === 0) {
      alert('No valid delete commands');
      return;
    }

    // Build confirmation message
    const confirmMessage = parsed.map(item => {
      const leagueName = item.leagueId === 1 ? 'Premier League' : item.leagueId === 2 ? 'La Liga' : item.leagueId === 3 ? 'Bundesliga' : `League ${item.leagueId}`;
      return `${leagueName}: Weeks ${item.weekNumbers.join(', ')}`;
    }).join('\n');

    const confirmed = confirm(
      `Delete all SCHEDULED matches from:\n\n${confirmMessage}\n\nThis action cannot be undone. Continue?`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const results = [];

      for (const item of parsed) {
        const response = await fetch('${getApiUrl()}/api/matches/bulk-delete-scheduled', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leagueId: item.leagueId,
            weekNumbers: item.weekNumbers,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push(data);
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete matches');
          return;
        }
      }

      const totalDeleted = results.reduce((sum, r) => sum + r.count, 0);
      const detailedMessage = results.map(r => r.message).join('\n');

      alert(`Success!\n\n${detailedMessage}\n\nTotal deleted: ${totalDeleted} matches`);
      setDeleteData('');
    } catch (error) {
      alert('Failed to delete matches');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const { parsed } = parseMatches();
  const { parsed: parsedDelete } = parseDeleteData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/matches">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Matches
            </Button>
          </Link>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📋 Bulk Match Import
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Add multiple matches by team ID using comma-separated format
          </p>
        </div>

        {/* League Tabs */}
        <div className="mb-6 flex gap-2">
          {(['premierLeague', 'laLiga', 'bundesliga'] as League[]).map((league) => (
            <Button
              key={league}
              onClick={() => setActiveLeague(league)}
              variant={activeLeague === league ? 'default' : 'outline'}
              size="lg"
            >
              {getLeagueName(league)}
            </Button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Match Data (Team IDs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Format: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      HomeTeamID,AwayTeamID,YYYY-MM-DD,HH:MM,HomeScore,AwayScore,Status,WeekNumber
                    </code>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Example: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      1,12,2025-08-15,20:00,2,1,FINISHED,1
                    </code>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status: SCHEDULED, LIVE, FINISHED, POSTPONED (leave empty or scores blank for scheduled matches)
                    <br />
                    Use <strong>0</strong> for time to set default time (18:00)
                  </p>
                </div>
                <Textarea
                  placeholder="1,12,2025-08-15,20:00,2,1,FINISHED,1&#10;3,5,2025-08-16,15:00,,,SCHEDULED,1"
                  value={matchData}
                  onChange={(e) => setMatchData(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleImport}
                  disabled={importing || !matchData.trim()}
                  className="w-full"
                >
                  {importing ? 'Importing...' : `Import ${parsed.length} Matches`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview ({parsed.length} matches)</CardTitle>
            </CardHeader>
            <CardContent>
              {parsed.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Enter match data to see preview
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {parsed.map((match, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Match {index + 1} - Week {match.weekNumber || '?'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          match.status === 'FINISHED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : match.status === 'LIVE'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {match.status}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        Team ID {match.homeTeamId} vs Team ID {match.awayTeamId}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        {match.matchDate} at {match.matchTime}
                        {match.homeScore !== undefined && match.awayScore !== undefined &&
                          ` • Score: ${match.homeScore}-${match.awayScore}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSV Import Section */}
          <Card>
            <CardHeader>
              <CardTitle>📤 Import from CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Upload a CSV file with match data. The system will automatically:
                  </p>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1 mb-3">
                    <li>Detect the league from filename (pl = Premier League, sl = La Liga, bl = Bundesliga)</li>
                    <li>Convert team names to team IDs from the database</li>
                    <li>Convert dates from dd/mm/yy to YYYY-MM-DD format</li>
                    <li>Map matches to gameweeks based on dates</li>
                    <li>Display the converted data in the format above</li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Expected CSV format: Div,Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,FTR,...
                    <br />
                    See the note file for full details: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">
                      backend/prisma/seeds/data/csv_convert/note_of_csv_file.txt
                    </code>
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Processing CSV file...
                      </span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileChange}
                        className="hidden"
                        id="csv-file-input"
                      />
                      <label
                        htmlFor="csv-file-input"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <svg
                          className="w-12 h-12 text-slate-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Click to upload CSV file
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          (pl.csv, sl.csv, or bl.csv)
                        </span>
                      </label>
                    </>
                  )}
                </div>

                {csvFile && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ File loaded: <strong>{csvFile.name}</strong>
                    </p>
                    {conversionStats && (
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        Converted {conversionStats.converted} out of {conversionStats.total} rows
                        {conversionStats.converted !== conversionStats.total && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {' '}({conversionStats.total - conversionStats.converted} rows skipped - check console for details)
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      Converted data has been populated above. Review the preview and click Import to proceed.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bulk Delete Section */}
          <Card className="border-2 border-red-200 dark:border-red-900">
            <CardHeader className="bg-red-50 dark:bg-red-950/30">
              <CardTitle className="text-red-900 dark:text-red-200">🗑️ Bulk Delete Scheduled Matches</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    ⚠️ Warning: This will permanently delete all SCHEDULED matches for the specified weeks!
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Only matches with status SCHEDULED will be deleted. Matches with status FINISHED, LIVE, or POSTPONED will NOT be affected.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Format: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      LeagueId,WeekNumbers
                    </code>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    League IDs: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">1 = Premier League, 2 = La Liga, 3 = Bundesliga</code>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                    Examples:
                  </p>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">1,10-11-12</code> - Delete weeks 10, 11, 12 from Premier League
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">1,22</code> - Delete week 22 from Premier League
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">2,23-24-25-26-27</code> - Delete weeks 23-27 from La Liga
                    </p>
                  </div>
                </div>
                <Textarea
                  placeholder="1,10-11-12&#10;2,23-24-25-26-27&#10;3,15"
                  value={deleteData}
                  onChange={(e) => setDeleteData(e.target.value)}
                  rows={6}
                  className="font-mono text-sm border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600"
                />

                {/* Delete Preview */}
                {parsedDelete.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                      Preview: Will delete SCHEDULED matches from:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {parsedDelete.map((item, index) => {
                        const leagueName = item.leagueId === 1 ? 'Premier League' : item.leagueId === 2 ? 'La Liga' : item.leagueId === 3 ? 'Bundesliga' : `League ${item.leagueId}`;
                        return (
                          <li key={index} className="text-sm text-red-800 dark:text-red-300">
                            {leagueName}: Weeks {item.weekNumbers.join(', ')}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={handleDelete}
                  disabled={deleting || !deleteData.trim()}
                  variant="destructive"
                  className="w-full"
                >
                  {deleting ? 'Deleting...' : `Delete Scheduled Matches from ${parsedDelete.length} Command${parsedDelete.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </main>
  );
}
