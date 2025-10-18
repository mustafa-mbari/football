'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { standingsApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import LeagueSelector from '@/components/LeagueSelector';

interface Team {
  id: number;
  name: string;
  shortName: string;
  code: string;
  logoUrl?: string;
  primaryColor?: string;
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
  nextOpponent?: Team | null;
}

interface League {
  id: number;
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
}

interface LeagueStanding {
  league: League;
  standings: Standing[];
}

function TablesContent() {
  const [standingsData, setStandingsData] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>('');

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const response = await standingsApi.getAll();
      const data = response.data.data;
      setStandingsData(data);

      // Set first league as default selected
      if (data.length > 0 && !selectedLeague) {
        setSelectedLeague(data[0].league.id.toString());
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

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

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W':
        return <img src="/logos/form/W.svg" alt="Win" className="w-6 h-6" />;
      case 'D':
        return <img src="/logos/form/D.svg" alt="Draw" className="w-6 h-6" />;
      case 'L':
        return <img src="/logos/form/L.svg" alt="Loss" className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              League Tables
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              View current standings for all leagues
            </p>
          </div>
          <Button
            onClick={fetchStandings}
            disabled={loading}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading standings...</div>
        ) : standingsData.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            No standings data available. Please ensure the database is seeded.
          </div>
        ) : (
          <div className="w-full">
            <LeagueSelector
              leagues={standingsData.map(ld => ld.league)}
              selectedLeagueId={selectedLeague}
              onLeagueChange={setSelectedLeague}
            />

            {standingsData.filter(ld => ld.league.id.toString() === selectedLeague).map((leagueData) => (
              <div key={leagueData.league.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{leagueData.league.name} - {leagueData.league.season}</span>
                      {leagueData.league.logoUrl && (
                        <img
                          src={leagueData.league.logoUrl}
                          alt={leagueData.league.name}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Desktop/Tablet Table View - Hidden on mobile */}
                    <div className="hidden sm:block overflow-x-auto">
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
                            <th className="py-3 px-2 text-center font-semibold">Next</th>
                            <th className="py-3 px-4 text-center font-semibold">Form</th>
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
                                <div className="flex items-center gap-3">
                                  {standing.team.logoUrl && (
                                    <img
                                      src={standing.team.logoUrl}
                                      alt={standing.team.name}
                                      className="w-6 h-6 object-contain"
                                    />
                                  )}
                                  <span className="font-medium">{standing.team.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">{standing.played}</td>
                              <td className="py-3 px-2 text-center">{standing.won}</td>
                              <td className="py-3 px-2 text-center">{standing.drawn}</td>
                              <td className="py-3 px-2 text-center">{standing.lost}</td>
                              <td className="py-3 px-2 text-center">{standing.goalsFor}</td>
                              <td className="py-3 px-2 text-center">{standing.goalsAgainst}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={standing.goalDifference > 0 ? 'text-green-600 dark:text-green-400' : standing.goalDifference < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                                  {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center font-bold">{standing.points}</td>
                              <td className="py-3 px-2 text-center">
                                {standing.nextOpponent ? (
                                  <div className="flex justify-center">
                                    <img
                                      src={standing.nextOpponent.logoUrl}
                                      alt={standing.nextOpponent.name}
                                      className="w-5 h-5 object-contain"
                                      title={standing.nextOpponent.name}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {standing.form && (
                                  <div className="flex gap-1 justify-center">
                                    {standing.form.split('').slice(-5).map((result, i) => (
                                      <div key={i}>{getFormIcon(result)}</div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View - Visible only on mobile */}
                    <div className="sm:hidden space-y-3">
                      {leagueData.standings.map((standing, index) => (
                        <div
                          key={standing.id}
                          className={`p-4 rounded-lg border ${
                            index < 4
                              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                              : index >= leagueData.standings.length - 3
                              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {/* Position and Team */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                  {standing.position}
                                </span>
                                {index < 4 && (
                                  <span className="w-1 h-6 bg-blue-500 rounded"></span>
                                )}
                                {index >= leagueData.standings.length - 3 && (
                                  <span className="w-1 h-6 bg-red-500 rounded"></span>
                                )}
                              </div>
                              {standing.team.logoUrl && (
                                <img
                                  src={standing.team.logoUrl}
                                  alt={standing.team.name}
                                  className="w-8 h-8 object-contain flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {standing.team.name}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {standing.points}
                              </div>
                              <div className="text-xs text-slate-500">pts</div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">P</div>
                              <div className="font-semibold">{standing.played}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">W-D-L</div>
                              <div className="font-semibold">
                                {standing.won}-{standing.drawn}-{standing.lost}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">GF-GA</div>
                              <div className="font-semibold">
                                {standing.goalsFor}-{standing.goalsAgainst}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">GD</div>
                              <div
                                className={`font-semibold ${
                                  standing.goalDifference > 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : standing.goalDifference < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : ''
                                }`}
                              >
                                {standing.goalDifference > 0 ? '+' : ''}
                                {standing.goalDifference}
                              </div>
                            </div>
                          </div>

                          {/* Form and Next Opponent */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">Form:</span>
                              {standing.form && (
                                <div className="flex gap-1">
                                  {standing.form.split('').slice(-5).map((result, i) => (
                                    <div key={i}>{getFormIcon(result)}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {standing.nextOpponent && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Next:</span>
                                <img
                                  src={standing.nextOpponent.logoUrl}
                                  alt={standing.nextOpponent.name}
                                  className="w-5 h-5 object-contain"
                                  title={standing.nextOpponent.name}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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

export default function TablesPage() {
  return (
    <ProtectedRoute>
      <TablesContent />
    </ProtectedRoute>
  );
}
