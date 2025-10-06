'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!registerEmail || !registerUsername || !registerPassword) {
      setError('All fields are required');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
      });

      // Auto login after registration
      await login(registerEmail, registerPassword);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            ⚽ Football Predictions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
            Predict Match Results, Compete with Friends
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Join thousands of football fans making predictions for top leagues!
          </p>
        </div>

        {/* Auth Card */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-center gap-4 mb-4">
                <Button
                  variant={isLogin ? 'default' : 'outline'}
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className="w-32"
                >
                  Login
                </Button>
                <Button
                  variant={!isLogin ? 'default' : 'outline'}
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className="w-32"
                >
                  Register
                </Button>
              </div>
              <CardTitle>{isLogin ? 'Welcome Back!' : 'Create Account'}</CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Login to continue making predictions'
                  : 'Sign up to start predicting match results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {isLogin ? (
                // Login Form
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">🎯 Make Predictions</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-600 dark:text-slate-400">
              Predict scores for matches across top leagues including Premier League, Bundesliga, and more
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">🏆 Compete & Win</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-600 dark:text-slate-400">
              Climb the leaderboard by earning points. Get 3 points for exact scores, 1 for correct outcomes
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">👥 Join Groups</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-600 dark:text-slate-400">
              Create or join groups to compete with friends, family, and colleagues
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
