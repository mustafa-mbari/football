'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { matchesApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
  code: string;
  stadium?: string;
}

interface Match {
  id: number;
  matchDate: string;
  status: string;
  weekNumber?: number;
  homeTeam: Team;
  awayTeam: Team;
  league: {
    id: number;
    name: string;
  };
}

interface GameWeek {
  id: number;
  weekNumber: number;
  league: {
    id: number;
    name: string;
    country: string;
  };
}

export default function AddMatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [gameWeek, setGameWeek] = useState<GameWeek | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [isPostponed, setIsPostponed] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchData();
  }, [user, router, params.id]);

  const fetchData = async () => {
    try {
      // Fetch gameweek info
      const gwResponse = await fetch(`http://localhost:7070/api/gameweeks/${params.id}`);
      if (gwResponse.ok) {
        const gwData = await gwResponse.json();
        setGameWeek(gwData.data);

        // Fetch teams for this league
        const teamsResponse = await fetch(`http://localhost:7070/api/teams/league/${gwData.data.league.id}`);
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHomeTeamId('');
    setAwayTeamId('');
    setMatchDate('');
    setMatchTime('');
    setStatus('SCHEDULED');
    setIsPostponed(false);
  };

  const setCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setMatchTime(`${hours}:${minutes}`);
  };

  const handleCreateMatch = async (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();

    if (!homeTeamId || !awayTeamId || !matchDate || !matchTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (homeTeamId === awayTeamId) {
      alert('Home team and away team must be different');
      return;
    }

    try {
      setCreating(true);
      setSuccessMessage('');

      // Get team names for success message
      const homeTeam = teams.find(t => t.id === parseInt(homeTeamId));
      const awayTeam = teams.find(t => t.id === parseInt(awayTeamId));

      // Combine date and time
      const dateTimeString = `${matchDate}T${matchTime}:00`;

      const response = await fetch(`http://localhost:7070/api/gameweeks/${params.id}/create-match`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId: parseInt(homeTeamId),
          awayTeamId: parseInt(awayTeamId),
          matchDate: dateTimeString,
          status,
          isPostponed,
        }),
      });

      if (response.ok) {
        if (addAnother) {
          setSuccessMessage(`Match created: ${homeTeam?.name} vs ${awayTeam?.name}. Add another one below.`);
          resetForm();
          // Scroll to top to see success message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          router.push(`/admin/gameweeks/${params.id}`);
        }
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create match');
      }
    } catch (error) {
      alert('Failed to create match');
      console.error(error);
    } finally {
      setCreating(false);
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

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameWeek) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">GameWeek not found</p>
          <Link href="/admin/gameweeks">
            <Button>Back to GameWeeks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Admin Submenu */}
      <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-2 overflow-x-auto">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                🏠 Dashboard
              </Button>
            </Link>
            <Link href="/admin/gameweeks">
              <Button variant="default" size="sm">
                📅 Manage GameWeeks
              </Button>
            </Link>
            <Link href="/admin/matches">
              <Button variant="ghost" size="sm">
                ⚽ Manage Matches
              </Button>
            </Link>
            <Link href="/admin/matches/bulk-import">
              <Button variant="ghost" size="sm">
                📋 Bulk Import
              </Button>
            </Link>
            <Link href="/admin/standings">
              <Button variant="ghost" size="sm">
                📊 Update Standings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/admin/gameweeks/${params.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Week {gameWeek.weekNumber}
            </Button>
          </Link>
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Create New Match for Week {gameWeek.weekNumber}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {getLeagueFlag(gameWeek.league.country)} {gameWeek.league.name}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-lg border px-3 py-2 shadow-sm">
            <p className="text-sm text-green-900 dark:text-green-300 font-medium">
              ✓ {successMessage}
            </p>
          </div>
        )}

        {/* Create Match Form */}
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMatch} className="space-y-6">
              {/* Team Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Home Team *
                  </label>
                  <select
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Home Team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Away Team *
                  </label>
                  <select
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Away Team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id} disabled={team.id === parseInt(homeTeamId)}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Match Date *
                  </label>
                  <Input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Match Time *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={setCurrentTime}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      🕒 Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live</option>
                    <option value="FINISHED">Finished</option>
                  </select>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="isPostponed"
                    checked={isPostponed}
                    onChange={(e) => setIsPostponed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPostponed" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mark as Postponed
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  onClick={(e) => handleCreateMatch(e, false)}
                  disabled={creating}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {creating ? 'Creating...' : '✓ Create Match'}
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleCreateMatch(e, true)}
                  disabled={creating}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? 'Creating...' : '➕ Create & Add Another'}
                </Button>
                <Link href={`/admin/gameweeks/${params.id}`}>
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
