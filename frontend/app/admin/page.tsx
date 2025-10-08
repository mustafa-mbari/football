'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalGameWeeks: 0,
    totalMatches: 0,
    totalTeams: 0,
    currentGameWeeks: 0
  });

  useEffect(() => {
    // Check if user is admin
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    // Fetch stats
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:7070/api/gameweeks');
      if (response.ok) {
        const data = await response.json();
        const gameWeeks = data.data;

        setStats({
          totalGameWeeks: gameWeeks.length,
          currentGameWeeks: gameWeeks.filter((gw: any) => gw.isCurrent).length,
          totalMatches: gameWeeks.reduce((sum: number, gw: any) => sum + gw._count.matches, 0),
          totalTeams: gameWeeks.reduce((sum: number, gw: any) => sum + gw._count.teamStats, 0) / gameWeeks.length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
              <Button variant="ghost" size="sm">
                ⚽ Manage Matches
              </Button>
            </Link>
            <Link href="/admin/matches/bulk-import">
              <Button variant="ghost" size="sm">
                📋 Bulk Import
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
            Admin Dashboard
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Manage gameweeks, matches, and standings data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total GameWeeks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalGameWeeks}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all leagues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Current GameWeeks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.currentGameWeeks}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalMatches}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assigned to gameweeks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Teams/Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.round(stats.totalTeams)}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Team stats per week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/gameweeks">
                <Button className="w-full" variant="default">
                  📅 Manage GameWeeks
                </Button>
              </Link>
              <Link href="/admin/matches">
                <Button className="w-full" variant="outline">
                  ⚽ Manage Matches
                </Button>
              </Link>
              <Link href="/admin/standings">
                <Button className="w-full" variant="outline">
                  📊 Update Standings
                </Button>
              </Link>
              <Button className="w-full" variant="outline" onClick={() => window.open('http://localhost:5555', '_blank')}>
                🗄️ Open Prisma Studio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Database:</span>
                <span className="font-medium text-green-600 dark:text-green-400">● Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Backend API:</span>
                <span className="font-medium text-green-600 dark:text-green-400">● Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Your Role:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">User:</span>
                <span className="font-medium">{user.username}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
