'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { groupsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  email: string;
  avatar?: string;
  points: number;
  role: string;
  joinedAt: string;
}

interface GroupDetails {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  isPrivate: boolean;
  joinCode?: string;
  leagueId?: number;
  allowedTeamIds: number[];
  maxMembers: number;
  league?: {
    id: number;
    name: string;
    logoUrl?: string;
  };
  owner: {
    id: number;
    username: string;
    email: string;
  };
  members: Array<{
    id: number;
    role: string;
    totalPoints: number;
    joinedAt: string;
    user: {
      id: number;
      username: string;
      email: string;
      avatar?: string;
    };
  }>;
}

function GroupDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = parseInt(params.id as string);

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, leaderboardRes] = await Promise.all([
        groupsApi.getById(groupId),
        groupsApi.getLeaderboard(groupId)
      ]);

      setGroup(groupRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
    } catch (error: any) {
      console.error('Error fetching group:', error);
      if (error.response?.status === 403) {
        alert('You do not have access to this group');
        router.push('/groups');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setLeaving(true);
    try {
      await groupsApi.leave(groupId);
      alert('Successfully left the group');
      router.push('/groups');
    } catch (error: any) {
      console.error('Error leaving group:', error);
      alert(error.response?.data?.message || 'Failed to leave group');
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await groupsApi.delete(groupId);
      alert('Group deleted successfully');
      router.push('/groups');
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      OWNER: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      MEMBER: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
    };
    return colors[role as keyof typeof colors] || colors.MEMBER;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Group not found</p>
          <Link href="/groups">
            <Button className="mt-4">Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = group.owner.id === user?.id;
  const isMember = group.members.some(m => m.user.id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/groups">
            <Button variant="ghost" className="mb-4">
              ← Back to Groups
            </Button>
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {group.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {group.description || 'No description'}
              </p>
            </div>

            <div className="flex gap-2">
              {group.isPublic && (
                <Badge variant="secondary">Public</Badge>
              )}
              {group.isPrivate && (
                <Badge variant="default">Private</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>League</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {group.league?.name || 'Multiple Leagues'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {group.members.length} / {group.maxMembers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{group.owner.username}</p>
            </CardContent>
          </Card>
        </div>

        {/* Join Code (for owners) */}
        {isOwner && group.joinCode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Join Code</CardTitle>
              <CardDescription>Share this code with friends to invite them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 font-mono text-2xl font-bold bg-slate-100 dark:bg-slate-800 p-4 rounded text-center">
                  {group.joinCode}
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(group.joinCode!);
                    alert('Join code copied to clipboard!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Group rankings based on prediction points</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                No predictions yet in this group
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow
                      key={entry.userId}
                      className={entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    >
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
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadge(entry.role)}>
                          {entry.role}
                        </Badge>
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

        {/* Actions */}
        {isMember && !group.isPublic && (
          <div className="flex justify-end gap-4">
            {isOwner ? (
              <Button
                variant="destructive"
                onClick={handleDeleteGroup}
              >
                Delete Group
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                disabled={leaving}
              >
                {leaving ? 'Leaving...' : 'Leave Group'}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GroupDetailPage() {
  return (
    <ProtectedRoute>
      <GroupDetailContent />
    </ProtectedRoute>
  );
}
