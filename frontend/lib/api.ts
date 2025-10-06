import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7070/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

// Leagues API
export const leaguesApi = {
  getAll: () => api.get('/leagues'),
  getById: (id: number) => api.get(`/leagues/${id}`)
};

// Matches API
export const matchesApi = {
  getAll: (leagueId?: number, status?: string) =>
    api.get('/matches', { params: { leagueId, status } }),
  getById: (id: number) => api.get(`/matches/${id}`),
  getUpcoming: (leagueId?: number) =>
    api.get('/matches/upcoming', { params: { leagueId } })
};

// Predictions API
export const predictionsApi = {
  create: (data: {
    matchId: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }) => api.post('/predictions', data),
  getUserPredictions: () => api.get('/predictions/user'),
  getMatchPredictions: (matchId: number) =>
    api.get(`/predictions/match/${matchId}`),
  updateMatchScore: (
    matchId: number,
    data: { homeScore: number; awayScore: number; status?: string }
  ) => api.put(`/predictions/match/${matchId}/score`, data)
};

// Leaderboard API
export const leaderboardApi = {
  get: (leagueId?: number) =>
    api.get('/leaderboard', { params: { leagueId } }),
  getUserStats: () => api.get('/leaderboard/stats')
};

// Weeks API
export const weeksApi = {
  getAvailableWeeks: (leagueId: number) =>
    api.get('/weeks/available', { params: { leagueId } }),
  getCurrentWeek: () => api.get('/weeks/current'),
  getMatchesByWeek: (leagueId: number, week: number) =>
    api.get('/weeks/matches', { params: { leagueId, week } })
};

// Standings API
export const standingsApi = {
  getAll: () => api.get('/standings'),
  getByLeague: (leagueId: number) => api.get(`/standings/league/${leagueId}`)
};
