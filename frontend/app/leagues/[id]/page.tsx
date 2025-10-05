'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leaguesApi, predictionsApi, authApi, weeksApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
}

interface UserPrediction {
  id: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  points: number | null;
}

interface Match {
  id: number;
  matchDate: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  round?: string;
  homeTeam: Team;
  awayTeam: Team;
  predictions?: UserPrediction[];
}

interface League {
  id: number;
  name: string;
  country: string;
  season: string;
}

interface WeekOption {
  week: number;
  label: string;
  count: number;
}

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<{ [key: number]: { home: string; away: string } }>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [leagueResponse, weeksResponse, userResponse] = await Promise.all([
          leaguesApi.getById(parseInt(params.id as string)),
          weeksApi.getAvailableWeeks(parseInt(params.id as string)),
          authApi.getCurrentUser().catch(() => null)
        ]);

        setLeague(leagueResponse.data.data);
        setAvailableWeeks(weeksResponse.data.data);
        setUser(userResponse?.data?.data);

        // Set default week (first available week or week 1)
        const defaultWeek = weeksResponse.data.data[0]?.week || 1;
        setSelectedWeek(defaultWeek);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [params.id]);

  useEffect(() => {
    const fetchWeekMatches = async () => {
      if (!league) return;

      try {
        const response = await weeksApi.getMatchesByWeek(league.id, selectedWeek);
        setMatches(response.data.data.matches);
      } catch (error) {
        console.error('Error fetching week matches:', error);
      }
    };

    fetchWeekMatches();
  }, [league, selectedWeek]);

  const handlePredictionChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }));
  };

  const handleSubmitPrediction = async (matchId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const prediction = predictions[matchId];
    if (!prediction?.home || !prediction?.away) {
      alert('Please enter both scores');
      return;
    }

    try {
      await predictionsApi.create({
        matchId,
        predictedHomeScore: parseInt(prediction.home),
        predictedAwayScore: parseInt(prediction.away)
      });
      alert('Prediction saved!');

      // Refresh matches to show the updated prediction
      const response = await weeksApi.getMatchesByWeek(league!.id, selectedWeek);
      setMatches(response.data.data.matches);

      // Clear input fields
      setPredictions(prev => {
        const newPredictions = { ...prev };
        delete newPredictions[matchId];
        return newPredictions;
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save prediction');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!league) {
    return <div className="min-h-screen flex items-center justify-center">League not found</div>;
  }

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{league.name}</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {league.country} • {league.season}
            </p>
          </div>

          {availableWeeks.length > 0 && (
            <div className="w-64">
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week) => (
                    <SelectItem key={week.week} value={week.week.toString()}>
                      {week.label} ({week.count} matches)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400">No matches in this week</p>
          ) : (
            matches.map((match) => {
              const userPrediction = match.predictions?.[0];
              const isFinished = match.status === 'finished';
              const canPredict = !isFinished && new Date(match.matchDate) > new Date();

              return (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardDescription>
                        {match.round} • {new Date(match.matchDate).toLocaleDateString()} {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </CardDescription>
                      {isFinished && (
                        <Badge variant="secondary">Finished</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Match Display */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-right">
                          <p className="font-semibold">{match.homeTeam.name}</p>
                        </div>

                        {isFinished ? (
                          <div className="px-8">
                            <Badge variant="default" className="text-lg px-4 py-1">
                              {match.homeScore} - {match.awayScore}
                            </Badge>
                          </div>
                        ) : canPredict ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              className="w-16 text-center"
                              placeholder="0"
                              value={predictions[match.id]?.home || ''}
                              onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                            />
                            <span className="text-xl font-bold">-</span>
                            <Input
                              type="number"
                              min="0"
                              className="w-16 text-center"
                              placeholder="0"
                              value={predictions[match.id]?.away || ''}
                              onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="px-8">
                            <span className="text-xl font-bold">vs</span>
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-semibold">{match.awayTeam.name}</p>
                        </div>

                        {canPredict && (
                          <Button onClick={() => handleSubmitPrediction(match.id)}>
                            Predict
                          </Button>
                        )}
                      </div>

                      {/* User Prediction Display */}
                      {userPrediction && (
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Your Prediction:</span>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold">
                                {userPrediction.predictedHomeScore} - {userPrediction.predictedAwayScore}
                              </span>
                              {isFinished && userPrediction.points !== null && (
                                <Badge
                                  variant={
                                    userPrediction.points === 3 ? 'default' :
                                    userPrediction.points === 1 ? 'secondary' :
                                    'destructive'
                                  }
                                >
                                  {userPrediction.points} {userPrediction.points === 1 ? 'point' : 'points'}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {isFinished && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {userPrediction.points === 3 && '🎯 Exact score! Perfect prediction!'}
                              {userPrediction.points === 1 && '✓ Correct outcome! Good prediction!'}
                              {userPrediction.points === 0 && '✗ Incorrect prediction'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
