'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { standingsApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
  code: string;
}

interface Standing {
  id: number;
  position: number;
  teamId: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}

interface League {
  id: number;
  name: string;
  country: string;
  season: string;
}

interface LeagueStanding {
  league: League;
  standings: Standing[];
}

export default function UpdateStandingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [standingsData, setStandingsData] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchStandings();
  }, [user, router]);

  const fetchStandings = async () => {
    try {
      const response = await standingsApi.getAll();
      const data = response.data.data;
      setStandingsData(data);

      if (data.length > 0) {
        setSelectedLeague(data[0].league.id.toString());
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (leagueId: number) => {
    const confirmed = confirm(
      'This will recalculate standings from scratch based on all finished matches. Continue?'
    );
    if (!confirmed) return;

    try {
      setRecalculating(true);
      const response = await fetch(`http://localhost:7070/api/tables/recalculate/${leagueId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message ||'Standings recalculated successfully!');
        await fetchStandings();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to recalculate standings');
      }
    } catch (error) {
      alert('Failed to recalculate standings');
      console.error(error);
    } finally {
      setRecalculating(false);
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            League Standings
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            View and verify current league standings
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading standings...</p>
          </div>
        ) : standingsData.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            No standings data available. Please ensure the database is seeded.
          </div>
        ) : (
          <Tabs value={selectedLeague} onValueChange={setSelectedLeague} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {standingsData.map((leagueData) => (
                <TabsTrigger key={leagueData.league.id} value={leagueData.league.id.toString()}>
                  <span className="mr-2">{getLeagueFlag(leagueData.league.country)}</span>
                  {leagueData.league.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {standingsData.map((leagueData) => (
              <TabsContent key={leagueData.league.id} value={leagueData.league.id.toString()}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{leagueData.league.name} - {leagueData.league.season}</span>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handleRecalculate(leagueData.league.id)}
                          disabled={recalculating}
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          {recalculating ? 'Recalculating...' : '🔄 Recalculate Tables'}
                        </Button>
                        <span className="text-3xl">{getLeagueFlag(leagueData.league.country)}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                          <tr className="text-left">
                            <th className="py-3 px-2 font-semibold">#</th>
                            <th className="py-3 px-4 font-semibold">Team</th>
                            <th className="py-3 px-2 text-center font-semibold">P</th>
                            <th className="py-3 px-2 text-center font-semibold">W</th>
                            <th className="py-3 px-2 text-center font-semibold">D</th>
                            <th className="py-3 px-2 text-center font-semibold">L</th>
                            <th className="py-3 px-2 text-center font-semibold">GF</th>
                            <th className="py-3 px-2 text-center font-semibold">GA</th>
                            <th className="py-3 px-2 text-center font-semibold">GD</th>
                            <th className="py-3 px-2 text-center font-semibold">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leagueData.standings.map((standing, index) => (
                            <tr
                              key={standing.id}
                              className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                index < 4
                                  ? 'bg-blue-50 dark:bg-blue-950/30'
                                  : index >= leagueData.standings.length - 3
                                  ? 'bg-red-50 dark:bg-red-950/30'
                                  : ''
                              }`}
                            >
                              <td className="py-3 px-2 font-semibold">
                                <div className="flex items-center gap-2">
                                  {standing.position}
                                  {index < 4 && (
                                    <span className="w-1 h-6 bg-blue-500 rounded"></span>
                                  )}
                                  {index >= leagueData.standings.length - 3 && (
                                    <span className="w-1 h-6 bg-red-500 rounded"></span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium">{standing.team.name}</span>
                              </td>
                              <td className="py-3 px-2 text-center">{standing.played}</td>
                              <td className="py-3 px-2 text-center">{standing.won}</td>
                              <td className="py-3 px-2 text-center">{standing.drawn}</td>
                              <td className="py-3 px-2 text-center">{standing.lost}</td>
                              <td className="py-3 px-2 text-center">{standing.goalsFor}</td>
                              <td className="py-3 px-2 text-center">{standing.goalsAgainst}</td>
                              <td className="py-3 px-2 text-center">
                                <span
                                  className={
                                    standing.goalDifference > 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : standing.goalDifference < 0
                                      ? 'text-red-600 dark:text-red-400'
                                      : ''
                                  }
                                >
                                  {standing.goalDifference > 0 ? '+' : ''}
                                  {standing.goalDifference}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center font-bold">{standing.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded"></span>
                        <span>UEFA Champions League</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded"></span>
                        <span>Relegation</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        <strong>Note:</strong> Standings are automatically calculated from match results.
                        To update standings, enter match scores in the Manage Matches section.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
    </main>
  );
}
