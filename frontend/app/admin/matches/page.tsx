'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { matchesApi, predictionsApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
  code: string;
}

interface Match {
  id: number;
  matchDate: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  weekNumber?: number;
  homeTeam: Team;
  awayTeam: Team;
  league: {
    id: number;
    name: string;
    country: string;
  };
}

export default function ManageMatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'finished'>('all');
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [scores, setScores] = useState<{ [key: number]: { home: string; away: string } }>({});

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchMatches();
  }, [user, router, filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? undefined : filter === 'finished' ? 'FINISHED' : 'SCHEDULED';
      const response = await matchesApi.getAll(undefined, statusParam);
      setMatches(response.data.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
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
        status: 'FINISHED'
      });

      alert('Match score updated successfully!');
      setEditingMatch(null);
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[matchId];
        return newScores;
      });
      fetchMatches();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update match score');
    }
  };

  const getStatusBadge = (status: string) => {
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
              <Button variant="ghost" size="sm">
                📅 Manage GameWeeks
              </Button>
            </Link>
            <Link href="/admin/matches">
              <Button variant="default" size="sm">
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
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Manage Matches
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Update match scores and manage match status
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Matches
          </Button>
          <Button
            variant={filter === 'scheduled' ? 'default' : 'outline'}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </Button>
          <Button
            variant={filter === 'finished' ? 'default' : 'outline'}
            onClick={() => setFilter('finished')}
          >
            Finished
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400 py-12">
            <p>No matches found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const isEditing = editingMatch === match.id;
              const isFinished = match.status.toUpperCase() === 'FINISHED';

              return (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {match.league.name} - Week {match.weekNumber || 'N/A'}
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(match.matchDate).toLocaleDateString()} at{' '}
                          {new Date(match.matchDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
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
                            className="w-16 text-center"
                            placeholder={match.homeScore?.toString() || '0'}
                            value={scores[match.id]?.home || ''}
                            onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                          />
                          <span className="text-xl font-bold">-</span>
                          <Input
                            type="number"
                            min="0"
                            className="w-16 text-center"
                            placeholder={match.awayScore?.toString() || '0'}
                            value={scores[match.id]?.away || ''}
                            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                          />
                        </div>
                      ) : isFinished ? (
                        <div className="px-8">
                          <Badge variant="default" className="text-lg px-4 py-1">
                            {match.homeScore} - {match.awayScore}
                          </Badge>
                        </div>
                      ) : (
                        <div className="px-8">
                          <span className="text-xl font-bold text-slate-400">vs</span>
                        </div>
                      )}

                      {/* Away Team */}
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{match.awayTeam.name}</p>
                      </div>

                      {/* Action Buttons */}
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateScore(match.id)} size="sm">
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingMatch(null);
                              setScores(prev => {
                                const newScores = { ...prev };
                                delete newScores[match.id];
                                return newScores;
                              });
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setEditingMatch(match.id)}
                          variant="outline"
                          size="sm"
                        >
                          {isFinished ? 'Edit Score' : 'Enter Score'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
