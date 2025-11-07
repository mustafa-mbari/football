'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api';

interface GameWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  isCurrent: boolean;
  league: {
    id: number;
    name: string;
    country: string;
    season: string;
  };
}

export default function EditGameWeekPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [gameWeek, setGameWeek] = useState<GameWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'SCHEDULED',
    isCurrent: false
  });

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchGameWeek();
  }, [user, router, params.id]);

  const fetchGameWeek = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/gameweeks/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const gw = data.data;
        setGameWeek(gw);

        // Format dates for input fields (YYYY-MM-DD)
        const startDate = new Date(gw.startDate).toISOString().split('T')[0];
        const endDate = new Date(gw.endDate).toISOString().split('T')[0];

        setFormData({
          startDate,
          endDate,
          status: gw.status || 'SCHEDULED',
          isCurrent: gw.isCurrent
        });
      }
    } catch (error) {
      console.error('Error fetching gameweek:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/gameweeks/${params.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          status: formData.status,
          isCurrent: formData.isCurrent
        }),
      });

      if (response.ok) {
        alert('GameWeek updated successfully!');
        router.push('/admin/gameweeks');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update gameweek');
      }
    } catch (error) {
      alert('Failed to update gameweek');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getLeagueFlag = (country: string): string => {
    const flags: { [key: string]: string } = {
      England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      Germany: '🇩🇪',
      Spain: '🇪🇸',
    };
    return flags[country] || '⚽';
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading gameweek...</p>
        </div>
      </div>
    );
  }

  if (!gameWeek) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">GameWeek not found</p>
          <Link href="/admin/gameweeks">
            <Button>Back to GameWeeks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/admin/gameweeks">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to GameWeeks
            </Button>
          </Link>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Edit GameWeek
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {getLeagueFlag(gameWeek.league.country)} {gameWeek.league.name} - Week {gameWeek.weekNumber}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>GameWeek Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="weekNumber">Week Number (Read-only)</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  value={gameWeek.weekNumber}
                  disabled
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="POSTPONED">Postponed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isCurrent"
                  type="checkbox"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isCurrent" className="cursor-pointer">
                  Mark as Current GameWeek
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/gameweeks')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </main>
  );
}
