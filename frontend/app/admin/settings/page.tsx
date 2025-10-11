'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [predictionDeadlineHours, setPredictionDeadlineHours] = useState('4');

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [user, router]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.data);

      const deadlineSetting = response.data.data.find(
        (s: Setting) => s.key === 'PREDICTION_DEADLINE_HOURS'
      );
      if (deadlineSetting) {
        setPredictionDeadlineHours(deadlineSetting.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/PREDICTION_DEADLINE_HOURS', {
        value: predictionDeadlineHours,
        description: 'Hours before match start when predictions are locked'
      });
      alert('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Application Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure system-wide settings for the application
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Settings</CardTitle>
              <CardDescription>
                Configure how predictions work in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="predictionDeadline">
                  Prediction Deadline (Hours before match)
                </Label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 max-w-xs">
                    <Input
                      id="predictionDeadline"
                      type="number"
                      min="0"
                      max="48"
                      value={predictionDeadlineHours}
                      onChange={(e) => setPredictionDeadlineHours(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Users cannot make or change predictions within this time before a match starts
                    </p>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Current Configuration
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>
                    Predictions lock <strong>{predictionDeadlineHours} hours</strong> before match kickoff
                  </li>
                  <li>
                    Users can update their predictions anytime before the deadline
                  </li>
                  <li>
                    Once locked, predictions cannot be changed
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Settings</CardTitle>
              <CardDescription>
                View all configured settings in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {setting.key}
                      </p>
                      {setting.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {setting.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
