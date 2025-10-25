'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { teamsApi, footballDataApi } from '@/lib/api';

interface League {
  id: number;
  name: string;
  code: string;
}

interface Team {
  id: number;
  name: string;
  code: string;
  shortName?: string;
  logoUrl?: string;
  leagues?: {
    league: League;
  }[];
}

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  crest: string;
  website?: string;
  founded?: number;
  venue?: string;
  clubColors?: string;
}

interface ManageTeamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  league: {
    id: number;
    name: string;
    code: string;
  };
  onTeamsUpdated: () => void;
}

export default function ManageTeamsDialog({
  open,
  onOpenChange,
  league,
  onTeamsUpdated
}: ManageTeamsDialogProps) {
  const [activeTab, setActiveTab] = useState('existing');

  // Add Existing Teams Tab
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeagueId, setFilterLeagueId] = useState<number | null>(null);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Create New Team Tab
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    code: '',
    shortName: '',
    apiName: '',
    logoUrl: '',
    stadiumName: '',
    foundedYear: '',
    website: '',
    primaryColor: ''
  });
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Fetch from API Tab
  const [competitionCode, setCompetitionCode] = useState('');
  const [season, setSeason] = useState('');
  const [apiTeams, setApiTeams] = useState<ApiTeam[]>([]);
  const [selectedApiTeams, setSelectedApiTeams] = useState<number[]>([]);
  const [fetchingApi, setFetchingApi] = useState(false);
  const [importingApi, setImportingApi] = useState(false);

  // Load available teams not in current league
  useEffect(() => {
    if (open) {
      loadTeamsNotInLeague();
      loadAllLeagues();
    }
  }, [open, league.id]);

  // Filter teams based on search and league filter
  useEffect(() => {
    let filtered = allTeams;

    if (searchQuery) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterLeagueId) {
      filtered = filtered.filter(team =>
        team.leagues?.some(tl => tl.league.id === filterLeagueId)
      );
    }

    setFilteredTeams(filtered);
  }, [allTeams, searchQuery, filterLeagueId]);

  const loadTeamsNotInLeague = async () => {
    setLoadingTeams(true);
    try {
      const response = await teamsApi.getNotInLeague(league.id);
      setAllTeams(response.data.data);
      setFilteredTeams(response.data.data);
    } catch (error: any) {
      console.error('Error loading teams:', error);
      alert(error.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadAllLeagues = async () => {
    try {
      const response = await fetch('/api/leagues?includeInactive=true');
      const data = await response.json();
      setAllLeagues(data.data || []);
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
  };

  const handleAddExistingTeams = async () => {
    if (selectedTeams.length === 0) {
      alert('Please select at least one team');
      return;
    }

    try {
      await teamsApi.addToLeague(league.id, selectedTeams);
      alert(`Successfully added ${selectedTeams.length} team(s) to ${league.name}`);
      setSelectedTeams([]);
      loadTeamsNotInLeague();
      onTeamsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add teams');
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamData.name || !newTeamData.code) {
      alert('Team name and code are required');
      return;
    }

    setCreatingTeam(true);
    try {
      await teamsApi.create({
        ...newTeamData,
        foundedYear: newTeamData.foundedYear ? parseInt(newTeamData.foundedYear) : undefined,
        leagueId: league.id
      });

      alert('Team created and added to league successfully!');
      setNewTeamData({
        name: '',
        code: '',
        shortName: '',
        apiName: '',
        logoUrl: '',
        stadiumName: '',
        foundedYear: '',
        website: '',
        primaryColor: ''
      });
      loadTeamsNotInLeague();
      onTeamsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleFetchFromApi = async () => {
    if (!competitionCode) {
      alert('Please enter a competition code (e.g., CL, PL, PD)');
      return;
    }

    setFetchingApi(true);
    try {
      const response = await footballDataApi.fetchAndImportTeams(competitionCode, {
        season: season || undefined
      });

      setApiTeams(response.data.data.apiTeams || []);
      setSelectedApiTeams([]);
      alert(`Found ${response.data.data.apiTeams?.length || 0} teams`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch teams from API');
    } finally {
      setFetchingApi(false);
    }
  };

  const handleImportFromApi = async () => {
    if (selectedApiTeams.length === 0) {
      alert('Please select at least one team to import');
      return;
    }

    setImportingApi(true);
    try {
      const response = await footballDataApi.fetchAndImportTeams(competitionCode, {
        season: season || undefined,
        leagueId: league.id,
        importSelected: selectedApiTeams
      });

      const imported = response.data.data.imported;
      alert(
        `Successfully imported ${imported.count} team(s).\n` +
        `Skipped: ${imported.skipped}\n` +
        (imported.errors.length > 0 ? `Errors: ${imported.errors.join(', ')}` : '')
      );

      setSelectedApiTeams([]);
      setApiTeams([]);
      setCompetitionCode('');
      setSeason('');
      loadTeamsNotInLeague();
      onTeamsUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to import teams');
    } finally {
      setImportingApi(false);
    }
  };

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const toggleApiTeamSelection = (teamId: number) => {
    setSelectedApiTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Teams - {league.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="existing">Add Existing Teams</TabsTrigger>
            <TabsTrigger value="create">Create New Team</TabsTrigger>
            <TabsTrigger value="api">Fetch from API</TabsTrigger>
          </TabsList>

          {/* Add Existing Teams Tab */}
          <TabsContent value="existing" className="space-y-4">
            <div className="space-y-2">
              <Label>Search Teams</Label>
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Filter by League</Label>
              <select
                className="w-full p-2 border rounded"
                value={filterLeagueId || ''}
                onChange={(e) => setFilterLeagueId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All Leagues</option>
                {allLeagues.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {loadingTeams ? (
              <div className="text-center py-8 text-slate-600">Loading teams...</div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                No teams available to add
              </div>
            ) : (
              <div className="border rounded max-h-96 overflow-y-auto">
                {filteredTeams.map(team => (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b last:border-b-0"
                  >
                    <Checkbox
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={() => toggleTeamSelection(team.id)}
                    />
                    {team.logoUrl && (
                      <img src={team.logoUrl} alt={team.name} className="w-8 h-8 object-contain" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{team.name}</div>
                      <div className="text-xs text-slate-500">
                        {team.code}
                        {team.leagues && team.leagues.length > 0 && (
                          <span className="ml-2">
                            Currently in: {team.leagues.map(tl => tl.league.name).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAddExistingTeams}
                disabled={selectedTeams.length === 0}
                className="flex-1"
              >
                Add {selectedTeams.length > 0 ? `${selectedTeams.length} ` : ''}Selected Team(s)
              </Button>
            </div>
          </TabsContent>

          {/* Create New Team Tab */}
          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                  placeholder="e.g., Bayern Munich"
                />
              </div>

              <div>
                <Label htmlFor="code">Team Code *</Label>
                <Input
                  id="code"
                  value={newTeamData.code}
                  onChange={(e) => setNewTeamData({ ...newTeamData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., BAY"
                />
              </div>

              <div>
                <Label htmlFor="shortName">Short Name</Label>
                <Input
                  id="shortName"
                  value={newTeamData.shortName}
                  onChange={(e) => setNewTeamData({ ...newTeamData, shortName: e.target.value })}
                  placeholder="e.g., Bayern"
                />
              </div>

              <div>
                <Label htmlFor="apiName">API Name</Label>
                <Input
                  id="apiName"
                  value={newTeamData.apiName}
                  onChange={(e) => setNewTeamData({ ...newTeamData, apiName: e.target.value })}
                  placeholder="Name used by football-data.org"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={newTeamData.logoUrl}
                  onChange={(e) => setNewTeamData({ ...newTeamData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.svg"
                />
              </div>

              <div>
                <Label htmlFor="stadiumName">Stadium Name</Label>
                <Input
                  id="stadiumName"
                  value={newTeamData.stadiumName}
                  onChange={(e) => setNewTeamData({ ...newTeamData, stadiumName: e.target.value })}
                  placeholder="e.g., Allianz Arena"
                />
              </div>

              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={newTeamData.foundedYear}
                  onChange={(e) => setNewTeamData({ ...newTeamData, foundedYear: e.target.value })}
                  placeholder="e.g., 1900"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={newTeamData.website}
                  onChange={(e) => setNewTeamData({ ...newTeamData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  value={newTeamData.primaryColor}
                  onChange={(e) => setNewTeamData({ ...newTeamData, primaryColor: e.target.value })}
                  placeholder="e.g., Red"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateTeam}
              disabled={creatingTeam || !newTeamData.name || !newTeamData.code}
              className="w-full"
            >
              {creatingTeam ? 'Creating...' : `Create Team and Add to ${league.name}`}
            </Button>
          </TabsContent>

          {/* Fetch from API Tab */}
          <TabsContent value="api" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="competitionCode">Competition Code *</Label>
                <Input
                  id="competitionCode"
                  value={competitionCode}
                  onChange={(e) => setCompetitionCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CL, PL, PD, BL1, SA"
                />
                <p className="text-xs text-slate-500 mt-1">
                  CL=Champions League, PL=Premier League, PD=La Liga, BL1=Bundesliga, SA=Serie A
                </p>
              </div>

              <div>
                <Label htmlFor="season">Season (Optional)</Label>
                <Input
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>

            <Button
              onClick={handleFetchFromApi}
              disabled={fetchingApi || !competitionCode}
              className="w-full"
            >
              {fetchingApi ? 'Fetching...' : 'Fetch Teams from API'}
            </Button>

            {apiTeams.length > 0 && (
              <>
                <div className="border rounded max-h-96 overflow-y-auto">
                  {apiTeams.map(team => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b last:border-b-0"
                    >
                      <Checkbox
                        checked={selectedApiTeams.includes(team.id)}
                        onCheckedChange={() => toggleApiTeamSelection(team.id)}
                      />
                      {team.crest && (
                        <img src={team.crest} alt={team.name} className="w-8 h-8 object-contain" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{team.name}</div>
                        <div className="text-xs text-slate-500">
                          {team.shortName && `${team.shortName} • `}
                          {team.venue && `${team.venue} • `}
                          {team.founded && `Founded ${team.founded}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleImportFromApi}
                  disabled={importingApi || selectedApiTeams.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {importingApi
                    ? 'Importing...'
                    : `Import ${selectedApiTeams.length > 0 ? `${selectedApiTeams.length} ` : ''}Selected Team(s)`}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
