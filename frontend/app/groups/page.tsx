'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { groupsApi, leaguesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface League {
  id: number;
  name: string;
  logoUrl?: string;
}

interface Team {
  id: number;
  name: string;
  shortName?: string;
  logoUrl?: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  isPrivate: boolean;
  joinCode?: string;
  leagueId?: number;
  league?: League;
  owner?: {
    id: number;
    username: string;
  };
  _count?: {
    members: number;
  };
  maxMembers: number;
}

function GroupsContent() {
  const { user } = useAuth();
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Create group dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);

  // Join group dialog
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [publicGroupsRes, userGroupsRes, leaguesRes] = await Promise.all([
        groupsApi.getPublic(),
        groupsApi.getUserGroups(),
        leaguesApi.getAll()
      ]);

      setPublicGroups(publicGroupsRes.data.data);
      setUserGroups(userGroupsRes.data.data);
      setLeagues(leaguesRes.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsForLeague = async (leagueId: number) => {
    try {
      // Assuming you have a teams API endpoint
      const response = await fetch(`http://localhost:7070/api/teams?leagueId=${leagueId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTeams(data.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleLeagueChange = (leagueId: string) => {
    const id = parseInt(leagueId);
    setSelectedLeague(id);
    setSelectedTeams([]);
    fetchTeamsForLeague(id);
  };

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName || !selectedLeague) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      await groupsApi.create({
        name: groupName,
        description: groupDescription,
        leagueId: selectedLeague,
        allowedTeamIds: selectedTeams.length > 0 ? selectedTeams : undefined,
        joinCode: joinCode || undefined
      });

      alert('Group created successfully!');
      setCreateDialogOpen(false);
      resetCreateForm();
      fetchData();
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: number, requiresCode: boolean) => {
    if (requiresCode && !joinCodeInput) {
      alert('Please enter the join code');
      return;
    }

    setJoining(true);
    try {
      await groupsApi.join(groupId, joinCodeInput || undefined);
      alert('Successfully joined the group!');
      setJoinDialogOpen(false);
      setJoinCodeInput('');
      fetchData();
    } catch (error: any) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const resetCreateForm = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedLeague(null);
    setSelectedTeams([]);
    setJoinCode('');
    setTeams([]);
  };

  const privateUserGroups = userGroups.filter(g => g.isPrivate);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Groups
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join public groups or create your own private group
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Private Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Private Group</DialogTitle>
                <DialogDescription>
                  Create a private group for you and your friends. Select which league and teams to track.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Group Name */}
                <div>
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input
                    id="groupName"
                    placeholder="My Awesome Group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your group..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* League Selection */}
                <div>
                  <Label htmlFor="league">League *</Label>
                  <Select value={selectedLeague?.toString() || ''} onValueChange={handleLeagueChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={league.id.toString()}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Selection */}
                {selectedLeague && teams.length > 0 && (
                  <div>
                    <Label>Select Teams (optional - leave empty for all teams)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto border rounded p-3">
                      {teams.map((team) => (
                        <div key={team.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`team-${team.id}`}
                            checked={selectedTeams.includes(team.id)}
                            onCheckedChange={() => toggleTeamSelection(team.id)}
                          />
                          <label
                            htmlFor={`team-${team.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {team.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedTeams.length === 0
                        ? 'All teams will be available'
                        : `${selectedTeams.length} team(s) selected`}
                    </p>
                  </div>
                )}

                {/* Join Code */}
                <div>
                  <Label htmlFor="joinCode">Custom Join Code (optional)</Label>
                  <Input
                    id="joinCode"
                    placeholder="Leave empty for auto-generated code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateGroup}
                  disabled={creating || !groupName || !selectedLeague}
                  className="w-full"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Join with Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Private Group</DialogTitle>
                <DialogDescription>
                  Enter the join code to join a private group
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="joinCodeInput">Join Code</Label>
                  <Input
                    id="joinCodeInput"
                    placeholder="Enter join code"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  />
                </div>

                <Button
                  onClick={() => {
                    // Find group by join code (this is a simplified version)
                    // In a real app, you'd have an API endpoint to search by code
                    alert('Please get the group link from the group owner');
                    setJoinDialogOpen(false);
                  }}
                  disabled={joining || !joinCodeInput}
                  className="w-full"
                >
                  {joining ? 'Joining...' : 'Join Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Public Groups */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Public League Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {publicGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>
                    {group.league?.name || 'All Leagues'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Members:</span>
                      <span className="font-semibold">{group._count?.members || 0}</span>
                    </div>
                    <Badge variant="secondary" className="w-full justify-center">
                      Public - Auto-join
                    </Badge>
                    <Link href={`/groups/${group.id}`}>
                      <Button variant="outline" className="w-full mt-2">
                        View Leaderboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Private Groups */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Your Private Groups
          </h2>
          {privateUserGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  You haven't joined any private groups yet
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {privateUserGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.owner?.id === user?.id && (
                        <Badge variant="default">Owner</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {group.league?.name || 'Multiple Leagues'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Members:</span>
                        <span className="font-semibold">
                          {group._count?.members || 0} / {group.maxMembers}
                        </span>
                      </div>
                      {group.joinCode && group.owner?.id === user?.id && (
                        <div className="text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Join Code:</span>
                          <div className="font-mono font-bold bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1">
                            {group.joinCode}
                          </div>
                        </div>
                      )}
                      <Link href={`/groups/${group.id}`}>
                        <Button className="w-full mt-2">
                          View Group
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsContent />
    </ProtectedRoute>
  );
}
