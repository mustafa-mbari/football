import axios from 'axios';

// Determine API URL based on the current host
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing via network IP, use that IP for API calls
    if (hostname === '192.168.178.24') {
      return 'http://192.168.178.24:7070/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7070/api';
};

const API_BASE_URL = getApiBaseUrl();

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
  getById: (id: number) => api.get(`/leagues/${id}`),
  create: (data: {
    name: string;
    code: string;
    country?: string;
    logoUrl?: string;
    season: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    priority?: number;
  }) => api.post('/leagues', data),
  update: (id: number, data: {
    name?: string;
    code?: string;
    country?: string;
    logoUrl?: string;
    season?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    priority?: number;
  }) => api.put(`/leagues/${id}`, data),
  delete: (id: number) => api.delete(`/leagues/${id}`),
  toggleActive: (id: number) => api.patch(`/leagues/${id}/toggle-active`)
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
    groupId?: number;
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

// Settings API
export const settingsApi = {
  getSetting: (key: string) => api.get(`/settings/${key}`),
  getAllSettings: () => api.get('/settings'),
  updateSetting: (key: string, data: { value: string; description?: string }) =>
    api.put(`/settings/${key}`, data)
};

// GameWeeks API
export const gameWeeksApi = {
  getAll: () => api.get('/gameweeks'),
  getByLeague: (leagueId: number) => api.get(`/gameweeks/league/${leagueId}`),
  getCurrentByStatus: (leagueId: number) => api.get(`/gameweeks/league/${leagueId}/current-by-status`),
  getDetails: (id: number) => api.get(`/gameweeks/${id}`)
};

// Groups API
export const groupsApi = {
  create: (data: {
    name: string;
    description?: string;
    leagueId?: number;
    allowedTeamIds?: number[];
    joinCode?: string;
  }) => api.post('/groups', data),

  getAll: () => api.get('/groups'),
  getPublic: () => api.get('/groups/public'),
  getUserGroups: () => api.get('/groups/user'),
  getById: (id: number) => api.get(`/groups/${id}`),
  getByCode: (joinCode: string) => api.get(`/groups/code/${joinCode}`),
  getLeaderboard: (id: number, leagueId?: number) =>
    api.get(`/groups/${id}/leaderboard`, { params: { leagueId } }),

  join: (id: number, joinCode?: string) =>
    api.post(`/groups/${id}/join`, { joinCode }),
  leave: (id: number) => api.delete(`/groups/${id}/leave`),
  update: (id: number, data: {
    name?: string;
    description?: string;
    maxMembers?: number;
  }) => api.put(`/groups/${id}`, data),
  regenerateCode: (id: number) => api.post(`/groups/${id}/regenerate-code`),
  requestChange: (id: number, data: {
    changeType: string;
    requestedValue: any;
    reason?: string;
  }) => api.post(`/groups/${id}/request-change`, data),
  getChangeRequests: (id: number) => api.get(`/groups/${id}/change-requests`),
  delete: (id: number) => api.delete(`/groups/${id}`)
};

// Change Requests API
export const changeRequestsApi = {
  getAll: (status?: string) => api.get('/change-requests', { params: { status } }),
  approve: (id: number, reviewNote?: string) =>
    api.post(`/change-requests/${id}/approve`, { reviewNote }),
  reject: (id: number, reviewNote?: string) =>
    api.post(`/change-requests/${id}/reject`, { reviewNote })
};
