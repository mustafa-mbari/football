'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { leaderboardApi } from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  totalPoints: number;
  totalPredictions: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await leaderboardApi.get();
        setLeaderboard(response.data.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer">⚽ Football Predictions</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/leaderboard">
                <Button variant="ghost">Leaderboard</Button>
              </Link>
              <Link href="/login">
                <Button variant="default">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">🏆 Leaderboard</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Top predictors across all leagues
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400">Loading leaderboard...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>Based on total points earned from predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                  No predictions yet. Be the first to make a prediction!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-right">Predictions</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{entry.rank}</span>
                            <span className="text-xl">{getMedalEmoji(entry.rank)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{entry.username}</TableCell>
                        <TableCell className="text-right">{entry.totalPredictions}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="font-bold">
                            {entry.totalPoints}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Scoring System</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>🎯 <strong>3 points</strong> - Exact score prediction</li>
            <li>✓ <strong>1 point</strong> - Correct outcome (win/draw/loss)</li>
            <li>✗ <strong>0 points</strong> - Incorrect prediction</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
