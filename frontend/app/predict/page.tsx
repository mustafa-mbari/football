'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { leaguesApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

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

function PredictContent() {
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

  const getLeagueFlag = (country: string): string => {
    const flags: { [key: string]: string } = {
      England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      Germany: '🇩🇪',
      Spain: '🇪🇸',
    };
    return flags[country] || '⚽';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            🎯 Make Predictions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Choose a league to start predicting match results
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading leagues...</p>
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p className="mb-4">No leagues available at the moment.</p>
            <p className="text-sm">Please check back later or contact an administrator.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league) => (
                <Link key={league.id} href={`/leagues/${league.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full hover:border-blue-500 dark:hover:border-blue-400">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{league.name}</span>
                        <span className="text-3xl">{getLeagueFlag(league.country)}</span>
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
                      <div className="mt-4">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                          <span>Make predictions →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Info Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">📅 Select a Week</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                  Choose a league and then select the week you want to make predictions for
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg">⚽ Predict Scores</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                  Enter your predicted scores for each match before kickoff
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-lg">🏆 Earn Points</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                  Get 3 points for exact scores, 1 point for correct outcomes
                </CardContent>
              </Card>
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3 flex items-center gap-2">
                💡 Prediction Tips
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-2">
                <li>• Predictions must be made before the match starts</li>
                <li>• You can update your prediction anytime before kickoff</li>
                <li>• Check team form and head-to-head records in the Tables section</li>
                <li>• Join the discussion in Groups to see what others are predicting</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function PredictPage() {
  return (
    <ProtectedRoute>
      <PredictContent />
    </ProtectedRoute>
  );
}
