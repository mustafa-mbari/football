'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, settingsApi, groupsApi, standingsApi } from '@/lib/api';
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

interface Standing {
  id: number;
  position: number;
  teamId: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
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

  // All leagues for dropdown
  const [allLeagues, setAllLeagues] = useState<League[]>([]);

  // Standings data
  const [standings, setStandings] = useState<Standing[]>([]);

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
      // Fetch all leagues for dropdown
      const allLeaguesResponse = await api.get('/leagues');
      setAllLeagues(allLeaguesResponse.data.data);

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

      // Fetch standings for position badges
      try {
        const standingsResponse = await standingsApi.getByLeague(parseInt(params.id as string));
        setStandings(standingsResponse.data.data || []);
      } catch (error) {
        console.log('Error fetching standings:', error);
      }
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
    const isLocked = hoursDifference < predictionDeadlineHours;

    // Debug logging
    console.log('Prediction Lock Check:', {
      now: now.toISOString(),
      kickoff: kickoff.toISOString(),
      hoursDifference: hoursDifference.toFixed(2),
      deadlineHours: predictionDeadlineHours,
      isLocked
    });

    return isLocked;
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

  const handleLeagueChange = (leagueId: string) => {
    router.push(`/leagues/${leagueId}`);
  };

  const getTeamPosition = (teamId: number): number | null => {
    const standing = standings.find(s => s.teamId === teamId);
    return standing ? standing.position : null;
  };

  const getPositionBadgeColor = (position: number, leagueId: number): string => {
    // Champions League (ID 5): 1-8 green, 9-24 gray, 25-36 red
    if (leagueId === 5) {
      if (position >= 1 && position <= 8) return 'bg-green-500';
      if (position >= 9 && position <= 24) return 'bg-gray-400';
      if (position >= 25 && position <= 36) return 'bg-red-500';
    }

    // Premier League (ID 1), La Liga (ID 2), Serie A (ID 4): 1-4 green, 5-17 gray, 18-20 red
    if (leagueId === 1 || leagueId === 2 || leagueId === 4) {
      if (position >= 1 && position <= 4) return 'bg-green-500';
      if (position >= 5 && position <= 17) return 'bg-gray-400';
      if (position >= 18 && position <= 20) return 'bg-red-500';
    }

    // Bundesliga (ID 3): 1-4 green, 5-15 gray, 16-18 red
    if (leagueId === 3) {
      if (position >= 1 && position <= 4) return 'bg-green-500';
      if (position >= 5 && position <= 15) return 'bg-gray-400';
      if (position >= 16 && position <= 18) return 'bg-red-500';
    }

    // Default fallback
    return 'bg-yellow-400';
  };

  const getTeamLogo = (team: Team) => {
    if (team.logoUrl) {
      const position = getTeamPosition(team.id);
      const badgeColor = position !== null && league ? getPositionBadgeColor(position, league.id) : 'bg-yellow-400';
      return (
        <div className="relative inline-block">
          <img
            src={team.logoUrl}
            alt={team.name}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform duration-200 hover:scale-110"
          />
          {position !== null && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 ${badgeColor} border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg z-10`}>
              <span className="text-[10px] font-bold text-white">
                {position}
              </span>
            </div>
          )}
        </div>
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

  // Get all matches from current gameweek
  const matches = currentGameWeek?.matches || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header Section - Stack on mobile */}
        <div className="mb-6 sm:mb-8">
          {/* League Title - Always visible */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            {league.logoUrl && (
              <img src={league.logoUrl} alt={league.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 truncate">{league.name}</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {league.country} • {league.season}
              </p>
            </div>
          </div>

          {/* Selectors - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* League Selector */}
            {allLeagues.length > 0 && (
              <div className="w-full sm:w-64">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select League
                </label>
                <Select value={params.id as string} onValueChange={handleLeagueChange}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allLeagues.map((lg) => (
                      <SelectItem key={lg.id} value={lg.id.toString()}>
                        <div className="flex items-center gap-2">
                          {lg.logoUrl && (
                            <img src={lg.logoUrl} alt={lg.name} className="w-4 h-4 object-contain" />
                          )}
                          <span>{lg.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* GameWeek Selector */}
            {allGameWeeks.length > 0 && (
              <div className="w-full sm:w-80">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select GameWeek
                </label>
                <Select value={selectedGameWeekId?.toString() || ''} onValueChange={(value) => handleGameWeekChange(parseInt(value))}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allGameWeeks.map((gw) => {
                      // Map status values: IN_PROGRESS = Active, COMPLETED = Finished, SCHEDULED = Upcoming
                      const status = gw.status.toUpperCase();
                      const statusEmoji = status === 'SCHEDULED' ? '🔵' : status === 'IN_PROGRESS' ? '🟢' : '⚪';
                      const statusText = status === 'SCHEDULED' ? 'Upcoming' : status === 'IN_PROGRESS' ? 'Active' : 'Finished';
                      return (
                        <SelectItem key={gw.id} value={gw.id.toString()}>
                          Week {gw.weekNumber} {statusEmoji} {statusText}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {currentGameWeek && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  GameWeek {currentGameWeek.weekNumber}
                </h3>
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-400">
                  Status: <strong>{currentGameWeek.status}</strong> • {currentGameWeek._count.matches} matches
                </p>
              </div>
              <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 sm:text-right text-xs sm:text-sm">
                <div className="flex-1 sm:flex-none">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    Current Time
                  </p>
                  <p className="text-blue-800 dark:text-blue-400">
                    <strong className="text-xs sm:text-sm">{new Date().toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</strong>
                  </p>
                </div>
                <div className="flex-1 sm:flex-none">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    Deadline
                  </p>
                  <p className="text-blue-800 dark:text-blue-400">
                    <strong className="text-xs sm:text-sm">{predictionDeadlineHours}h before kickoff</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
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
                <Card
                  key={match.id}
                  className={`transition-all duration-300 hover:shadow-xl ${
                    isLocked && !isFinished
                      ? 'border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600'
                      : isFinished
                        ? 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                        : 'hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <CardHeader className="pb-2 sm:pb-2 pt-3 sm:pt-3">
                    {/* Mobile compact view */}
                    <div className="sm:hidden">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <CardDescription className="text-[10px] leading-tight flex-1">
                          {new Date(match.matchDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          {new Date(match.matchDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {!isFinished && (
                            <>
                              {' • Close: '}
                              {getDeadlineTime(match.matchDate)}
                            </>
                          )}
                        </CardDescription>
                        <div className="flex gap-1 flex-shrink-0">
                          {isFinished && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Done</Badge>}
                          {isLocked && !isFinished && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-[10px] h-4 px-1.5">
                              Locked
                            </Badge>
                          )}
                          {canPredict && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-[10px] h-4 px-1.5">
                              Open
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop view - Compact single line */}
                    <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(match.matchDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(match.matchDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {!isFinished && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="font-medium">
                              Close: {getDeadlineTime(match.matchDate)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {isFinished && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-600 text-xs font-semibold">
                            Finished
                          </Badge>
                        )}
                        {isLocked && !isFinished && (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-600 text-xs font-semibold">
                            Locked
                          </Badge>
                        )}
                        {canPredict && (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600 text-xs font-semibold">
                            Open for Predictions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 sm:pt-2 pb-3 sm:pb-3">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Mobile Match Display - 3 columns */}
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-start sm:hidden">
                        {/* Home Team - Column 1 */}
                        <div className="flex flex-col items-center gap-0.5">
                          {getTeamLogo(match.homeTeam)}
                          <p className="font-semibold text-[9px] text-center w-full leading-tight truncate" title={match.homeTeam.name}>{match.homeTeam.name}</p>
                        </div>

                        {/* Score/Prediction - Column 2 (Center) */}
                        <div className="flex flex-col items-center gap-0.5 px-1">
                          {/* Final Score - Always show at top */}
                          {isFinished ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-medium text-green-700 dark:text-green-500 uppercase">Final</span>
                              <div className="text-sm font-bold text-green-700 dark:text-green-500">
                                {match.homeScore ?? 0}-{match.awayScore ?? 0}
                              </div>
                            </div>
                          ) : match.homeScore !== null && match.homeScore !== undefined ? (
                            <div className="text-sm font-bold text-green-700 dark:text-green-500">
                              {match.homeScore}-{match.awayScore ?? 0}
                            </div>
                          ) : (
                            <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                              ?-?
                            </div>
                          )}

                          {/* Prediction Section */}
                          {isFinished && userPrediction ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-medium text-slate-600 dark:text-slate-400 uppercase">Predict</span>
                              <div className="flex items-center gap-0.5">
                                <div className="w-8 h-6 flex items-center justify-center border rounded bg-slate-100 dark:bg-slate-700">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                                    {userPrediction.predictedHomeScore}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">-</span>
                                <div className="w-8 h-6 flex items-center justify-center border rounded bg-slate-100 dark:bg-slate-700">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                                    {userPrediction.predictedAwayScore}
                                  </span>
                                </div>
                              </div>
                              {userPrediction.totalPoints !== null && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className={`text-xs font-bold ${
                                    userPrediction.totalPoints >= 8
                                      ? 'text-green-600 dark:text-green-400'
                                      : userPrediction.totalPoints >= 3
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {userPrediction.totalPoints} pts
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : canPredict ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-medium text-blue-700 dark:text-blue-400 uppercase">Predict</span>
                              <div className="flex items-center gap-0.5">
                                {isEditing ? (
                                  <>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="w-8 h-6 text-center text-orange-600 dark:text-orange-400 font-semibold text-xs p-0 border-orange-400"
                                      placeholder="0"
                                      value={predictions[match.id]?.home || ''}
                                      onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                                    />
                                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">-</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="w-8 h-6 text-center text-orange-600 dark:text-orange-400 font-semibold text-xs p-0 border-orange-400"
                                      placeholder="0"
                                      value={predictions[match.id]?.away || ''}
                                      onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                                    />
                                  </>
                                ) : userPrediction ? (
                                  <>
                                    <div className="w-8 h-6 flex items-center justify-center border rounded bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 font-semibold text-xs">
                                        {userPrediction.predictedHomeScore}
                                      </span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">-</span>
                                    <div className="w-8 h-6 flex items-center justify-center border rounded bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 font-semibold text-xs">
                                        {userPrediction.predictedAwayScore}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-8 h-6 flex items-center justify-center border rounded bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 text-xs">?</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">-</span>
                                    <div className="w-8 h-6 flex items-center justify-center border rounded bg-white dark:bg-slate-800">
                                      <span className="text-blue-700 dark:text-blue-400 text-xs">?</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : !isFinished && userPrediction ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-medium text-slate-600 dark:text-slate-400 uppercase">Predict</span>
                              <div className="flex items-center gap-0.5">
                                <div className="w-8 h-6 flex items-center justify-center border rounded bg-slate-100 dark:bg-slate-700">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                                    {userPrediction.predictedHomeScore}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">-</span>
                                <div className="w-8 h-6 flex items-center justify-center border rounded bg-slate-100 dark:bg-slate-700">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                                    {userPrediction.predictedAwayScore}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Away Team - Column 3 */}
                        <div className="flex flex-col items-center gap-0.5">
                          {getTeamLogo(match.awayTeam)}
                          <p className="font-semibold text-[9px] text-center w-full leading-tight truncate" title={match.awayTeam.name}>{match.awayTeam.name}</p>
                        </div>
                      </div>

                      {/* Desktop Match Display - Professional Redesign */}
                      <div className="hidden sm:block">
                        <div className="flex items-center gap-4">
                          {/* Home Team Section */}
                          <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                            <div className="text-right min-w-0">
                              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                {match.homeTeam.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {match.homeTeam.shortName || 'Home'}
                              </p>
                            </div>
                            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                              {getTeamLogo(match.homeTeam)}
                            </div>
                          </div>

                          {/* Center Score/Prediction Section */}
                          <div className={`flex flex-col items-center ${isFinished ? 'gap-3 py-3' : 'gap-3 py-3'} px-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-[280px]`}>
                            {/* Match Score - Only show for finished or in-progress matches */}
                            {!canPredict && (
                              <div className="flex flex-col items-center gap-2 w-full">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                  {isFinished ? 'Final Score' : 'Match Score'}
                                </span>
                                <div className="flex items-center gap-3">
                                  {isFinished ? (
                                    <>
                                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-500 dark:border-green-600 shadow-sm">
                                        <span className="text-2xl font-black text-green-700 dark:text-green-400">
                                          {match.homeScore ?? 0}
                                        </span>
                                      </div>
                                      <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">—</span>
                                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-500 dark:border-green-600 shadow-sm">
                                        <span className="text-2xl font-black text-green-700 dark:text-green-400">
                                          {match.awayScore ?? 0}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-2 border-amber-500 dark:border-amber-600 shadow-sm">
                                        <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                                          {match.homeScore ?? 0}
                                        </span>
                                      </div>
                                      <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">—</span>
                                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-2 border-amber-500 dark:border-amber-600 shadow-sm">
                                        <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                                          {match.awayScore ?? 0}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Prediction Section for Finished Matches - Compact inline */}
                            {isFinished && userPrediction ? (
                              <div className="flex items-center justify-between w-full gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Your Prediction
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-600 dark:text-slate-300">
                                      {userPrediction.predictedHomeScore}
                                    </span>
                                    <span className="text-base font-medium text-slate-400 dark:text-slate-500">:</span>
                                    <span className="text-xl font-bold text-slate-600 dark:text-slate-300">
                                      {userPrediction.predictedAwayScore}
                                    </span>
                                  </div>
                                </div>
                                {userPrediction.totalPoints !== null && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                      Points
                                    </span>
                                    <span className={`text-2xl font-black ${
                                      userPrediction.totalPoints >= 8
                                        ? 'text-green-600 dark:text-green-400'
                                        : userPrediction.totalPoints >= 3
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {userPrediction.totalPoints}
                                    </span>
                                    <Badge
                                      className={`px-2.5 py-1 text-xs font-bold ${
                                        userPrediction.totalPoints >= 8
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-600'
                                          : userPrediction.totalPoints >= 3
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-600'
                                      }`}
                                    >
                                      {userPrediction.totalPoints >= 8 && 'Perfect!'}
                                      {userPrediction.totalPoints >= 3 && userPrediction.totalPoints < 8 && 'Good'}
                                      {userPrediction.totalPoints === 0 && 'Missed'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {/* Prediction Section for Open/Editable matches */}
                            {canPredict ? (
                              <div className="flex flex-col items-center gap-1.5 w-full">
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                  {isEditing ? 'Update Prediction' : userPrediction ? 'Your Prediction' : 'Make Prediction'}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <Input
                                        type="number"
                                        min="0"
                                        className="w-14 h-11 text-center text-lg font-bold text-orange-600 dark:text-orange-400 border-2 border-orange-400 dark:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                        placeholder="0"
                                        value={predictions[match.id]?.home || ''}
                                        onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                                      />
                                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400">:</span>
                                      <Input
                                        type="number"
                                        min="0"
                                        className="w-14 h-11 text-center text-lg font-bold text-orange-600 dark:text-orange-400 border-2 border-orange-400 dark:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                        placeholder="0"
                                        value={predictions[match.id]?.away || ''}
                                        onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                                      />
                                    </>
                                  ) : userPrediction ? (
                                    <>
                                      <div className="w-14 h-11 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600">
                                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                          {userPrediction.predictedHomeScore}
                                        </span>
                                      </div>
                                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">:</span>
                                      <div className="w-14 h-11 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600">
                                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                          {userPrediction.predictedAwayScore}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-14 h-11 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700">
                                        <span className="text-lg text-blue-400 dark:text-blue-500">?</span>
                                      </div>
                                      <span className="text-xl font-bold text-blue-400 dark:text-blue-500">:</span>
                                      <div className="w-14 h-11 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700">
                                        <span className="text-lg text-blue-400 dark:text-blue-500">?</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : !isFinished && userPrediction ? (
                              <div className="flex flex-col items-center gap-1.5 w-full">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Your Prediction (Locked)
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-14 h-11 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 opacity-75">
                                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                      {userPrediction.predictedHomeScore}
                                    </span>
                                  </div>
                                  <span className="text-xl font-bold text-slate-500 dark:text-slate-400">:</span>
                                  <div className="w-14 h-11 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 opacity-75">
                                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                      {userPrediction.predictedAwayScore}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {/* Away Team Section */}
                          <div className="flex-1 flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                              {getTeamLogo(match.awayTeam)}
                            </div>
                            <div className="text-left min-w-0">
                              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                {match.awayTeam.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {match.awayTeam.shortName || 'Away'}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          {canPredict && (
                            <div className="flex-shrink-0">
                              <Button
                                onClick={() => {
                                  if (isEditing) {
                                    handleSubmitPrediction(match.id);
                                  } else {
                                    handleChangeClick(match.id, userPrediction);
                                  }
                                }}
                                className={`min-w-[100px] font-semibold shadow-md transition-all duration-200 h-9 ${
                                  isEditing
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                    : userPrediction
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                }`}
                              >
                                {isEditing ? 'Save' : userPrediction ? 'Edit' : 'Predict'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile-only Predict Button */}
                      {canPredict && (
                        <Button
                          onClick={() => {
                            if (isEditing) {
                              handleSubmitPrediction(match.id);
                            } else {
                              handleChangeClick(match.id, userPrediction);
                            }
                          }}
                          className="w-full sm:hidden h-9"
                        >
                          {isEditing ? 'Update Prediction' : userPrediction ? 'Change Prediction' : 'Make Prediction'}
                        </Button>
                      )}

                      {/* Show message if no prediction and locked */}
                      {!userPrediction && !canPredict && !isFinished && (
                        <div className="border-t pt-2 sm:pt-3 text-xs sm:text-sm text-center text-slate-500 dark:text-slate-400">
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
