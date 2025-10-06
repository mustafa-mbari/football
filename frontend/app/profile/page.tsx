'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileContent() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.username}</h2>
                <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                <p className="text-sm text-slate-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Admin Button */}
          {isAdmin && (
            <Link href="/admin">
              <Button variant="default" size="lg" className="w-full md:w-auto">
                🛡️ Admin Page
              </Button>
            </Link>
          )}
        </div>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your account settings and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <p className="mt-1 text-slate-900 dark:text-white">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <p className="mt-1 text-slate-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Role
                </label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    user.role === 'MODERATOR' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Member Since
                </label>
                <p className="mt-1 text-slate-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to important pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start">
                  📊 Dashboard
                </Button>
              </Link>
              <Link href="/tables">
                <Button variant="outline" className="w-full justify-start">
                  📋 League Tables
                </Button>
              </Link>
              <Link href="/predict">
                <Button variant="outline" className="w-full justify-start">
                  🎯 Make Predictions
                </Button>
              </Link>
              <Link href="/group">
                <Button variant="outline" className="w-full justify-start">
                  👥 Groups
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" disabled>
                🔒 Change Password (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                ✏️ Update Profile (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                🔔 Notification Settings (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
