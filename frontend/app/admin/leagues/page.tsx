'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { leaguesApi, api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface League {
  id: number;
  name: string;
  code: string;
  country?: string;
  logoUrl?: string;
  season: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  _count?: {
    teams: number;
    matches: number;
  };
}

export default function AdminLeaguesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    logoUrl: '',
    season: '',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 0
  });

  useEffect(() => {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    fetchLeagues();
  }, [user, router]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      // Admin should see all leagues including inactive
      const response = await api.get('/leagues?includeInactive=true');
      setLeagues(response.data.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      alert('Failed to fetch leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      country: '',
      logoUrl: '',
      season: '',
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 0
    });
    setIsCreating(false);
    setEditingLeague(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code || !formData.season || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await leaguesApi.create(formData);
      alert('League created successfully!');
      resetForm();
      fetchLeagues();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create league');
    }
  };

  const handleUpdate = async () => {
    if (!editingLeague) return;

    try {
      await leaguesApi.update(editingLeague.id, formData);
      alert('League updated successfully!');
      resetForm();
      fetchLeagues();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update league');
    }
  };

  const handleDelete = async (league: League) => {
    if (!confirm(`Are you sure you want to delete "${league.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await leaguesApi.delete(league.id);
      alert('League deleted successfully!');
      fetchLeagues();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete league');
    }
  };

  const handleToggleActive = async (league: League) => {
    try {
      await leaguesApi.toggleActive(league.id);
      alert(`League ${league.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchLeagues();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to toggle league status');
    }
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      code: league.code,
      country: league.country || '',
      logoUrl: league.logoUrl || '',
      season: league.season,
      startDate: league.startDate.split('T')[0],
      endDate: league.endDate.split('T')[0],
      isActive: league.isActive,
      priority: league.priority
    });
    setIsCreating(false);
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Manage Leagues
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Add, edit, and manage football leagues
            </p>
          </div>
          {!isCreating && !editingLeague && (
            <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
              + Add New League
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingLeague) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingLeague ? 'Edit League' : 'Create New League'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">League Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premier League"
                  />
                </div>

                <div>
                  <Label htmlFor="code">League Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., PL"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., England"
                  />
                </div>

                <div>
                  <Label htmlFor="season">Season *</Label>
                  <Input
                    id="season"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024/25"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleInputChange}
                    placeholder="/logos/serie-a/serie-a.svg or https://example.com/logo.svg"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use web path like /logos/serie-a/serie-a.svg (not Windows file path with backslashes)
                  </p>
                </div>

                <div>
                  <Label htmlFor="priority">Priority (for ordering)</Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    value={formData.priority}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Lower number = shown first (1 = first tab, 2 = second tab, etc.)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={editingLeague ? handleUpdate : handleCreate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingLeague ? 'Update League' : 'Create League'}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leagues List */}
        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading leagues...</div>
        ) : leagues.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400">
            No leagues found. Create your first league!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <Card key={league.id} className={!league.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {league.logoUrl && (
                          <img
                            src={league.logoUrl}
                            alt={league.name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <span>{league.name}</span>
                      </CardTitle>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {league.country} • {league.season}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Code: {league.code}
                        </p>
                      </div>
                    </div>
                    <Badge variant={league.isActive ? 'default' : 'secondary'}>
                      {league.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <span>{league._count?.teams || 0} Teams</span>
                    <span>{league._count?.matches || 0} Matches</span>
                    <span>Priority: {league.priority}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleEdit(league)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleActive(league)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      {league.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    {league._count?.teams === 0 && league._count?.matches === 0 && (
                      <Button
                        onClick={() => handleDelete(league)}
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </main>
  );
}
