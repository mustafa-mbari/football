'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { leaguesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface League {
  id: number;
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
  _count?: {
    teams: number;
    matches: number;
  };
}

export default function Home() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await leaguesApi.getAll();
        setLeagues(response.data.data);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">⚽ Football Predictions</h1>
            <div className="flex gap-4">
              <Link href="/standings">
                <Button variant="ghost">Standings</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost">Leaderboard</Button>
              </Link>
              {user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                <Link href="/admin">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
              {user ? (
                <Link href="/profile">
                  <Button variant="default">{user.username}</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="default">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Predict Football Matches
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Make predictions for matches across top leagues and compete on the leaderboard!
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading leagues...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <Link key={league.id} href={`/leagues/${league.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{league.name}</span>
                      <span className="text-2xl">{getLeagueFlag(league.country)}</span>
                    </CardTitle>
                    <CardDescription>
                      {league.country} • {league.season}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>{league._count?.teams || 0} Teams</span>
                      <span>{league._count?.matches || 0} Matches</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && leagues.length === 0 && (
          <div className="text-center text-slate-600 dark:text-slate-400">
            No leagues available. Please seed the database.
          </div>
        )}
      </main>
    </div>
  );
}

function getLeagueFlag(country: string): string {
  const flags: { [key: string]: string } = {
    England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    Germany: '🇩🇪',
    Spain: '🇪🇸',
  };
  return flags[country] || '⚽';
}
