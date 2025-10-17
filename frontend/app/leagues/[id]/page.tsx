'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, settingsApi, groupsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Team {
  id: number;
  name: string;
  shortName?: string;
  logoUrl?: string;
}

interface UserPrediction {
  id: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  totalPoints: number | null;
}

interface Match {
  id: number;
  matchDate: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: Team;
  awayTeam: Team;
  predictions?: UserPrediction[];
}

interface GameWeekMatch {
  match: Match;
}

interface GameWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  league: {
    id: number;
    name: string;
    country: string;
    season: string;
    logoUrl?: string;
  };
  matches: GameWeekMatch[];
  _count: {
    matches: number;
  };
}

interface League {
  id: number;
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
}

interface Group {
  id: number;
  name: string;
  isPublic: boolean;
  isPrivate: boolean;
  leagueId?: number;
  allowedTeamIds: number[];
  league?: {
    id: number;
    name: string;
  };
}

function LeagueContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [league, setLeague] = useState<League | null>(null);
  const [currentGameWeek, setCurrentGameWeek] = useState<GameWeek | null>(null);
  const [allGameWeeks, setAllGameWeeks] = useState<GameWeek[]>([]);
  const [selectedGameWeekId, setSelectedGameWeekId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<{ [key: number]: { home: string; away: string } }>({});
  const [predictionDeadlineHours, setPredictionDeadlineHours] = useState(4);
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);

  // Group filtering
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [params.id]);

  // Refresh deadline setting when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDeadlineSetting();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchDeadlineSetting);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchDeadlineSetting);
    };
  }, []);

  const fetchDeadlineSetting = async () => {
    try {
      const settingResponse = await settingsApi.getSetting('PREDICTION_DEADLINE_HOURS');
      setPredictionDeadlineHours(parseInt(settingResponse.data.data.value));
    } catch (error) {
      console.log('Using default deadline: 4 hours');
    }
  };

  const fetchInitialData = async () => {
    try {
      // Fetch league details
      const leagueResponse = await api.get(`/leagues/${params.id}`);
      setLeague(leagueResponse.data.data);

      // Fetch prediction deadline setting
      await fetchDeadlineSetting();

      // Fetch user groups for this league
      try {
        const groupsResponse = await groupsApi.getUserGroups();
        const allGroups = groupsResponse.data.data;
        // Filter groups that match this league or are cross-league
        const relevantGroups = allGroups.filter((g: Group) =>
          !g.leagueId || g.leagueId === parseInt(params.id as string)
        );
        setUserGroups(relevantGroups);
      } catch (error) {
        console.log('Error fetching groups:', error);
      }

      // Fetch current gameweek by status
      try {
        const gameWeekResponse = await api.get(`/gameweeks/league/${params.id}/current-by-status`);
        setCurrentGameWeek(gameWeekResponse.data.data);
        setSelectedGameWeekId(gameWeekResponse.data.data.id);
      } catch (error) {
        console.log('No current gameweek found');
      }

      // Fetch all gameweeks for selector
      const allGameWeeksResponse = await api.get(`/gameweeks/league/${params.id}`);
      setAllGameWeeks(allGameWeeksResponse.data.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameWeekDetails = async (gameWeekId: number) => {
    try {
      // Also refresh the deadline setting when changing gameweeks
      await fetchDeadlineSetting();
      const response = await api.get(`/gameweeks/${gameWeekId}`);
      setCurrentGameWeek(response.data.data);
    } catch (error) {
      console.error('Error fetching gameweek details:', error);
    }
  };

  const handleGameWeekChange = (gameWeekId: number) => {
    setSelectedGameWeekId(gameWeekId);
    fetchGameWeekDetails(gameWeekId);
  };

  const isPredictionLocked = (matchDate: string): boolean => {
    const now = new Date();
    const kickoff = new Date(matchDate);
    const hoursDifference = (kickoff.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference < predictionDeadlineHours;
  };

  const getDeadlineTime = (matchDate: string): string => {
    const kickoff = new Date(matchDate);
    const deadline = new Date(kickoff.getTime() - predictionDeadlineHours * 60 * 60 * 1000);
    return deadline.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePredictionChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }));
  };

  const handleChangeClick = (matchId: number, userPrediction?: UserPrediction) => {
    setEditingMatchId(matchId);
    if (userPrediction) {
      setPredictions(prev => ({
        ...prev,
        [matchId]: {
          home: userPrediction.predictedHomeScore.toString(),
          away: userPrediction.predictedAwayScore.toString()
        }
      }));
    }
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
      await api.post('/predictions', {
        matchId,
        predictedHomeScore: parseInt(prediction.home),
        predictedAwayScore: parseInt(prediction.away),
        groupId: selectedGroupId || undefined
      });
      alert('Prediction saved!');

      // Refresh gameweek data
      if (selectedGameWeekId) {
        fetchGameWeekDetails(selectedGameWeekId);
      }

      // Clear input fields and exit edit mode
      setPredictions(prev => {
        const newPredictions = { ...prev };
        delete newPredictions[matchId];
        return newPredictions;
      });
      setEditingMatchId(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save prediction');
    }
  };

  const handleGroupChange = (groupId: string) => {
    const id = groupId === 'all' ? null : parseInt(groupId);
    setSelectedGroupId(id);
    const group = userGroups.find(g => g.id === id);
    setSelectedGroup(group || null);
  };

  const getTeamLogo = (team: Team) => {
    if (team.logoUrl) {
      return (
        <img
          src={team.logoUrl}
          alt={team.name}
          className="w-8 h-8 object-contain"
        />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <p className="text-slate-600 dark:text-slate-400">League not found</p>
      </div>
    );
  }

  // Filter matches based on selected group's allowed teams
  const allMatches = currentGameWeek?.matches || [];
  const matches = selectedGroup && selectedGroup.allowedTeamIds && selectedGroup.allowedTeamIds.length > 0
    ? allMatches.filter(({ match }) =>
        selectedGroup.allowedTeamIds.includes(match.homeTeam.id) ||
        selectedGroup.allowedTeamIds.includes(match.awayTeam.id)
      )
    : allMatches;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center gap-4">
            {league.logoUrl && (
              <img src={league.logoUrl} alt={league.name} className="w-16 h-16 object-contain" />
            )}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{league.name}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {league.country} • {league.season}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Group Selector */}
            {userGroups.length > 0 && (
              <div className="w-64">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by Group
                </label>
                <Select value={selectedGroupId?.toString() || 'all'} onValueChange={handleGroupChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All matches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Matches</SelectItem>
                    {userGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name} {group.isPublic ? '(Public)' : '(Private)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* GameWeek Selector */}
            {allGameWeeks.length > 0 && (
              <div className="w-64">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select GameWeek
                </label>
                <select
                  value={selectedGameWeekId || ''}
                  onChange={(e) => handleGameWeekChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {allGameWeeks.map((gw) => (
                    <option key={gw.id} value={gw.id}>
                      Week {gw.weekNumber} - {gw.status} ({gw._count.matches} matches)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Group Filter Info */}
        {selectedGroup && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-300">
                  Filtering by: {selectedGroup.name}
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-400">
                  {selectedGroup.allowedTeamIds && selectedGroup.allowedTeamIds.length > 0
                    ? `Showing only matches with ${selectedGroup.allowedTeamIds.length} selected team(s)`
                    : 'Showing all matches'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGroupChange('all')}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        )}

        {currentGameWeek && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  GameWeek {currentGameWeek.weekNumber}
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Status: <strong>{currentGameWeek.status}</strong> •
                  {selectedGroup && selectedGroup.allowedTeamIds && selectedGroup.allowedTeamIds.length > 0
                    ? ` ${matches.length} filtered matches`
                    : ` ${currentGameWeek._count.matches} matches`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Prediction Deadline
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>{predictionDeadlineHours} hour{predictionDeadlineHours !== 1 ? 's' : ''}</strong> before kickoff
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400">No matches in this gameweek</p>
          ) : (
            matches.map(({ match }) => {
              const userPrediction = match.predictions?.[0];
              const isFinished = match.status === 'FINISHED';
              const isLocked = isPredictionLocked(match.matchDate);
              const canPredict = !isFinished && !isLocked;
              const isEditing = editingMatchId === match.id;

              return (
                <Card key={match.id} className={isLocked && !isFinished ? 'border-orange-300 dark:border-orange-700' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <CardDescription>
                        {new Date(match.matchDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}{' '}
                        {new Date(match.matchDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                      <div className="flex gap-2">
                        {isFinished && <Badge variant="secondary">Finished</Badge>}
                        {isLocked && !isFinished && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                            Locked
                          </Badge>
                        )}
                        {canPredict && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            Open
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isFinished && (
                      <CardDescription className="text-xs">
                        Predictions close: {getDeadlineTime(match.matchDate)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Match Display */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Home Team */}
                        <div className="flex-1 flex items-center justify-end gap-3">
                          <p className="font-semibold text-right">{match.homeTeam.name}</p>
                          {getTeamLogo(match.homeTeam)}
                        </div>

                        {/* Score/Input Section */}
                        <div className="flex flex-col items-center gap-2">
                          {/* Real Result - show for all matches */}
                          {isFinished ? (
                            <div className="text-lg font-bold text-green-700 dark:text-green-500">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </div>
                          ) : match.homeScore !== null && match.homeScore !== undefined ? (
                            <div className="text-lg font-bold text-green-700 dark:text-green-500">
                              {match.homeScore} - {match.awayScore ?? 0}
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                              ? - ?
                            </div>
                          )}

                          {/* Your Prediction Section */}
                          {canPredict ? (
                            <div className="flex flex-col items-center gap-1">
                              {isEditing ? (
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                  Your Prediction:
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                  Your Prediction:
                                </span>
                              )}
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="w-16 text-center text-orange-600 dark:text-orange-400 font-semibold"
                                      placeholder="0"
                                      value={predictions[match.id]?.home || ''}
                                      onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                                    />
                                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">-</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="w-16 text-center text-orange-600 dark:text-orange-400 font-semibold"
                                      placeholder="0"
                                      value={predictions[match.id]?.away || ''}
                                      onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                                    />
                                  </>
                                ) : userPrediction ? (
                                  <>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 font-semibold">
                                        {userPrediction.predictedHomeScore}
                                      </span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-700 dark:text-blue-400">-</span>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 font-semibold">
                                        {userPrediction.predictedAwayScore}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 text-2xl">?</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-700 dark:text-blue-400">-</span>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 text-2xl">?</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : !isFinished ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                Your Prediction:
                              </span>
                              <div className="flex items-center gap-2">
                                {userPrediction ? (
                                  <>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 font-semibold">
                                        {userPrediction.predictedHomeScore}
                                      </span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-700 dark:text-blue-400">-</span>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 font-semibold">
                                        {userPrediction.predictedAwayScore}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 text-2xl">?</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-700 dark:text-blue-400">-</span>
                                    <div className="w-16 h-10 flex items-center justify-center border rounded-md bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 text-2xl">?</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex items-center gap-3">
                          {getTeamLogo(match.awayTeam)}
                          <p className="font-semibold">{match.awayTeam.name}</p>
                        </div>

                        {/* Predict Button */}
                        {canPredict && (
                          <Button
                            onClick={() => {
                              if (isEditing) {
                                handleSubmitPrediction(match.id);
                              } else {
                                handleChangeClick(match.id, userPrediction);
                              }
                            }}
                            className="ml-4"
                          >
                            {isEditing ? 'Update' : userPrediction ? 'Change' : 'Predict'}
                          </Button>
                        )}
                      </div>

                      {/* User Prediction Display - Only show when finished */}
                      {userPrediction && isFinished && (
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              Your Prediction:
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-lg text-green-700 dark:text-green-500">
                                {userPrediction.predictedHomeScore} - {userPrediction.predictedAwayScore}
                              </span>
                              {userPrediction.totalPoints !== null && (
                                <Badge
                                  variant={
                                    userPrediction.totalPoints >= 8 ? 'default' :
                                    userPrediction.totalPoints >= 3 ? 'secondary' :
                                    'destructive'
                                  }
                                >
                                  {userPrediction.totalPoints} points
                                </Badge>
                              )}
                            </div>
                          </div>

                          {userPrediction.totalPoints !== null && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {userPrediction.totalPoints >= 8 && '🎯 Exact score! Perfect prediction!'}
                              {userPrediction.totalPoints >= 3 && userPrediction.totalPoints < 8 && '✓ Correct outcome! Good prediction!'}
                              {userPrediction.totalPoints === 0 && '✗ Incorrect prediction'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show message if no prediction and locked */}
                      {!userPrediction && !canPredict && !isFinished && (
                        <div className="border-t pt-4 text-sm text-center text-slate-500 dark:text-slate-400">
                          No prediction made (0 - 0)
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

export default function LeaguePage() {
  return (
    <ProtectedRoute>
      <LeagueContent />
    </ProtectedRoute>
  );
}
