/**
 * SWR Hooks for optimized data fetching
 *
 * Benefits:
 * - Automatic caching
 * - Deduplication (multiple components = 1 request)
 * - Auto-revalidation on focus/reconnect
 * - Optimistic UI updates
 * - Error retry with exponential backoff
 */

import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include' // Include cookies for auth
  });

  if (!res.ok) {
    const error: any = new Error('API request failed');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // Dedupe requests within 10s
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (client errors)
    return error.status >= 500;
  }
};

// ============== READ HOOKS (GET) ==============

/**
 * Fetch matches with optional filters
 * Example: const { matches, isLoading, error } = useMatches({ leagueId: 1 });
 */
export function useMatches(
  filters?: { leagueId?: number; status?: string; limit?: number; page?: number },
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (filters?.leagueId) params.set('leagueId', filters.leagueId.toString());
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.page) params.set('page', filters.page.toString());

  const url = `/api/matches${params.toString() ? `?${params}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 60000, // Refresh every 60s
      ...config
    }
  );

  return {
    matches: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    error,
    mutate // For manual revalidation
  };
}

/**
 * Fetch leaderboard
 * Example: const { leaderboard, isLoading } = useLeaderboard({ leagueId: 1 });
 */
export function useLeaderboard(
  filters?: { leagueId?: number; limit?: number },
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (filters?.leagueId) params.set('leagueId', filters.leagueId.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const url = `/api/leaderboard${params.toString() ? `?${params}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
      ...config
    }
  );

  return {
    leaderboard: data?.data,
    meta: data?.meta,
    isLoading,
    isError: error,
    error,
    mutate
  };
}

/**
 * Fetch user's predictions
 * Requires authentication
 */
export function useMyPredictions(
  filters?: { leagueId?: number; limit?: number; offset?: number },
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (filters?.leagueId) params.set('leagueId', filters.leagueId.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());

  const url = `/api/predictions${params.toString() ? `?${params}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 30000, // Refresh every 30s
      ...config
    }
  );

  return {
    predictions: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    error,
    mutate
  };
}

/**
 * Fetch single match by ID
 */
export function useMatch(matchId: number | null, config?: SWRConfiguration) {
  const url = matchId ? `/api/matches/${matchId}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      ...defaultConfig,
      ...config
    }
  );

  return {
    match: data?.data,
    isLoading,
    isError: error,
    error,
    mutate
  };
}

/**
 * Fetch all leagues
 */
export function useLeagues(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/leagues',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 60000, // Leagues rarely change
      ...config
    }
  );

  return {
    leagues: data?.data,
    isLoading,
    isError: error,
    error,
    mutate
  };
}

// ============== WRITE HOOKS (POST/PUT/DELETE) ==============

/**
 * Create or update a prediction
 * Example:
 *   const { trigger, isMutating } = useCreatePrediction();
 *   await trigger({ matchId: 1, predictedHomeScore: 2, predictedAwayScore: 1 });
 */
export function useCreatePrediction() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/predictions',
    async (url, { arg }: { arg: any }) => {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create prediction');
      }

      return res.json();
    }
  );

  return {
    createPrediction: trigger,
    isMutating,
    error
  };
}

/**
 * Login user
 */
export function useLogin() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/auth/login',
    async (url, { arg }: { arg: { email: string; password: string } }) => {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      return res.json();
    }
  );

  return {
    login: trigger,
    isLoggingIn: isMutating,
    error
  };
}

// ============== UTILITIES ==============

/**
 * Prefetch data (useful for hover/anticipatory loading)
 * Example: prefetch('/api/matches?leagueId=1')
 */
export async function prefetch(url: string) {
  try {
    return await fetcher(url);
  } catch (error) {
    console.error('Prefetch error:', error);
    return null;
  }
}

/**
 * Clear all SWR cache
 */
export function clearCache() {
  // Implementation depends on your SWR setup
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
