'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { standingsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

export default function StandingsPage() {
  const { user } = useAuth();
  const [standingsData, setStandingsData] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>('');

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await standingsApi.getAll();
        const data = response.data.data;
        setStandingsData(data);

        // Set first league as default selected
        if (data.length > 0) {
          setSelectedLeague(data[0].league.id.toString());
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const getLeagueFlag = (country: string): string => {
    const flags: { [key: string]: string } = {
      England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      Germany: '🇩🇪',
      Spain: '🇪🇸',
    };
    return flags[country] || '⚽';
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
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer">⚽ Football Predictions</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost">Leaderboard</Button>
              </Link>
              <Link href="/standings">
                <Button variant="default">Standings</Button>
              </Link>
              {user ? (
                <Link href="/profile">
                  <Button variant="outline">{user.username}</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            League Standings
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            View current standings for all leagues
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading standings...</div>
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
                      <span className="text-3xl">{getLeagueFlag(leagueData.league.country)}</span>
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
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
}
