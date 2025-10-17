'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leaderboardApi, predictionsApi, groupsApi, leaguesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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
  totalPoints: number | null;
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

interface League {
  id: number;
  name: string;
  logoUrl?: string;
}

interface Group {
  id: number;
  name: string;
  isPublic: boolean;
  leagueId?: number;
  league?: League;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  points: number;
  avatar?: string;
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  // Stats and predictions
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);

  // Public groups leaderboard
  const [leagues, setLeagues] = useState<League[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [publicLeaderboard, setPublicLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Private groups leaderboard
  const [privateGroups, setPrivateGroups] = useState<Group[]>([]);
  const [selectedPrivateGroup, setSelectedPrivateGroup] = useState<number | null>(null);
  const [privateLeaderboard, setPrivateLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, predictionsResponse, leaguesResponse, publicGroupsResponse, userGroupsResponse] = await Promise.all([
          leaderboardApi.getUserStats(),
          predictionsApi.getUserPredictions(),
          leaguesApi.getAll(),
          groupsApi.getPublic(),
          groupsApi.getUserGroups(),
        ]);

        setStats(statsResponse.data.data);

        // Get only the 5 most recent predictions
        const allPredictions = predictionsResponse.data.data;
        setRecentPredictions(allPredictions.slice(0, 5));

        // Set leagues
        const leaguesData = leaguesResponse.data.data;
        setLeagues(leaguesData);

        // Set public groups
        const publicGroupsData = publicGroupsResponse.data.data;
        setPublicGroups(publicGroupsData);
        if (publicGroupsData.length > 0) {
          setSelectedLeague(publicGroupsData[0].leagueId || null);
        }

        // Set private groups
        const allUserGroups = userGroupsResponse.data.data;
        const privateGroupsData = allUserGroups.filter((g: Group) => !g.isPublic);
        setPrivateGroups(privateGroupsData);
        if (privateGroupsData.length > 0) {
          setSelectedPrivateGroup(privateGroupsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch public group leaderboard when league changes
  useEffect(() => {
    if (selectedLeague) {
      fetchPublicLeaderboard(selectedLeague);
    }
  }, [selectedLeague]);

  // Fetch private group leaderboard when group changes
  useEffect(() => {
    if (selectedPrivateGroup) {
      fetchPrivateLeaderboard(selectedPrivateGroup);
    }
  }, [selectedPrivateGroup]);

  const fetchPublicLeaderboard = async (leagueId: number) => {
    try {
      const publicGroup = publicGroups.find(g => g.leagueId === leagueId);
      if (publicGroup) {
        const response = await groupsApi.getLeaderboard(publicGroup.id, leagueId);
        setPublicLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching public leaderboard:', error);
    }
  };

  const fetchPrivateLeaderboard = async (groupId: number) => {
    try {
      const response = await groupsApi.getLeaderboard(groupId);
      setPrivateLeaderboard(response.data.data);
    } catch (error) {
      console.error('Error fetching private leaderboard:', error);
    }
  };

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
            Here's an overview of your predictions and group standings
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
                <p className="text-sm text-green-100 mt-1">Perfect predictions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-yellow-100">Correct Outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.correctOutcomes}</div>
                <p className="text-sm text-yellow-100 mt-1">Close predictions</p>
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

        {/* Two Leaderboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Public Groups Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Public League Standings
              </CardTitle>
              <CardDescription>Select a league to view standings</CardDescription>

              {/* League Selector */}
              {leagues.length > 0 && (
                <div className="mt-4">
                  <Select
                    value={selectedLeague?.toString() || ''}
                    onValueChange={(value) => setSelectedLeague(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                      {publicGroups.map((group) => (
                        <SelectItem key={group.id} value={group.leagueId?.toString() || ''}>
                          {group.league?.name || group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {publicLeaderboard.length === 0 ? (
                <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                  No predictions yet. Make your first prediction to join the leaderboard!
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
                    {publicLeaderboard.slice(0, 10).map((entry) => (
                      <TableRow key={entry.userId} className={entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{entry.rank}</span>
                            <span className="text-lg">{getMedalEmoji(entry.rank)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {entry.username}
                          {entry.userId === user?.id && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Private Groups Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Private Groups
              </CardTitle>
              <CardDescription>
                {privateGroups.length === 0 ? 'Join or create a private group' : 'Select a group to view standings'}
              </CardDescription>

              {/* Private Group Selector */}
              {privateGroups.length > 0 && (
                <div className="mt-4">
                  <Select
                    value={selectedPrivateGroup?.toString() || ''}
                    onValueChange={(value) => setSelectedPrivateGroup(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {privateGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name} {group.league ? `(${group.league.name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {privateGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    You haven't joined any private groups yet
                  </p>
                  <Link href="/groups">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Explore Groups
                    </button>
                  </Link>
                </div>
              ) : privateLeaderboard.length === 0 ? (
                <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                  No predictions in this group yet
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
                    {privateLeaderboard.slice(0, 10).map((entry) => (
                      <TableRow key={entry.userId} className={entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{entry.rank}</span>
                            <span className="text-lg">{getMedalEmoji(entry.rank)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {entry.username}
                          {entry.userId === user?.id && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card className="mb-8">
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
                      {prediction.match.status === 'FINISHED' && prediction.totalPoints !== null && (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          prediction.totalPoints >= 5 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          prediction.totalPoints > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {prediction.totalPoints >= 5 && '🎯 '}
                          {prediction.totalPoints > 0 && prediction.totalPoints < 5 && '✓ '}
                          {prediction.totalPoints === 0 && '✗ '}
                          {prediction.totalPoints} pts
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

        {/* Scoring System Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Scoring System</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>🎯 <strong>9 points</strong> - Perfect prediction (exact score + bonus)</li>
            <li>✓ <strong>3-6 points</strong> - Partial points (correct elements)</li>
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
