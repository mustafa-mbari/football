'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { footballDataApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

// Predefined competitions for free tier (12 competitions limit)
const COMPETITIONS = [
  { code: 'PL', name: 'Premier League', country: 'England' },
  { code: 'PD', name: 'La Liga', country: 'Spain' },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany' },
  { code: 'SA', name: 'Serie A', country: 'Italy' },
  { code: 'FL1', name: 'Ligue 1', country: 'France' },
  { code: 'DED', name: 'Eredivisie', country: 'Netherlands' },
  { code: 'PPL', name: 'Primeira Liga', country: 'Portugal' },
  { code: 'CL', name: 'Champions League', country: 'Europe' },
  { code: 'ELC', name: 'Championship', country: 'England' },
  { code: 'EC', name: 'European Championship', country: 'Europe' },
  { code: 'WC', name: 'World Cup', country: 'International' },
  { code: 'CLI', name: 'Copa Libertadores', country: 'South America' }
];

const MATCH_STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'LIVE', label: 'Live' },
  { value: 'IN_PLAY', label: 'In Play' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export default function FootballDataApiPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form states
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [matchday, setMatchday] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [matchStatus, setMatchStatus] = useState('');
  const [season, setSeason] = useState('2024');

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
  }, [user, router]);

  // Fetch teams when competition or season changes
  useEffect(() => {
    if (selectedCompetition) {
      fetchTeams();
    } else {
      setTeams([]);
      setSelectedTeam('');
    }
  }, [selectedCompetition, season]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    setError(null);
    try {
      const response = await footballDataApi.getTeams(selectedCompetition, season);
      if (response.data.success) {
        setTeams(response.data.data.teams || []);
      }
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || 'Failed to fetch teams');
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const params: any = {};

      if (selectedCompetition) params.competitionCode = selectedCompetition;
      if (selectedTeam && selectedTeam !== 'all') params.teamId = parseInt(selectedTeam);
      if (matchday) params.matchday = parseInt(matchday);
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (matchStatus && matchStatus !== 'all') params.status = matchStatus;
      if (season) params.season = season;

      const response = await footballDataApi.getMatches(params);
      setApiResponse(response.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      setApiResponse(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchStandings = async () => {
    if (!selectedCompetition) {
      setError('Please select a competition first');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await footballDataApi.getStandings(
        selectedCompetition,
        season || undefined,
        matchday ? parseInt(matchday) : undefined
      );
      setApiResponse(response.data);
    } catch (err: any) {
      console.error('Error fetching standings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch standings');
      setApiResponse(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCompetition('');
    setSelectedTeam('');
    setMatchday('');
    setDateFrom('');
    setDateTo('');
    setMatchStatus('');
    setSeason('2024');
    setApiResponse(null);
    setError(null);
    setTeams([]);
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Football Data API
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Explore and test the football-data.org API integration
        </p>
        <Badge variant="outline" className="mt-2">
          Free Tier: 12 competitions • 10 calls/minute • Delayed data
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>API Filters</CardTitle>
              <CardDescription>
                Configure filters to query the API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Competition Selector */}
              <div className="space-y-2">
                <Label htmlFor="competition">Competition</Label>
                <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                  <SelectTrigger id="competition">
                    <SelectValue placeholder="Select a competition" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPETITIONS.map((comp) => (
                      <SelectItem key={comp.code} value={comp.code}>
                        {comp.name} ({comp.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Season Input */}
              <div className="space-y-2">
                <Label htmlFor="season">Season (Year)</Label>
                <Input
                  id="season"
                  type="number"
                  placeholder="2024"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                />
              </div>

              {/* Team Selector */}
              <div className="space-y-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select
                  value={selectedTeam}
                  onValueChange={setSelectedTeam}
                  disabled={!selectedCompetition || loadingTeams}
                >
                  <SelectTrigger id="team">
                    <SelectValue placeholder={
                      loadingTeams ? 'Loading teams...' :
                      !selectedCompetition ? 'Select competition first' :
                      'Select a team'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All teams</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Matchday Input */}
              <div className="space-y-2">
                <Label htmlFor="matchday">Matchday/Week (Optional)</Label>
                <Input
                  id="matchday"
                  type="number"
                  placeholder="e.g., 11"
                  value={matchday}
                  onChange={(e) => setMatchday(e.target.value)}
                  min="1"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From (Optional)</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To (Optional)</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Match Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Match Status (Optional)</Label>
                <Select value={matchStatus} onValueChange={setMatchStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {MATCH_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2 border-t">
                <Button
                  onClick={handleFetchData}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Fetching...' : 'Fetch Matches'}
                </Button>

                <Button
                  onClick={handleFetchStandings}
                  disabled={loading || !selectedCompetition}
                  variant="secondary"
                  className="w-full"
                >
                  {loading ? 'Fetching...' : 'Fetch Standings'}
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mt-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">
                  Rate Limits:
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  10 calls per minute on free tier. Data may be delayed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Response</CardTitle>
                  <CardDescription>
                    JSON data from football-data.org API
                  </CardDescription>
                </div>
                {apiResponse && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={viewMode === 'formatted' ? 'default' : 'outline'}
                      onClick={() => setViewMode('formatted')}
                    >
                      Formatted
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'raw' ? 'default' : 'outline'}
                      onClick={() => setViewMode('raw')}
                    >
                      Raw
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!apiResponse ? (
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  <p className="text-lg mb-2">No data yet</p>
                  <p className="text-sm">Configure filters and click "Fetch Matches" or "Fetch Standings"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* View Toggle Info */}
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>
                      Viewing: <strong>{viewMode === 'formatted' ? 'Formatted' : 'Raw'}</strong> JSON
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
                        alert('Copied to clipboard!');
                      }}
                    >
                      Copy JSON
                    </Button>
                  </div>

                  {/* JSON Display */}
                  <div className="relative">
                    <pre className={`overflow-auto p-4 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm ${
                      viewMode === 'formatted' ? 'max-h-[600px]' : 'max-h-[600px]'
                    }`}>
                      <code className="text-slate-900 dark:text-slate-100">
                        {viewMode === 'formatted'
                          ? JSON.stringify(apiResponse, null, 2)
                          : JSON.stringify(apiResponse)
                        }
                      </code>
                    </pre>
                  </div>

                  {/* Response Stats */}
                  {apiResponse.data?.matches && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {apiResponse.data.matches.length}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {apiResponse.data.competition?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Competition</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {apiResponse.data.filters?.season || season}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Season</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentation Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Quick reference for football-data.org API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Available Endpoints:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GET /competitions</code> - List all competitions</li>
                <li>• <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GET /competitions/{'{code}'}/teams</code> - Get teams</li>
                <li>• <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GET /competitions/{'{code}'}/matches</code> - Get matches</li>
                <li>• <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GET /competitions/{'{code}'}/standings</code> - Get standings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Free Tier Limitations:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Maximum 12 competitions</li>
                <li>• 10 API calls per minute</li>
                <li>• Scores and fixtures are delayed</li>
                <li>• League tables available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
