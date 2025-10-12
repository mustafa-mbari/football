'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import LeagueSelector from '@/components/LeagueSelector';

interface League {
  id: number;
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
}

interface GameWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  isCurrent: boolean;
  league: League;
  _count: {
    matches: number;
    teamStats: number;
  };
}

function GameWeeksContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchGameWeeks();
  }, [user, router]);

  const fetchGameWeeks = async () => {
    try {
      // Fetch all active leagues (admin should see all leagues including those without gameweeks)
      const leaguesResponse = await api.get('/leagues?includeInactive=true');
      const allLeagues = leaguesResponse.data.data;
      setLeagues(allLeagues);

      // Fetch gameweeks
      const response = await fetch('http://localhost:7070/api/gameweeks');
      if (response.ok) {
        const data = await response.json();
        setGameWeeks(data.data);

        // Check if there's a league in URL params, otherwise use first league
        const leagueParam = searchParams.get('league');
        if (leagueParam && allLeagues.some((l: League) => l.id.toString() === leagueParam)) {
          setSelectedLeague(leagueParam);
        } else if (allLeagues.length > 0) {
          setSelectedLeague(allLeagues[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching gameweeks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeagueLogo = (league: League) => {
    if (league.logoUrl) {
      return (
        <img
          src={league.logoUrl}
          alt={league.name}
          className="w-6 h-6 object-contain inline-block"
        />
      );
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      POSTPONED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.SCHEDULED}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    // Update URL to preserve tab selection
    router.push(`/admin/gameweeks?league=${leagueId}`, { scroll: false });
  };

  const handleSyncMatches = async (leagueId?: number) => {
    setSyncing(true);
    try {
      const response = await fetch('http://localhost:7070/api/gameweeks/sync-matches', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leagueId }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}\n\nSynced: ${data.stats.synced}\nSkipped: ${data.stats.skipped}`);
        // Refresh gameweeks to show updated match counts
        await fetchGameWeeks();
      } else {
        const error = await response.json();
        alert(`Failed to sync matches: ${error.message}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync matches');
    } finally {
      setSyncing(false);
    }
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Admin Submenu */}
      <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-2 overflow-x-auto">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/leagues">
              <Button variant="ghost" size="sm">
                Manage Leagues
              </Button>
            </Link>
            <Link href="/admin/gameweeks">
              <Button variant="default" size="sm">
                Manage GameWeeks
              </Button>
            </Link>
            <Link href="/admin/matches">
              <Button variant="ghost" size="sm">
                Manage Matches
              </Button>
            </Link>
            <Link href="/admin/matches/bulk-import">
              <Button variant="ghost" size="sm">
                Bulk Import
              </Button>
            </Link>
            <Link href="/admin/standings">
              <Button variant="ghost" size="sm">
                Update Standings
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            GameWeeks Management
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Manage gameweeks, assign matches, and update team statistics
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading gameweeks...</div>
        ) : leagues.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            No leagues found. Please create a league first.
          </div>
        ) : (
          <div className="w-full">
            <LeagueSelector
              leagues={leagues}
              selectedLeagueId={selectedLeague}
              onLeagueChange={handleLeagueChange}
            />

            {leagues.filter(l => l.id.toString() === selectedLeague).map((league) => (
              <div key={league.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{league.name} - {league.season}</span>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handleSyncMatches(league.id)}
                          disabled={syncing}
                          size="sm"
                          variant="outline"
                        >
                          {syncing ? 'Syncing...' : '🔄 Sync Matches to GameWeeks'}
                        </Button>
                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                          {gameWeeks.filter(gw => gw.league.id === league.id).length} gameweeks
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                          <tr className="text-left">
                            <th className="py-3 px-4 font-semibold">Week</th>
                            <th className="py-3 px-4 font-semibold">Start Date</th>
                            <th className="py-3 px-4 font-semibold">End Date</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 text-center font-semibold">Matches</th>
                            <th className="py-3 px-4 text-center font-semibold">Team Stats</th>
                            <th className="py-3 px-4 text-center font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameWeeks
                            .filter(gw => gw.league.id === league.id)
                            .map((gameWeek) => (
                              <tr
                                key={gameWeek.id}
                                className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                  gameWeek.isCurrent ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">Week {gameWeek.weekNumber}</span>
                                    {gameWeek.isCurrent && (
                                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">CURRENT</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">{formatDate(gameWeek.startDate)}</td>
                                <td className="py-3 px-4">{formatDate(gameWeek.endDate)}</td>
                                <td className="py-3 px-4">{getStatusBadge(gameWeek.status)}</td>
                                <td className="py-3 px-4 text-center">{gameWeek._count.matches}</td>
                                <td className="py-3 px-4 text-center">{gameWeek._count.teamStats}</td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push(`/admin/gameweeks/${gameWeek.id}/edit`)}
                                    >
                                      ✏️ Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push(`/admin/gameweeks/${gameWeek.id}`)}
                                    >
                                      Manage
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GameWeeksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <GameWeeksContent />
    </Suspense>
  );
}
