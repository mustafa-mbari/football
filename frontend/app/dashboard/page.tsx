'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leaderboardApi, predictionsApi, groupsApi, leaguesApi, matchesApi } from '@/lib/api';
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
    homeTeam: {
      name: string;
      shortName?: string;
      logoUrl?: string;
    };
    awayTeam: {
      name: string;
      shortName?: string;
      logoUrl?: string;
    };
    league: { name: string };
  };
}

interface Match {
  id: number;
  matchDate: string;
  status: string;
  weekNumber: number;
  homeScore?: number;
  awayScore?: number;
  homeTeam: {
    name: string;
    shortName?: string;
    logoUrl?: string;
  };
  awayTeam: {
    name: string;
    shortName?: string;
    logoUrl?: string;
  };
  league: { name: string };
}

interface League {
  id: number;
  name: string;
  logoUrl?: string;
  priority: number;
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
  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);

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
        const [statsResponse, predictionsResponse, leaguesResponse, publicGroupsResponse, userGroupsResponse, finishedMatchesResponse] = await Promise.all([
          leaderboardApi.getUserStats(),
          predictionsApi.getUserPredictions(),
          leaguesApi.getAll(),
          groupsApi.getPublic(),
          groupsApi.getUserGroups(),
          matchesApi.getAll(undefined, 'FINISHED'),
        ]);

        setStats(statsResponse.data.data);

        // Get only the 5 most recent predictions
        const allPredictions = predictionsResponse.data.data;
        setRecentPredictions(allPredictions.slice(0, 5));

        // Get only the 5 most recent finished matches, sorted by match date (most recent first)
        const allFinishedMatches = finishedMatchesResponse.data.data;
        const sortedFinishedMatches = allFinishedMatches.sort((a: Match, b: Match) => {
          return new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
        });
        setFinishedMatches(sortedFinishedMatches.slice(0, 5));

        // Set leagues
        const leaguesData = leaguesResponse.data.data;
        setLeagues(leaguesData);

        // Set public groups
        const publicGroupsData = publicGroupsResponse.data.data;
        setPublicGroups(publicGroupsData);
        if (publicGroupsData.length > 0) {
          // Sort groups by league priority and select the one with priority 1 (or lowest priority)
          const sortedGroups = [...publicGroupsData].sort((a, b) => {
            const priorityA = a.league?.priority ?? 999;
            const priorityB = b.league?.priority ?? 999;
            return priorityA - priorityB;
          });
          setSelectedLeague(sortedGroups[0].leagueId || null);
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
          <>
            {/* Mobile: Single Compact Card */}
            <Card className="md:hidden mb-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {/* Total Points */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <p className="text-[10px] text-blue-100 mb-0.5">Total Points</p>
                    <p className="text-lg font-bold">{stats.totalPoints}</p>
                  </div>

                  {/* Exact Scores */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <p className="text-[10px] text-green-100 mb-0.5">Exact Scores</p>
                    <p className="text-lg font-bold">{stats.exactScores}</p>
                  </div>

                  {/* Correct Outcomes */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <p className="text-[10px] text-yellow-100 mb-0.5">Correct Outcomes</p>
                    <p className="text-lg font-bold">{stats.correctOutcomes}</p>
                  </div>

                  {/* Accuracy */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <p className="text-[10px] text-purple-100 mb-0.5">Accuracy</p>
                    <p className="text-lg font-bold">{accuracy}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop: Four Separate Cards */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          </>
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
                      {publicGroups
                        .sort((a, b) => {
                          const priorityA = a.league?.priority ?? 999;
                          const priorityB = b.league?.priority ?? 999;
                          return priorityA - priorityB;
                        })
                        .map((group) => (
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

        {/* Recent Predictions and Last Match Results - Desktop Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  <div
                    key={prediction.id}
                    className="group relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50
                               rounded-xl p-4 border border-slate-200 dark:border-slate-700
                               hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700
                               transition-all duration-300"
                  >
                    {/* League and Date Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {prediction.match.league.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(prediction.match.matchDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {prediction.match.status === 'FINISHED' && prediction.totalPoints !== null && (
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                          prediction.totalPoints >= 5 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                          prediction.totalPoints > 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                          'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        }`}>
                          {prediction.totalPoints >= 5 && '🎯 '}
                          {prediction.totalPoints > 0 && prediction.totalPoints < 5 && '✓ '}
                          {prediction.totalPoints === 0 && '✗ '}
                          {prediction.totalPoints} pts
                        </span>
                      )}
                    </div>

                    {/* Match Display - Desktop & Tablet */}
                    <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 items-center">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-xl shadow-sm border border-slate-300 dark:border-slate-600">
                          {prediction.match.homeTeam.logoUrl ? (
                            <img
                              src={prediction.match.homeTeam.logoUrl}
                              alt={prediction.match.homeTeam.name}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={prediction.match.homeTeam.name}>
                            {prediction.match.homeTeam.name}
                          </p>
                          {prediction.match.homeTeam.shortName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {prediction.match.homeTeam.shortName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score Section */}
                      <div className="flex flex-col items-center gap-2 px-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {prediction.predictedHomeScore}
                          </span>
                          <span className="text-xl font-semibold text-slate-400 dark:text-slate-600">-</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {prediction.predictedAwayScore}
                          </span>
                        </div>
                        {prediction.match.status === 'FINISHED' && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            <span>Actual:</span>
                            <span className="font-semibold">
                              {prediction.match.homeScore} - {prediction.match.awayScore}
                            </span>
                          </div>
                        )}
                        {prediction.match.status !== 'FINISHED' && (
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            Your Prediction
                          </span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-row-reverse min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-xl shadow-sm border border-slate-300 dark:border-slate-600">
                          {prediction.match.awayTeam.logoUrl ? (
                            <img
                              src={prediction.match.awayTeam.logoUrl}
                              alt={prediction.match.awayTeam.name}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={prediction.match.awayTeam.name}>
                            {prediction.match.awayTeam.name}
                          </p>
                          {prediction.match.awayTeam.shortName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {prediction.match.awayTeam.shortName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Display - Mobile */}
                    <div className="sm:hidden flex flex-col gap-3">
                      {/* Home Team */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-lg shadow-sm border border-slate-300 dark:border-slate-600">
                          {prediction.match.homeTeam.logoUrl ? (
                            <img
                              src={prediction.match.homeTeam.logoUrl}
                              alt={prediction.match.homeTeam.name}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={prediction.match.homeTeam.name}>
                            {prediction.match.homeTeam.name}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400 min-w-[2rem] text-center">
                          {prediction.predictedHomeScore}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-lg shadow-sm border border-slate-300 dark:border-slate-600">
                          {prediction.match.awayTeam.logoUrl ? (
                            <img
                              src={prediction.match.awayTeam.logoUrl}
                              alt={prediction.match.awayTeam.name}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={prediction.match.awayTeam.name}>
                            {prediction.match.awayTeam.name}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400 min-w-[2rem] text-center">
                          {prediction.predictedAwayScore}
                        </span>
                      </div>

                      {/* Actual Score for Mobile */}
                      {prediction.match.status === 'FINISHED' && (
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Actual Score:</span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {prediction.match.homeScore} - {prediction.match.awayScore}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Match Results */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Last Match Results</CardTitle>
              <CardDescription>Recent finished matches</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {finishedMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No finished matches yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {finishedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="group relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50
                               rounded-xl p-4 border border-slate-200 dark:border-slate-700
                               hover:shadow-lg hover:border-green-300 dark:hover:border-green-700
                               transition-all duration-300"
                  >
                    {/* League and Date Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {match.league.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(match.matchDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-gradient-to-r from-slate-500 to-slate-600 text-white">
                        W {match.weekNumber}
                      </span>
                    </div>

                    {/* Match Display - Desktop & Tablet */}
                    <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      {/* Home Team */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-xl shadow-sm border border-slate-300 dark:border-slate-600">
                          {match.homeTeam.logoUrl ? (
                            <img
                              src={match.homeTeam.logoUrl}
                              alt={match.homeTeam.name}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {match.homeTeam.name}
                          </p>
                          {match.homeTeam.shortName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {match.homeTeam.shortName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score Section */}
                      <div className="flex flex-col items-center gap-2 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {match.homeScore ?? 0}
                          </span>
                          <span className="text-xl font-semibold text-slate-400 dark:text-slate-600">-</span>
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {match.awayScore ?? 0}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Final Score
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-row-reverse">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-xl shadow-sm border border-slate-300 dark:border-slate-600">
                          {match.awayTeam.logoUrl ? (
                            <img
                              src={match.awayTeam.logoUrl}
                              alt={match.awayTeam.name}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {match.awayTeam.name}
                          </p>
                          {match.awayTeam.shortName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {match.awayTeam.shortName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Display - Mobile */}
                    <div className="sm:hidden flex flex-col gap-3">
                      {/* Home Team */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-lg shadow-sm border border-slate-300 dark:border-slate-600">
                          {match.homeTeam.logoUrl ? (
                            <img
                              src={match.homeTeam.logoUrl}
                              alt={match.homeTeam.name}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {match.homeTeam.name}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white min-w-[2rem] text-center">
                          {match.homeScore ?? 0}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800
                                      rounded-lg shadow-sm border border-slate-300 dark:border-slate-600">
                          {match.awayTeam.logoUrl ? (
                            <img
                              src={match.awayTeam.logoUrl}
                              alt={match.awayTeam.name}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {match.awayTeam.name}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white min-w-[2rem] text-center">
                          {match.awayScore ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Scoring System Info */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
              <span className="text-2xl">🎯</span>
              Points Scoring System
            </CardTitle>
            <CardDescription className="text-indigo-700 dark:text-indigo-400">
              How predictions are scored
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Exact Score */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h4 className="font-bold text-green-700 dark:text-green-400">Exact Score</h4>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">9 pts</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  1 pt (home) + 1 pt (away) + 2 pts (total goals) + 3 pts (result) + 3 pts (bonus)
                </p>
              </div>

              {/* Correct Result + Partial */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✓</span>
                  <h4 className="font-bold text-yellow-700 dark:text-yellow-400">Partial Match</h4>
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">3-6 pts</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Points for correct result (3), total goals (2), or exact team scores (1 each)
                </p>
              </div>

              {/* No Match */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✗</span>
                  <h4 className="font-bold text-red-700 dark:text-red-400">No Match</h4>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">0 pts</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Incorrect prediction with no matching elements
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-800">
              <h5 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 text-sm">Point Breakdown:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">1</span>
                  Exact home team score
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">1</span>
                  Exact away team score
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">2</span>
                  Correct total goals
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">3</span>
                  Correct match result
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-bold">3</span>
                  Exact score bonus
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
