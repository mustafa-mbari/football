'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { leaderboardApi, predictionsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  totalPoints: number;
  totalPredictions: number;
}

interface UserStats {
  totalPredictions: number;
  finishedPredictions: number;
  totalPoints: number;
  exactScores: number;
  correctOutcomes: number;
  averagePoints: string;
}

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

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardResponse, statsResponse, predictionsResponse] = await Promise.all([
          leaderboardApi.get(),
          leaderboardApi.getUserStats(),
          predictionsApi.getUserPredictions(),
        ]);

        setLeaderboard(leaderboardResponse.data.data);
        setStats(statsResponse.data.data);

        // Get only the 5 most recent predictions
        const allPredictions = predictionsResponse.data.data;
        setRecentPredictions(allPredictions.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const accuracy = stats && stats.finishedPredictions > 0
    ? ((stats.exactScores + stats.correctOutcomes) / stats.finishedPredictions * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Here's an overview of your predictions and the current leaderboard
          </p>
        </div>

        {/* Stats Cards Grid */}
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
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.finishedPredictions} finished, {stats.totalPredictions - stats.finishedPredictions} upcoming
                  </p>
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

        {/* Main Grid: Leaderboard + Recent Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Leaderboard
              </CardTitle>
              <CardDescription>Top predictors across all leagues</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                  No predictions yet. Be the first!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.slice(0, 10).map((entry) => (
                      <TableRow key={entry.id} className={entry.id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{entry.rank}</span>
                            <span className="text-lg">{getMedalEmoji(entry.rank)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {entry.username}
                          {entry.id === user?.id && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.totalPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Predictions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Predictions</CardTitle>
                  <CardDescription>Your last 5 predictions</CardDescription>
                </div>
                <Link href="/profile">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View All
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentPredictions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No predictions yet</p>
                  <Link href="/predict">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Make Your First Prediction
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPredictions.map((prediction) => (
                    <div key={prediction.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">
                            {prediction.match.league.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(prediction.match.matchDate).toLocaleDateString()}
                          </p>
                        </div>
                        {prediction.match.status === 'FINISHED' && prediction.points !== null && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            prediction.points === 3 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            prediction.points === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {prediction.points === 3 && '🎯 '}
                            {prediction.points === 1 && '✓ '}
                            {prediction.points === 0 && '✗ '}
                            {prediction.points} pts
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{prediction.match.homeTeam.name}</span>
                        <div className="px-3">
                          <span className="font-bold">{prediction.predictedHomeScore} - {prediction.predictedAwayScore}</span>
                          {prediction.match.status === 'FINISHED' && (
                            <span className="text-xs text-slate-500 ml-2">
                              ({prediction.match.homeScore} - {prediction.match.awayScore})
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-right">{prediction.match.awayTeam.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scoring System Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Scoring System</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>🎯 <strong>3 points</strong> - Exact score prediction</li>
            <li>✓ <strong>1 point</strong> - Correct outcome (win/draw/loss)</li>
            <li>✗ <strong>0 points</strong> - Incorrect prediction</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
