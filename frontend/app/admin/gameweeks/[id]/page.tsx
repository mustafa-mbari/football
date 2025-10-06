'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { predictionsApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
  code: string;
}

interface Match {
  id: number;
  matchDate: string;
  status?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: Team;
  awayTeam: Team;
}

interface TeamStats {
  id: number;
  teamId: number;
  team: Team;
  matchesPlayed: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  result?: string;
}

interface GameWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  isCurrent: boolean;
  league: {
    id: number;
    name: string;
    country: string;
    season: string;
  };
  matches: Match[];
  teamStats: TeamStats[];
}

export default function GameWeekDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [gameWeek, setGameWeek] = useState<GameWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [scores, setScores] = useState<{ [key: number]: { home: string; away: string } }>({});
  const [completingWeek, setCompletingWeek] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchGameWeek();
  }, [user, router, params.id]);

  const fetchGameWeek = async () => {
    try {
      const response = await fetch(`http://localhost:7070/api/gameweeks/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Transform the nested structure to flat structure for easier use
        const gameWeekData = data.data;
        if (gameWeekData.matches) {
          gameWeekData.matches = gameWeekData.matches.map((gw: any) => gw.match);
        }
        setGameWeek(gameWeekData);
      }
    } catch (error) {
      console.error('Error fetching gameweek:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleUpdateScore = async (matchId: number) => {
    const score = scores[matchId];
    if (!score?.home || !score?.away) {
      alert('Please enter both scores');
      return;
    }

    try {
      await predictionsApi.updateMatchScore(matchId, {
        homeScore: parseInt(score.home),
        awayScore: parseInt(score.away),
        status: 'FINISHED',
      });

      alert('Match score updated successfully!');
      setEditingMatch(null);
      setScores((prev) => {
        const newScores = { ...prev };
        delete newScores[matchId];
        return newScores;
      });
      fetchGameWeek();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update match score');
    }
  };

  const handleCompleteWeek = async () => {
    if (!gameWeek) return;

    // Check if all matches have scores
    const allMatchesHaveScores = gameWeek.matches.every(
      (match) => match.homeScore !== null && match.homeScore !== undefined &&
                match.awayScore !== null && match.awayScore !== undefined
    );

    if (!allMatchesHaveScores) {
      alert('Please enter scores for all matches before marking the week as completed');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to mark Week ${gameWeek.weekNumber} as COMPLETED? This will finalize all match results.`
    );

    if (!confirmed) return;

    try {
      setCompletingWeek(true);
      const response = await fetch(`http://localhost:7070/api/gameweeks/${params.id}/complete`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('GameWeek marked as completed!');
        fetchGameWeek();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to complete gameweek');
      }
    } catch (error: any) {
      alert('Failed to complete gameweek');
      console.error(error);
    } finally {
      setCompletingWeek(false);
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

  const getStatusBadge = (status?: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="destructive">In Progress</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMatchStatusBadge = (status?: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status.toUpperCase()) {
      case 'FINISHED':
        return <Badge variant="default">Finished</Badge>;
      case 'LIVE':
        return <Badge variant="destructive">Live</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading gameweek...</p>
        </div>
      </div>
    );
  }

  if (!gameWeek) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">GameWeek not found</p>
          <Link href="/admin/gameweeks">
            <Button>Back to GameWeeks</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allMatchesHaveScores = gameWeek.matches.every(
    (match) => match.homeScore !== null && match.homeScore !== undefined &&
              match.awayScore !== null && match.awayScore !== undefined
  );
  const isCompleted = gameWeek.status?.toUpperCase() === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Admin Submenu */}
      <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-2 overflow-x-auto">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                🏠 Dashboard
              </Button>
            </Link>
            <Link href="/admin/gameweeks">
              <Button variant="default" size="sm">
                📅 Manage GameWeeks
              </Button>
            </Link>
            <Link href="/admin/matches">
              <Button variant="ghost" size="sm">
                ⚽ Manage Matches
              </Button>
            </Link>
            <Link href="/admin/standings">
              <Button variant="ghost" size="sm">
                📊 Update Standings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/gameweeks">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to GameWeeks
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {getLeagueFlag(gameWeek.league.country)} Week {gameWeek.weekNumber}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {gameWeek.league.name} - {gameWeek.league.season}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {new Date(gameWeek.startDate).toLocaleDateString()} -{' '}
                {new Date(gameWeek.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(gameWeek.status)}
              <Button
                onClick={() => router.push(`/admin/gameweeks/${params.id}/add-matches`)}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                ➕ Add Matches
              </Button>
              {!isCompleted && allMatchesHaveScores && (
                <Button
                  onClick={handleCompleteWeek}
                  disabled={completingWeek}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completingWeek ? 'Completing...' : '✓ Mark Week as Completed'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alert for completed week */}
        {isCompleted && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-900 dark:text-green-300 font-medium">
              ✓ This gameweek has been marked as completed. You can still edit match scores if needed.
            </p>
          </div>
        )}

        {/* Alert for incomplete matches */}
        {!isCompleted && !allMatchesHaveScores && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-900 dark:text-yellow-300 font-medium">
              ⚠ Please enter scores for all matches before marking this week as completed.
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameWeek.matches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Finished
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gameWeek.matches.filter((m) => m.status?.toUpperCase() === 'FINISHED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                With Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {gameWeek.matches.filter((m) => m.homeScore !== null && m.awayScore !== null).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {gameWeek.matches.filter((m) => m.homeScore === null || m.awayScore === null).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches - Edit Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Scores Management</CardTitle>
          </CardHeader>
          <CardContent>
            {gameWeek.matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
                    No matches assigned to this gameweek yet
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">
                    Add matches to this gameweek to start managing scores
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/admin/gameweeks/${params.id}/add-matches`)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ➕ Add Matches to This Week
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameWeek.matches.map((match) => {
                  const isEditing = editingMatch === match.id;
                  const hasScore = match.homeScore !== null && match.awayScore !== null;

                  return (
                    <Card key={match.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                          {/* Home Team */}
                          <div className="flex-1 text-right">
                            <p className="font-semibold text-lg">{match.homeTeam.name}</p>
                          </div>

                          {/* Score Display/Edit */}
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                className="w-16 text-center text-lg font-bold"
                                placeholder={match.homeScore?.toString() || '0'}
                                value={scores[match.id]?.home || ''}
                                onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                autoFocus
                              />
                              <span className="text-2xl font-bold">-</span>
                              <Input
                                type="number"
                                min="0"
                                className="w-16 text-center text-lg font-bold"
                                placeholder={match.awayScore?.toString() || '0'}
                                value={scores[match.id]?.away || ''}
                                onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                              />
                            </div>
                          ) : hasScore ? (
                            <div className="px-8">
                              <Badge variant="default" className="text-2xl px-6 py-2 font-bold">
                                {match.homeScore} - {match.awayScore}
                              </Badge>
                            </div>
                          ) : (
                            <div className="px-8">
                              <span className="text-2xl font-bold text-slate-400">- : -</span>
                            </div>
                          )}

                          {/* Away Team */}
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{match.awayTeam.name}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            {isEditing ? (
                              <>
                                <Button onClick={() => handleUpdateScore(match.id)} size="sm" className="w-full">
                                  💾 Save
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingMatch(null);
                                    setScores((prev) => {
                                      const newScores = { ...prev };
                                      delete newScores[match.id];
                                      return newScores;
                                    });
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  ✕ Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button onClick={() => setEditingMatch(match.id)} variant="outline" size="sm" className="w-full">
                                  {hasScore ? '✏️ Edit' : '➕ Enter Score'}
                                </Button>
                                <div className="flex items-center justify-center gap-2">
                                  {getMatchStatusBadge(match.status)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Match Info */}
                        <div className="mt-3 pt-3 border-t text-center text-sm text-slate-600 dark:text-slate-400">
                          {new Date(match.matchDate).toLocaleDateString()} at{' '}
                          {new Date(match.matchDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Team Statistics for this Week</CardTitle>
          </CardHeader>
          <CardContent>
            {gameWeek.teamStats.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                Team statistics will be available after matches are completed
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                    <tr className="text-left">
                      <th className="py-3 px-4 font-semibold">Team</th>
                      <th className="py-3 px-2 text-center font-semibold">P</th>
                      <th className="py-3 px-2 text-center font-semibold">W</th>
                      <th className="py-3 px-2 text-center font-semibold">D</th>
                      <th className="py-3 px-2 text-center font-semibold">L</th>
                      <th className="py-3 px-2 text-center font-semibold">GF</th>
                      <th className="py-3 px-2 text-center font-semibold">GA</th>
                      <th className="py-3 px-2 text-center font-semibold">GD</th>
                      <th className="py-3 px-2 text-center font-semibold">Pts</th>
                      <th className="py-3 px-2 text-center font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameWeek.teamStats
                      .sort((a, b) => b.points - a.points)
                      .map((stat) => (
                        <tr
                          key={stat.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <td className="py-3 px-4 font-medium">{stat.team.name}</td>
                          <td className="py-3 px-2 text-center">{stat.matchesPlayed}</td>
                          <td className="py-3 px-2 text-center">{stat.won}</td>
                          <td className="py-3 px-2 text-center">{stat.drawn}</td>
                          <td className="py-3 px-2 text-center">{stat.lost}</td>
                          <td className="py-3 px-2 text-center">{stat.goalsFor}</td>
                          <td className="py-3 px-2 text-center">{stat.goalsAgainst}</td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={
                                stat.goalDifference > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : stat.goalDifference < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : ''
                              }
                            >
                              {stat.goalDifference > 0 ? '+' : ''}
                              {stat.goalDifference}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-bold">{stat.points}</td>
                          <td className="py-3 px-2 text-center">
                            {stat.result && (
                              <Badge variant="outline" className="font-mono">
                                {stat.result}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
