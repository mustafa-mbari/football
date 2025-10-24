'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { predictionsApi, footballDataApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
  code: string;
  logoUrl?: string | null;
}

interface Match {
  id: number;
  matchDate: string;
  status?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: Team;
  awayTeam: Team;
}

interface TeamStats {
  id: number;
  teamId: number;
  team: Team;
  matchesPlayed: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  result?: string;
}

interface GameWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  isCurrent: boolean;
  league: {
    id: number;
    name: string;
    country: string;
    season: string;
  };
  matches: Match[];
  teamStats: TeamStats[];
}

export default function GameWeekDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [gameWeek, setGameWeek] = useState<GameWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [scores, setScores] = useState<{ [key: number]: { home: string; away: string } }>({});
  const [completingWeek, setCompletingWeek] = useState(false);
  const [syncingMatch, setSyncingMatch] = useState<number | null>(null);
  const [syncingWeek, setSyncingWeek] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [syncData, setSyncData] = useState<any>(null);
  const [loadingSyncData, setLoadingSyncData] = useState(false);
  const [executingSync, setExecutingSync] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [prevGameWeekId, setPrevGameWeekId] = useState<number | null>(null);
  const [nextGameWeekId, setNextGameWeekId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    homeTeamId: 0,
    awayTeamId: 0,
    matchDate: '',
    status: 'SCHEDULED',
    homeScore: null as number | null,
    awayScore: null as number | null,
  });

  useEffect(() => {
    // Don't redirect while authentication is loading
    if (authLoading) {
      console.log('Auth is loading, waiting...');
      return;
    }

    console.log('Auth loaded:', { user: user?.username, role: user?.role, authLoading });

    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      console.log('User not authorized, redirecting to /');
      router.push('/');
      return;
    }

    console.log('User authorized, fetching data...');
    fetchGameWeek();
    fetchTotalGameWeeks();
  }, [user, authLoading, router, params.id]);

  // Fetch teams after gameweek is loaded
  useEffect(() => {
    if (gameWeek) {
      fetchTeams();
    }
  }, [gameWeek?.league?.id]);

  const fetchTeams = async () => {
    try {
      // First, we need to get the gameweek to know which league's teams to fetch
      if (!gameWeek) {
        console.log('GameWeek not loaded yet, waiting...');
        return;
      }

      const response = await fetch(`http://localhost:7070/api/leagues/${gameWeek.league.id}/teams`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched teams for league', gameWeek.league.id, ':', data.data);
        setTeams(data.data || []);
      } else {
        console.error('Failed to fetch teams, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTotalGameWeeks = async () => {
    try {
      const response = await fetch('http://localhost:7070/api/gameweeks');
      if (response.ok) {
        const data = await response.json();
        const gameweeks = data.data;

        // Find current gameweek index and set prev/next IDs
        const currentIndex = gameweeks.findIndex((gw: any) => gw.id === parseInt(params.id as string));
        if (currentIndex !== -1) {
          setPrevGameWeekId(currentIndex > 0 ? gameweeks[currentIndex - 1].id : null);
          setNextGameWeekId(currentIndex < gameweeks.length - 1 ? gameweeks[currentIndex + 1].id : null);
        }
      }
    } catch (error) {
      console.error('Error fetching total gameweeks:', error);
    }
  };

  const fetchGameWeek = async () => {
    try {
      const response = await fetch(`http://localhost:7070/api/gameweeks/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Transform the nested structure to flat structure for easier use
        const gameWeekData = data.data;
        if (gameWeekData.matches) {
          gameWeekData.matches = gameWeekData.matches.map((gw: any) => gw.match);
        }
        setGameWeek(gameWeekData);
      }
    } catch (error) {
      console.error('Error fetching gameweek:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleUpdateScore = async (matchId: number) => {
    const score = scores[matchId];
    if (!score?.home || !score?.away) {
      alert('Please enter both scores');
      return;
    }

    try {
      await predictionsApi.updateMatchScore(matchId, {
        homeScore: parseInt(score.home),
        awayScore: parseInt(score.away),
        status: 'FINISHED',
      });

      alert('Match score updated successfully!');
      setEditingMatch(null);
      setScores((prev) => {
        const newScores = { ...prev };
        delete newScores[matchId];
        return newScores;
      });
      fetchGameWeek();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update match score');
    }
  };

  const handleSyncMatch = async (matchId: number) => {
    const confirmed = confirm('Sync this match? This will update standings and calculate prediction points.');
    if (!confirmed) return;

    try {
      setSyncingMatch(matchId);
      const response = await fetch(`http://localhost:7070/api/sync/match/${matchId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Match synced successfully!');
        fetchGameWeek();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to sync match');
      }
    } catch (error) {
      alert('Failed to sync match');
      console.error(error);
    } finally {
      setSyncingMatch(null);
    }
  };

  const handleSyncWeek = async () => {
    const confirmed = confirm(
      `Re-sync Week ${gameWeek?.weekNumber} Stats?\n\n` +
      '⚠️ This will:\n' +
      '1. Reset TeamGameWeekStats for THIS week only\n' +
      '2. Recalculate stats using ONLY finished matches from THIS week\n' +
      '3. Does NOT affect the main league table (cumulative standings)\n\n' +
      'This is safe and only updates this gameweek\'s statistics.'
    );
    if (!confirmed) return;

    try {
      setSyncingWeek(true);
      const response = await fetch(`http://localhost:7070/api/sync/resync/gameweek/${params.id}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'GameWeek re-synced successfully!');
        fetchGameWeek();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to re-sync gameweek');
      }
    } catch (error) {
      alert('Failed to re-sync gameweek');
      console.error(error);
    } finally {
      setSyncingWeek(false);
    }
  };

  const handleCompleteWeek = async () => {
    if (!gameWeek) return;

    // Check if all matches have scores
    const allMatchesHaveScores = gameWeek.matches.every(
      (match) => match.homeScore !== null && match.homeScore !== undefined &&
                match.awayScore !== null && match.awayScore !== undefined
    );

    if (!allMatchesHaveScores) {
      alert('Please enter scores for all matches before marking the week as completed');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to mark Week ${gameWeek.weekNumber} as COMPLETED? This will finalize all match results.`
    );

    if (!confirmed) return;

    try {
      setCompletingWeek(true);
      const response = await fetch(`http://localhost:7070/api/gameweeks/${params.id}/complete`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('GameWeek marked as completed!');
        fetchGameWeek();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to complete gameweek');
      }
    } catch (error: any) {
      alert('Failed to complete gameweek');
      console.error(error);
    } finally {
      setCompletingWeek(false);
    }
  };

  const handleEditMatch = (match: Match) => {
    console.log('Opening edit dialog for match:', match);
    console.log('Available teams:', teams);
    setSelectedMatch(match);
    const matchDateTime = new Date(match.matchDate);
    const localDateTime = new Date(matchDateTime.getTime() - matchDateTime.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    const formData = {
      homeTeamId: Number(match.homeTeam.id),
      awayTeamId: Number(match.awayTeam.id),
      matchDate: localDateTime,
      status: match.status || 'SCHEDULED',
      homeScore: match.homeScore ?? null,
      awayScore: match.awayScore ?? null,
    };
    console.log('Setting edit form to:', formData);
    setEditForm(formData);
    setEditDialogOpen(true);
  };

  const handleSaveEditMatch = async () => {
    if (!selectedMatch) return;

    // Validate form
    if (!editForm.homeTeamId || editForm.homeTeamId === 0) {
      alert('Please select a home team');
      return;
    }
    if (!editForm.awayTeamId || editForm.awayTeamId === 0) {
      alert('Please select an away team');
      return;
    }
    if (!editForm.matchDate) {
      alert('Please select a match date and time');
      return;
    }

    try {
      const payload = {
        homeTeamId: editForm.homeTeamId,
        awayTeamId: editForm.awayTeamId,
        matchDate: new Date(editForm.matchDate).toISOString(),
        status: editForm.status,
        homeScore: editForm.homeScore,
        awayScore: editForm.awayScore,
      };

      console.log('Updating match with payload:', payload);

      const response = await fetch(`http://localhost:7070/api/matches/${selectedMatch.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setEditDialogOpen(false);
        fetchGameWeek();

        // Show appropriate message based on whether match needs re-syncing
        if (data.message.includes('unsynced')) {
          alert('⚠️ Match updated successfully!\n\nIMPORTANT: The match has been marked as unsynced. To update the tables:\n1. Go to Admin → Update Standings\n2. Click "Recalculate Tables" button\n\nDO NOT use the sync buttons as they will duplicate stats.');
        } else {
          alert('Match updated successfully!');
        }
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update match');
      }
    } catch (error) {
      alert('Failed to update match');
      console.error(error);
    }
  };

  const handleDeleteMatch = (match: Match) => {
    setSelectedMatch(match);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMatch = async () => {
    if (!selectedMatch) return;

    try {
      const response = await fetch(`http://localhost:7070/api/matches/${selectedMatch.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Match deleted successfully!');
        setDeleteDialogOpen(false);
        fetchGameWeek();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete match');
      }
    } catch (error) {
      alert('Failed to delete match');
      console.error(error);
    }
  };

  const handleOpenSyncDialog = async () => {
    if (!gameWeek) return;

    setLoadingSyncData(true);
    setSyncDialogOpen(true);
    setSyncData(null);

    try {
      const response = await footballDataApi.prepareGameWeekSync(gameWeek.id);
      setSyncData(response.data.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load sync data');
      setSyncDialogOpen(false);
    } finally {
      setLoadingSyncData(false);
    }
  };

  const handleExecuteSync = async () => {
    if (!syncData || !gameWeek) return;

    const confirmed = confirm(
      `Sync ${syncData.summary.toCreate} new matches and update ${syncData.summary.toUpdate} existing matches?\n\n` +
      'This will create new matches and update match details (date, time, scores, status) from the Football Data API.'
    );

    if (!confirmed) return;

    setExecutingSync(true);

    try {
      const response = await footballDataApi.executeGameWeekSync(gameWeek.id, syncData.syncPlan);
      alert(response.data.message || 'Sync completed successfully!');
      setSyncDialogOpen(false);
      fetchGameWeek();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to execute sync');
    } finally {
      setExecutingSync(false);
    }
  };

  const getLeagueFlag = (country: string): string => {
    const flags: { [key: string]: string } = {
      England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      Germany: '🇩🇪',
      Spain: '🇪🇸',
    };
    return flags[country] || '⚽';
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="destructive">In Progress</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMatchStatusBadge = (status?: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status.toUpperCase()) {
      case 'FINISHED':
        return <Badge variant="default">Finished</Badge>;
      case 'LIVE':
        return <Badge variant="destructive">Live</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading gameweek...</p>
        </div>
      </div>
    );
  }

  if (!gameWeek) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">GameWeek not found</p>
          <Link href="/admin/gameweeks">
            <Button>Back to GameWeeks</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allMatchesHaveScores = gameWeek.matches.every(
    (match) => match.homeScore !== null && match.homeScore !== undefined &&
              match.awayScore !== null && match.awayScore !== undefined
  );
  const isCompleted = gameWeek.status?.toUpperCase() === 'COMPLETED';

  return (
    <>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/admin/gameweeks${gameWeek ? `?league=${gameWeek.league.id}` : ''}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to GameWeeks
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => prevGameWeekId && router.push(`/admin/gameweeks/${prevGameWeekId}?league=${gameWeek.league.id}`)}
                disabled={!prevGameWeekId}
                className="px-3"
              >
                ← Previous
              </Button>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                {getLeagueFlag(gameWeek.league.country)} Week {gameWeek.weekNumber}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => nextGameWeekId && router.push(`/admin/gameweeks/${nextGameWeekId}?league=${gameWeek.league.id}`)}
                disabled={!nextGameWeekId}
                className="px-3"
              >
                Next →
              </Button>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  {gameWeek.league.name} - {gameWeek.league.season}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(gameWeek.startDate).toLocaleDateString()} -{' '}
                  {new Date(gameWeek.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(gameWeek.status)}
              <Button
                onClick={() => router.push(`/admin/gameweeks/${params.id}/add-matches`)}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                ➕ Add Matches
              </Button>
              <Button
                onClick={handleOpenSyncDialog}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                🌐 Sync from API
              </Button>
              <Button
                onClick={handleSyncWeek}
                disabled={syncingWeek}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                {syncingWeek ? 'Re-syncing...' : '🔄 Re-Sync Matches to Tables'}
              </Button>
              {!isCompleted && allMatchesHaveScores && (
                <Button
                  onClick={handleCompleteWeek}
                  disabled={completingWeek}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completingWeek ? 'Completing...' : '✓ Mark Week as Completed'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alert for completed week */}
        {isCompleted && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-900 dark:text-green-300 font-medium">
              ✓ This gameweek has been marked as completed. You can still edit match scores if needed.
            </p>
          </div>
        )}

        {/* Alert for incomplete matches */}
        {!isCompleted && !allMatchesHaveScores && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-900 dark:text-yellow-300 font-medium">
              ⚠ Please enter scores for all matches before marking this week as completed.
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameWeek.matches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Finished
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gameWeek.matches.filter((m) => m.status?.toUpperCase() === 'FINISHED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                With Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {gameWeek.matches.filter((m) => m.homeScore !== null && m.awayScore !== null).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {gameWeek.matches.filter((m) => m.homeScore === null || m.awayScore === null).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches - Edit Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Scores Management</CardTitle>
          </CardHeader>
          <CardContent>
            {gameWeek.matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
                    No matches assigned to this gameweek yet
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">
                    Add matches to this gameweek to start managing scores
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/admin/gameweeks/${params.id}/add-matches`)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ➕ Add Matches to This Week
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameWeek.matches.map((match) => {
                  const isEditing = editingMatch === match.id;
                  const hasScore = match.homeScore !== null && match.awayScore !== null;

                  return (
                    <Card key={match.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                          {/* Home Team */}
                          <div className="flex-1 flex items-center justify-end gap-3">
                            <p className="font-semibold text-lg">{match.homeTeam.name}</p>
                            {match.homeTeam.logoUrl && (
                              <img
                                src={match.homeTeam.logoUrl}
                                alt={match.homeTeam.name}
                                className="w-8 h-8 object-contain"
                              />
                            )}
                          </div>

                          {/* Score Display/Edit */}
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                className="w-16 text-center text-lg font-bold"
                                placeholder={match.homeScore?.toString() || '0'}
                                value={scores[match.id]?.home || ''}
                                onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                autoFocus
                              />
                              <span className="text-2xl font-bold">-</span>
                              <Input
                                type="number"
                                min="0"
                                className="w-16 text-center text-lg font-bold"
                                placeholder={match.awayScore?.toString() || '0'}
                                value={scores[match.id]?.away || ''}
                                onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                              />
                            </div>
                          ) : hasScore ? (
                            <div className="px-8">
                              <Badge variant="default" className="text-2xl px-6 py-2 font-bold">
                                {match.homeScore} - {match.awayScore}
                              </Badge>
                            </div>
                          ) : (
                            <div className="px-8">
                              <span className="text-2xl font-bold text-slate-400">- : -</span>
                            </div>
                          )}

                          {/* Away Team */}
                          <div className="flex-1 flex items-center gap-3">
                            {match.awayTeam.logoUrl && (
                              <img
                                src={match.awayTeam.logoUrl}
                                alt={match.awayTeam.name}
                                className="w-8 h-8 object-contain"
                              />
                            )}
                            <p className="font-semibold text-lg">{match.awayTeam.name}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            {isEditing ? (
                              <>
                                <Button onClick={() => handleUpdateScore(match.id)} size="sm" className="w-full">
                                  💾 Save
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingMatch(null);
                                    setScores((prev) => {
                                      const newScores = { ...prev };
                                      delete newScores[match.id];
                                      return newScores;
                                    });
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  ✕ Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button onClick={() => setEditingMatch(match.id)} variant="outline" size="sm" className="w-full">
                                  {hasScore ? '📊 Edit Score' : '➕ Enter Score'}
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditMatch(match)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteMatch(match)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                                  >
                                    🗑️ Delete
                                  </Button>
                                </div>
                                {hasScore && match.status?.toUpperCase() === 'FINISHED' && (
                                  <Button
                                    onClick={() => handleSyncMatch(match.id)}
                                    disabled={syncingMatch === match.id}
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                                  >
                                    {syncingMatch === match.id ? 'Syncing...' : '🔄 Sync'}
                                  </Button>
                                )}
                                <div className="flex items-center justify-center gap-2">
                                  {getMatchStatusBadge(match.status)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Match Info */}
                        <div className="mt-3 pt-3 border-t text-center text-sm text-slate-600 dark:text-slate-400">
                          {new Date(match.matchDate).toLocaleDateString()} at{' '}
                          {new Date(match.matchDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Team Statistics for this Week</CardTitle>
          </CardHeader>
          <CardContent>
            {gameWeek.teamStats.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                Team statistics will be available after matches are completed
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                    <tr className="text-left">
                      <th className="py-3 px-4 font-semibold">Team</th>
                      <th className="py-3 px-2 text-center font-semibold">P</th>
                      <th className="py-3 px-2 text-center font-semibold">W</th>
                      <th className="py-3 px-2 text-center font-semibold">D</th>
                      <th className="py-3 px-2 text-center font-semibold">L</th>
                      <th className="py-3 px-2 text-center font-semibold">GF</th>
                      <th className="py-3 px-2 text-center font-semibold">GA</th>
                      <th className="py-3 px-2 text-center font-semibold">GD</th>
                      <th className="py-3 px-2 text-center font-semibold">Pts</th>
                      <th className="py-3 px-2 text-center font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameWeek.teamStats
                      .sort((a, b) => b.points - a.points)
                      .map((stat) => (
                        <tr
                          key={stat.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {stat.team.logoUrl && (
                                <img
                                  src={stat.team.logoUrl}
                                  alt={stat.team.name}
                                  className="w-6 h-6 object-contain"
                                />
                              )}
                              <span className="font-medium">{stat.team.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">{stat.matchesPlayed}</td>
                          <td className="py-3 px-2 text-center">{stat.won}</td>
                          <td className="py-3 px-2 text-center">{stat.drawn}</td>
                          <td className="py-3 px-2 text-center">{stat.lost}</td>
                          <td className="py-3 px-2 text-center">{stat.goalsFor}</td>
                          <td className="py-3 px-2 text-center">{stat.goalsAgainst}</td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={
                                stat.goalDifference > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : stat.goalDifference < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : ''
                              }
                            >
                              {stat.goalDifference > 0 ? '+' : ''}
                              {stat.goalDifference}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-bold">{stat.points}</td>
                          <td className="py-3 px-2 text-center">
                            {stat.result && (
                              <Badge variant="outline" className="font-mono">
                                {stat.result}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Match Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
            <DialogDescription>
              Update match details including teams, date, time, status, and scores.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeTeam">Home Team</Label>
                <select
                  id="homeTeam"
                  value={editForm.homeTeamId || 0}
                  onChange={(e) => setEditForm({ ...editForm, homeTeamId: parseInt(e.target.value) })}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                >
                  <option value={0} disabled>Select Home Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="awayTeam">Away Team</Label>
                <select
                  id="awayTeam"
                  value={editForm.awayTeamId || 0}
                  onChange={(e) => setEditForm({ ...editForm, awayTeamId: parseInt(e.target.value) })}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                >
                  <option value={0} disabled>Select Away Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="matchDate">Match Date & Time</Label>
              <Input
                id="matchDate"
                type="datetime-local"
                value={editForm.matchDate}
                onChange={(e) => {
                  console.log('Match date changed to:', e.target.value);
                  setEditForm({ ...editForm, matchDate: e.target.value });
                }}
                className="mt-2"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Current value: {editForm.matchDate}</p>
            </div>

            <div>
              <Label htmlFor="matchStatus">Status</Label>
              <select
                id="matchStatus"
                value={editForm.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  console.log('Status changed to:', newStatus);

                  // If changing to SCHEDULED or POSTPONED, clear the scores
                  if (newStatus === 'SCHEDULED' || newStatus === 'POSTPONED') {
                    setEditForm({
                      ...editForm,
                      status: newStatus,
                      homeScore: null,
                      awayScore: null
                    });
                  } else {
                    setEditForm({ ...editForm, status: newStatus });
                  }
                }}
                className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
                <option value="FINISHED">Finished</option>
                <option value="POSTPONED">Postponed</option>
              </select>
              {(editForm.status === 'SCHEDULED' || editForm.status === 'POSTPONED') && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ℹ️ Scores will be cleared when status is set to {editForm.status}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Match Scores</Label>
                {(editForm.homeScore !== null || editForm.awayScore !== null) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        homeScore: null,
                        awayScore: null
                      });
                    }}
                    className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    🗑️ Clear Scores
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeScore" className="text-sm text-slate-600 dark:text-slate-400">Home Score</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    min="0"
                    value={editForm.homeScore ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, homeScore: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Score"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="awayScore" className="text-sm text-slate-600 dark:text-slate-400">Away Score</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    min="0"
                    value={editForm.awayScore ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, awayScore: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Score"
                    className="mt-2"
                  />
                </div>
              </div>
              {editForm.homeScore === null && editForm.awayScore === null && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  No scores entered - match has not been played
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditMatch}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Match Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this match? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="py-4">
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {selectedMatch.homeTeam.logoUrl && (
                    <img src={selectedMatch.homeTeam.logoUrl} alt="" className="w-6 h-6" />
                  )}
                  <span className="font-semibold">{selectedMatch.homeTeam.name}</span>
                </div>
                <span className="text-xl font-bold">vs</span>
                <div className="flex items-center gap-2">
                  {selectedMatch.awayTeam.logoUrl && (
                    <img src={selectedMatch.awayTeam.logoUrl} alt="" className="w-6 h-6" />
                  )}
                  <span className="font-semibold">{selectedMatch.awayTeam.name}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
                {new Date(selectedMatch.matchDate).toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMatch}>
              Delete Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync from API Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sync Matches from Football Data API</DialogTitle>
            <DialogDescription>
              Review matches that will be synced from football-data.org to your database
            </DialogDescription>
          </DialogHeader>

          {loadingSyncData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading sync data...</p>
              </div>
            </div>
          ) : syncData ? (
            <div className="space-y-4 py-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{syncData.summary.total}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Matches</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{syncData.summary.toCreate}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">New Matches</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{syncData.summary.toUpdate}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Updates</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{syncData.summary.cannotSync}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Cannot Sync</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Unmatched Teams Warning */}
              {syncData.unmatchedTeams.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">⚠️ Unmatched Teams:</h4>
                  <p className="text-sm text-red-800 dark:text-red-400 mb-2">
                    The following teams from the API could not be matched to teams in your database:
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-400 space-y-1">
                    {syncData.unmatchedTeams.map((teamName: string, idx: number) => (
                      <li key={idx}>• {teamName}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-red-800 dark:text-red-400 mt-2">
                    Matches with unmatched teams will be skipped.
                  </p>
                </div>
              )}

              {/* Matches Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold">Action</th>
                        <th className="py-3 px-4 text-left font-semibold">Home Team</th>
                        <th className="py-3 px-4 text-center font-semibold">Score</th>
                        <th className="py-3 px-4 text-left font-semibold">Away Team</th>
                        <th className="py-3 px-4 text-left font-semibold">Date & Time</th>
                        <th className="py-3 px-4 text-left font-semibold">Status</th>
                        <th className="py-3 px-4 text-center font-semibold">Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncData.syncPlan.map((match: any, idx: number) => (
                        <tr
                          key={idx}
                          className={`border-b border-slate-100 dark:border-slate-800 ${
                            !match.canSync ? 'bg-red-50 dark:bg-red-900/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <Badge variant={match.action === 'CREATE' ? 'default' : 'secondary'} className={
                              match.action === 'CREATE' ? 'bg-green-600' : 'bg-orange-600'
                            }>
                              {match.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{match.homeTeam.apiName}</div>
                              {match.homeTeam.dbTeam && (
                                <div className="text-xs text-slate-500">→ {match.homeTeam.dbTeam.name}</div>
                              )}
                              {!match.homeTeam.matched && (
                                <div className="text-xs text-red-600">⚠️ Not matched</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {match.homeScore !== null && match.awayScore !== null
                              ? `${match.homeScore} - ${match.awayScore}`
                              : '- : -'
                            }
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{match.awayTeam.apiName}</div>
                              {match.awayTeam.dbTeam && (
                                <div className="text-xs text-slate-500">→ {match.awayTeam.dbTeam.name}</div>
                              )}
                              {!match.awayTeam.matched && (
                                <div className="text-xs text-red-600">⚠️ Not matched</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(match.matchDate).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{match.status}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {match.canSync ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">ℹ️ What will happen:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• <strong>CREATE:</strong> New matches will be added to the database and linked to this gameweek</li>
                  <li>• <strong>UPDATE:</strong> Existing matches will have their date, time, scores, and status updated</li>
                  <li>• Matches marked as unsynced will need to be re-synced to update standings</li>
                  <li>• Only matches with matched teams will be synced</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-600 dark:text-slate-400">
              No sync data available
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)} disabled={executingSync}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteSync}
              disabled={!syncData || loadingSyncData || executingSync || syncData?.summary.toCreate + syncData?.summary.toUpdate === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {executingSync ? 'Syncing...' : `Confirm Sync (${syncData?.summary.toCreate || 0} new, ${syncData?.summary.toUpdate || 0} updates)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
