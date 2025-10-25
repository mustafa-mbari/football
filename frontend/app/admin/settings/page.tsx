'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { settingsApi, api, exportApi, leaguesApi, gameWeeksApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface PointsRule {
  id: number;
  name: string;
  description: string;
  points: number;
  type: string;
  priority: number;
  isActive: boolean;
}

interface RecalculationResult {
  success: boolean;
  message: string;
  stats?: {
    totalMatches: number;
    totalPredictions: number;
    updatedPredictions: number;
    totalPointsAwarded: number;
    averagePoints: string;
  };
}

interface League {
  id: number;
  name: string;
  code: string;
}

interface GameWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  leagueId: number;
}

interface ExportableTable {
  key: string;
  name: string;
}

interface ExportResult {
  success: boolean;
  message: string;
  data?: {
    exportedFiles: Array<{
      table: string;
      fileName: string;
      count: number;
    }>;
    exportDir: string;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [predictionDeadlineHours, setPredictionDeadlineHours] = useState(4);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([]);
  const [recalcResult, setRecalcResult] = useState<RecalculationResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recalculation filters
  const [leagues, setLeagues] = useState<League[]>([]);
  const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedGameWeek, setSelectedGameWeek] = useState<string>('all');

  // Export state
  const [availableTables, setAvailableTables] = useState<ExportableTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      // Fetch prediction deadline setting
      const settingResponse = await settingsApi.getSetting('PREDICTION_DEADLINE_HOURS');
      setPredictionDeadlineHours(parseInt(settingResponse.data.data.value));

      // Fetch points rules (if endpoint exists)
      try {
        const rulesResponse = await api.get('/points-rules');
        if (rulesResponse.data.success) {
          setPointsRules(rulesResponse.data.data);
        }
      } catch (error) {
        console.log('Points rules endpoint not available');
      }

      // Fetch leagues
      try {
        const leaguesResponse = await leaguesApi.getAll();
        if (leaguesResponse.data.success) {
          setLeagues(leaguesResponse.data.data);
        }
      } catch (error) {
        console.log('Leagues endpoint not available');
      }

      // Fetch gameweeks
      try {
        const gameWeeksResponse = await gameWeeksApi.getAll();
        if (gameWeeksResponse.data.success) {
          setGameWeeks(gameWeeksResponse.data.data);
        }
      } catch (error) {
        console.log('GameWeeks endpoint not available');
      }

      // Fetch available tables for export
      try {
        const tablesResponse = await exportApi.getAvailableTables();
        if (tablesResponse.data.success) {
          setAvailableTables(tablesResponse.data.data);
        }
      } catch (error) {
        console.log('Export endpoint not available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveDeadline = async () => {
    setSaving(true);
    try {
      await settingsApi.updateSetting('PREDICTION_DEADLINE_HOURS', {
        value: predictionDeadlineHours.toString(),
        description: 'Hours before match start when predictions are locked'
      });
      showMessage('success', 'Prediction deadline updated successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to update deadline');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculatePoints = async () => {
    // Build confirmation message
    let scope = 'all predictions';
    if (selectedLeague !== 'all' && selectedGameWeek !== 'all') {
      const league = leagues.find(l => l.id === parseInt(selectedLeague));
      const gameWeek = gameWeeks.find(gw => gw.id === parseInt(selectedGameWeek));
      scope = `predictions for ${league?.name} - Gameweek ${gameWeek?.weekNumber}`;
    } else if (selectedLeague !== 'all') {
      const league = leagues.find(l => l.id === parseInt(selectedLeague));
      scope = `all predictions for ${league?.name}`;
    } else if (selectedGameWeek !== 'all') {
      const gameWeek = gameWeeks.find(gw => gw.id === parseInt(selectedGameWeek));
      scope = `all predictions for Gameweek ${gameWeek?.weekNumber}`;
    }

    if (!confirm(`This will recalculate ${scope}. Are you sure?`)) {
      return;
    }

    setRecalculating(true);
    setRecalcResult(null);

    try {
      const payload: any = {};
      if (selectedLeague !== 'all') {
        payload.leagueId = selectedLeague;
      }
      if (selectedGameWeek !== 'all') {
        payload.gameWeekId = selectedGameWeek;
      }

      const response = await api.post('/predictions/recalculate-all-points', payload);
      setRecalcResult(response.data);
      showMessage('success', 'Points recalculated successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to recalculate points');
      setRecalcResult({
        success: false,
        message: error.response?.data?.message || 'Failed to recalculate points'
      });
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleTable = (tableKey: string) => {
    setSelectedTables(prev =>
      prev.includes(tableKey)
        ? prev.filter(key => key !== tableKey)
        : [...prev, tableKey]
    );
  };

  const handleSelectAll = () => {
    if (selectedTables.length === availableTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(availableTables.map(t => t.key));
    }
  };

  const handleExportData = async () => {
    if (selectedTables.length === 0) {
      showMessage('error', 'Please select at least one table to export');
      return;
    }

    if (!confirm(`This will export ${selectedTables.length} table(s) and OVERWRITE existing seed files. Are you sure?`)) {
      return;
    }

    setExporting(true);
    setExportResult(null);

    try {
      const response = await exportApi.exportData(selectedTables);
      setExportResult(response.data);
      showMessage('success', 'Data exported successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to export data');
      setExportResult({
        success: false,
        message: error.response?.data?.message || 'Failed to export data'
      });
    } finally {
      setExporting(false);
    }
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Application Settings
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Configure prediction settings, points rules, and system preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Prediction Deadline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Deadline</CardTitle>
              <CardDescription>
                Set how many hours before kickoff predictions will be locked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Hours Before Kickoff</Label>
                <Input
                  id="deadline"
                  type="number"
                  min="0"
                  max="72"
                  value={predictionDeadlineHours}
                  onChange={(e) => setPredictionDeadlineHours(parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Current: <strong>{predictionDeadlineHours} hour{predictionDeadlineHours !== 1 ? 's' : ''}</strong> before match starts
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveDeadline}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saving...' : 'Save Deadline Setting'}
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Predictions are locked X hours before match starts</li>
                  <li>• Users can update predictions until the deadline</li>
                  <li>• After deadline, the "Predict" button is disabled</li>
                  <li>• Changes apply immediately to all users</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Points Recalculation Card - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle>Points Recalculation</CardTitle>
              <CardDescription>
                Recalculate points for predictions with optional league and gameweek filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="league-filter">League Filter</Label>
                  <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                    <SelectTrigger id="league-filter">
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leagues</SelectItem>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={league.id.toString()}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gameweek-filter">Gameweek Filter</Label>
                  <Select value={selectedGameWeek} onValueChange={setSelectedGameWeek}>
                    <SelectTrigger id="gameweek-filter">
                      <SelectValue placeholder="Select gameweek" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gameweeks</SelectItem>
                      {gameWeeks
                        .filter(gw => selectedLeague === 'all' || gw.leagueId === parseInt(selectedLeague))
                        .sort((a, b) => a.weekNumber - b.weekNumber)
                        .map((gameWeek) => {
                          const league = leagues.find(l => l.id === gameWeek.leagueId);
                          return (
                            <SelectItem key={gameWeek.id} value={gameWeek.id.toString()}>
                              {league?.name} - Week {gameWeek.weekNumber}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Important:</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>• This will recalculate points based on current scoring rules</li>
                  <li>• Use filters to recalculate specific league or gameweek only</li>
                  <li>• Group points will be automatically updated</li>
                  <li>• This process may take a few moments</li>
                  <li>• Only do this after updating points rules or fixing scores</li>
                </ul>
              </div>

              <Button
                onClick={handleRecalculatePoints}
                disabled={recalculating}
                variant="destructive"
                className="w-full"
              >
                {recalculating ? 'Recalculating...' : 'Recalculate Points'}
              </Button>

              {recalcResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  recalcResult.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    recalcResult.success
                      ? 'text-green-900 dark:text-green-300'
                      : 'text-red-900 dark:text-red-300'
                  }`}>
                    {recalcResult.success ? '✓ Success' : '✗ Error'}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    recalcResult.success
                      ? 'text-green-800 dark:text-green-400'
                      : 'text-red-800 dark:text-red-400'
                  }`}>
                    {recalcResult.message}
                  </p>
                  {recalcResult.stats && (
                    <div className="text-sm text-green-800 dark:text-green-400 space-y-1">
                      <p>• Matches Processed: {recalcResult.stats.totalMatches}</p>
                      <p>• Total Predictions: {recalcResult.stats.totalPredictions}</p>
                      <p>• Updated: {recalcResult.stats.updatedPredictions}</p>
                      <p>• Total Points Awarded: {recalcResult.stats.totalPointsAwarded}</p>
                      <p>• Average Points: {recalcResult.stats.averagePoints}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Points Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Current Points Rules</CardTitle>
            <CardDescription>
              These rules are used to calculate prediction points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pointsRules.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                No points rules configured yet
              </p>
            ) : (
              <div className="space-y-3">
                {pointsRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {rule.name}
                        </h4>
                        {rule.isActive ? (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {rule.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {rule.points}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Export/Backup Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Database Export / Backup</CardTitle>
            <CardDescription>
              Export selected database tables to seed files for backup or migration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">⚠️ Warning:</h4>
              <ul className="text-sm text-orange-800 dark:text-orange-400 space-y-1">
                <li>• This will OVERWRITE existing seed files in prisma/seeds/data/</li>
                <li>• Select which tables you want to export</li>
                <li>• Exported data can be used for backup or seeding new environments</li>
                <li>• Make sure you have a backup before exporting</li>
              </ul>
            </div>

            {availableTables.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <Label className="font-semibold">Select Tables to Export</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedTables.length === availableTables.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                    {availableTables.map((table) => (
                      <div
                        key={table.key}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Checkbox
                          id={table.key}
                          checked={selectedTables.includes(table.key)}
                          onCheckedChange={() => handleToggleTable(table.key)}
                        />
                        <label
                          htmlFor={table.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {table.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400 pt-2 border-t">
                    Selected: <strong>{selectedTables.length}</strong> out of <strong>{availableTables.length}</strong> tables
                  </div>
                </div>

                <Button
                  onClick={handleExportData}
                  disabled={exporting || selectedTables.length === 0}
                  className="w-full"
                  variant="default"
                >
                  {exporting ? 'Exporting...' : `Export ${selectedTables.length} Table(s)`}
                </Button>

                {exportResult && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    exportResult.success
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      exportResult.success
                        ? 'text-green-900 dark:text-green-300'
                        : 'text-red-900 dark:text-red-300'
                    }`}>
                      {exportResult.success ? '✓ Export Successful' : '✗ Export Failed'}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      exportResult.success
                        ? 'text-green-800 dark:text-green-400'
                        : 'text-red-800 dark:text-red-400'
                    }`}>
                      {exportResult.message}
                    </p>
                    {exportResult.data && (
                      <div className="text-sm text-green-800 dark:text-green-400 space-y-1">
                        <p className="font-semibold">Exported Files:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {exportResult.data.exportedFiles.map((file, index) => (
                            <li key={index}>
                              {file.table}: {file.count} record(s) → {file.fileName}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 font-mono text-xs bg-green-100 dark:bg-green-900/30 p-2 rounded">
                          📁 {exportResult.data.exportDir}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            ℹ️ Prediction System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-400">
            <div>
              <h4 className="font-semibold mb-2">When to Recalculate Points:</h4>
              <ul className="space-y-1">
                <li>• After manually updating match scores</li>
                <li>• After changing points rules in the database</li>
                <li>• When fixing data inconsistencies</li>
                <li>• After bulk imports of match results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Deadline Best Practices:</h4>
              <ul className="space-y-1">
                <li>• Standard: 1-4 hours before kickoff</li>
                <li>• Strict: 24 hours before kickoff</li>
                <li>• Casual: 30 minutes before kickoff</li>
                <li>• Consider your user base preferences</li>
              </ul>
            </div>
          </div>
        </div>
    </main>
  );
}
