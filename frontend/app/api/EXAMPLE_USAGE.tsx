/**
 * Example Component: How to use new API routes with SWR
 *
 * This demonstrates best practices for:
 * - Using SWR hooks for data fetching
 * - Optimistic UI updates
 * - Error handling
 * - Loading states
 * - Pagination
 */

'use client';

import { useState } from 'react';
import {
  useMatches,
  useLeaderboard,
  useMyPredictions,
  useCreatePrediction
} from '@/lib/hooks/useApi';

// ============== EXAMPLE 1: Matches List with Filters ==============

export function MatchesList() {
  const [leagueId, setLeagueId] = useState<number>(1);
  const [page, setPage] = useState(1);

  // ✅ Automatic caching, deduplication, revalidation
  const { matches, pagination, isLoading, isError, error } = useMatches({
    leagueId,
    limit: 20,
    page
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading matches...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error loading matches: {error?.info?.error || 'Unknown error'}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* League Filter */}
      <select
        value={leagueId}
        onChange={(e) => setLeagueId(parseInt(e.target.value))}
        className="mb-4 p-2 border rounded"
      >
        <option value={1}>Premier League</option>
        <option value={2}>La Liga</option>
        <option value={3}>Bundesliga</option>
      </select>

      {/* Matches List */}
      <div className="space-y-4">
        {matches?.map((match: any) => (
          <div key={match.id} className="p-4 border rounded">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src={match.homeTeam.logoUrl} alt="" className="w-8 h-8" />
                <span>{match.homeTeam.name}</span>
              </div>
              <div className="text-xl font-bold">
                {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
              </div>
              <div className="flex items-center gap-2">
                <span>{match.awayTeam.name}</span>
                <img src={match.awayTeam.logoUrl} alt="" className="w-8 h-8" />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {new Date(match.matchDate).toLocaleString()}
              <span className="ml-2 px-2 py-1 bg-blue-100 rounded">
                {match.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasMore}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ============== EXAMPLE 2: Leaderboard with Auto-Refresh ==============

export function Leaderboard() {
  const [leagueId, setLeagueId] = useState<number | undefined>(undefined);

  // ✅ Auto-refreshes every 5 minutes
  const { leaderboard, meta, isLoading, isError } = useLeaderboard({
    leagueId,
    limit: 50
  });

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  if (isError) {
    return <div>Error loading leaderboard</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <select
          value={leagueId || ''}
          onChange={(e) => setLeagueId(e.target.value ? parseInt(e.target.value) : undefined)}
          className="p-2 border rounded"
        >
          <option value="">All Leagues</option>
          <option value="1">Premier League</option>
          <option value="2">La Liga</option>
          <option value="3">Bundesliga</option>
        </select>
      </div>

      {/* Cache indicator */}
      {meta?.timestamp && (
        <div className="text-sm text-gray-500 mb-2">
          Last updated: {new Date(meta.timestamp).toLocaleTimeString()}
          {meta.runtime === 'edge' && <span className="ml-2 text-green-600">⚡ Edge</span>}
        </div>
      )}

      {/* Leaderboard Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Rank</th>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-right">Points</th>
            <th className="p-2 text-right">Predictions</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard?.map((user: any) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-2">
                <span className={user.rank <= 3 ? 'font-bold text-yellow-600' : ''}>
                  #{user.rank}
                </span>
              </td>
              <td className="p-2 flex items-center gap-2">
                {user.avatar && (
                  <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                )}
                {user.username}
              </td>
              <td className="p-2 text-right font-semibold">{user.totalPoints}</td>
              <td className="p-2 text-right text-gray-500">{user.totalPredictions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============== EXAMPLE 3: Create Prediction with Optimistic UI ==============

export function PredictionForm({ matchId }: { matchId: number }) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  const { createPrediction, isMutating, error } = useCreatePrediction();
  const { mutate: refreshPredictions } = useMyPredictions(); // For cache invalidation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Optimistic UI update happens automatically with SWR
      await createPrediction({
        matchId,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore
      });

      // ✅ Refresh predictions list
      refreshPredictions();

      alert('Prediction saved!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm mb-1">Home Score</label>
          <input
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={(e) => setHomeScore(parseInt(e.target.value))}
            className="w-20 p-2 border rounded"
            disabled={isMutating}
          />
        </div>

        <span className="text-2xl">:</span>

        <div>
          <label className="block text-sm mb-1">Away Score</label>
          <input
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={(e) => setAwayScore(parseInt(e.target.value))}
            className="w-20 p-2 border rounded"
            disabled={isMutating}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error.message}</div>
      )}

      <button
        type="submit"
        disabled={isMutating}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isMutating ? 'Saving...' : 'Save Prediction'}
      </button>
    </form>
  );
}

// ============== EXAMPLE 4: My Predictions with Infinite Scroll ==============

export function MyPredictions() {
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { predictions, pagination, isLoading, isError } = useMyPredictions({
    limit,
    offset
  });

  if (isLoading && offset === 0) {
    return <div>Loading your predictions...</div>;
  }

  if (isError) {
    return <div>Error loading predictions</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Predictions</h2>

      <div className="space-y-3">
        {predictions?.map((prediction: any) => (
          <div key={prediction.id} className="p-4 border rounded">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-semibold">
                  {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(prediction.match.matchDate).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* My Prediction */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">My Prediction</div>
                  <div className="font-bold">
                    {prediction.predictedHomeScore} : {prediction.predictedAwayScore}
                  </div>
                </div>

                {/* Actual Result */}
                {prediction.isProcessed && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Result</div>
                    <div className="font-bold">
                      {prediction.match.homeScore} : {prediction.match.awayScore}
                    </div>
                  </div>
                )}

                {/* Points */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">Points</div>
                  <div className={`font-bold ${prediction.totalPoints > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {prediction.totalPoints}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {pagination?.hasMore && (
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={isLoading}
          className="mt-4 w-full py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// ============== EXAMPLE 5: Data Prefetching on Hover ==============

import { prefetch } from '@/lib/hooks/useApi';

export function MatchCard({ matchId }: { matchId: number }) {
  const handleHover = () => {
    // ✅ Prefetch match details when user hovers
    // Data will be cached and instantly available if they click
    prefetch(`/api/matches/${matchId}`);
  };

  return (
    <div
      onMouseEnter={handleHover}
      className="p-4 border rounded cursor-pointer hover:bg-gray-50"
    >
      {/* Match card content */}
      <div>Match #{matchId}</div>
    </div>
  );
}

// ============== EXAMPLE 6: Manual Cache Invalidation ==============

export function AdminMatchScoreUpdate({ matchId }: { matchId: number }) {
  const { mutate: refreshMatches } = useMatches();
  const { mutate: refreshLeaderboard } = useLeaderboard();

  const handleScoreUpdate = async () => {
    // Update match score via API
    await fetch(`/api/admin/matches/${matchId}/score`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeScore: 2, awayScore: 1 })
    });

    // ✅ Manually invalidate caches
    refreshMatches(); // Refresh matches list
    refreshLeaderboard(); // Refresh leaderboard (points changed)

    alert('Score updated and caches refreshed!');
  };

  return (
    <button onClick={handleScoreUpdate} className="px-4 py-2 bg-red-600 text-white rounded">
      Update Score
    </button>
  );
}

// ============== PERFORMANCE TIPS ==============

/**
 * 1. Use SWR hooks instead of useEffect + fetch
 *    ❌ BAD:
 *      useEffect(() => { fetch('/api/matches').then(...) }, [])
 *    ✅ GOOD:
 *      const { matches } = useMatches()
 *
 * 2. Leverage automatic deduplication
 *    - Multiple components using useMatches() = 1 API call
 *    - SWR deduplicates requests within 10 seconds
 *
 * 3. Use optimistic updates for better UX
 *    - Update UI immediately, rollback on error
 *    - SWR handles this automatically with mutate()
 *
 * 4. Prefetch on hover for instant navigation
 *    - prefetch('/api/matches/123') when hovering link
 *    - Data instantly available when user clicks
 *
 * 5. Configure revalidation based on data freshness
 *    - Leaderboard: 5 minutes (changes slowly)
 *    - Matches: 1 minute (changes frequently during live games)
 *    - User predictions: 30 seconds (personalized data)
 *
 * 6. Use pagination for large lists
 *    - Always set reasonable limits (20-50 items)
 *    - Implement "load more" or page navigation
 *
 * 7. Monitor cache hit rates
 *    - Check Network tab in DevTools
 *    - Should see "from cache" for most requests
 *    - SWR shows cache status in React DevTools
 */
