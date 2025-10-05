'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { predictionsApi, leaderboardApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Prediction {
  id: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  points: number | null;
  createdAt: string;
  match: {
    id: number;
    matchDate: string;
    status: string;
    homeScore?: number;
    awayScore?: number;
    homeTeam: { name: string };
    awayTeam: { name: string };
    league: { name: string };
  };
}

interface UserStats {
  totalPredictions: number;
  finishedPredictions: number;
  totalPoints: number;
  exactScores: number;
  correctOutcomes: number;
  averagePoints: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'finished'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        const [predictionsResponse, statsResponse] = await Promise.all([
          predictionsApi.getUserPredictions(),
          leaderboardApi.getUserStats()
        ]);

        setPredictions(predictionsResponse.data.data);
        setStats(statsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredPredictions = predictions.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return p.match.status === 'scheduled';
    if (activeTab === 'finished') return p.match.status === 'finished';
    return true;
  });

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  const accuracy = stats && stats.finishedPredictions > 0
    ? ((stats.exactScores + stats.correctOutcomes) / stats.finishedPredictions * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer">⚽ Football Predictions</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/leaderboard">
                <Button variant="ghost">Leaderboard</Button>
              </Link>
              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.username}</h2>
              <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
              <p className="text-sm text-slate-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-100">Total Points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalPoints}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-100">Exact Scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.exactScores}</div>
                <p className="text-sm text-green-100 mt-1">3 points each</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-yellow-100">Correct Outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.correctOutcomes}</div>
                <p className="text-sm text-yellow-100 mt-1">1 point each</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-purple-100">Accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{accuracy}%</div>
                <p className="text-sm text-purple-100 mt-1">Win rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Summary */}
        {stats && stats.finishedPredictions > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Predictions Made</span>
                    <span className="font-semibold">{stats.totalPredictions}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(stats.finishedPredictions / stats.totalPredictions) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats.finishedPredictions} finished, {stats.totalPredictions - stats.finishedPredictions} upcoming</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.exactScores}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Perfect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.correctOutcomes}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Close</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.finishedPredictions - stats.exactScores - stats.correctOutcomes}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Missed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictions List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Predictions</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                >
                  All ({predictions.length})
                </Button>
                <Button
                  variant={activeTab === 'upcoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming ({predictions.filter(p => p.match.status === 'scheduled').length})
                </Button>
                <Button
                  variant={activeTab === 'finished' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('finished')}
                >
                  Finished ({predictions.filter(p => p.match.status === 'finished').length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {activeTab === 'all' && 'No predictions yet.'}
                  {activeTab === 'upcoming' && 'No upcoming predictions.'}
                  {activeTab === 'finished' && 'No finished predictions.'}
                </p>
                <Link href="/">
                  <Button>Make Your First Prediction</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPredictions.map((prediction) => (
                  <div key={prediction.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">
                          {prediction.match.league.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(prediction.match.matchDate).toLocaleDateString()} at {new Date(prediction.match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {prediction.match.status === 'finished' && prediction.points !== null && (
                        <Badge variant={prediction.points === 3 ? 'default' : prediction.points === 1 ? 'secondary' : 'destructive'}>
                          {prediction.points === 3 && '🎯 '}
                          {prediction.points === 1 && '✓ '}
                          {prediction.points === 0 && '✗ '}
                          {prediction.points} {prediction.points === 1 ? 'pt' : 'pts'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{prediction.match.homeTeam.name}</p>
                      </div>
                      <div className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{prediction.predictedHomeScore} - {prediction.predictedAwayScore}</span>
                          {prediction.match.status === 'finished' && (
                            <span className="text-sm text-slate-500">
                              (Actual: {prediction.match.homeScore} - {prediction.match.awayScore})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-semibold">{prediction.match.awayTeam.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
