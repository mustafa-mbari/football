import { Request, Response } from 'express';
import prisma from '../config/database';
import axios from 'axios';

const FOOTBALL_DATA_API_BASE_URL = 'https://api.football-data.org/v4';

// Helper function to get API token from settings
const getApiToken = async (): Promise<string | null> => {
  const setting = await prisma.appSettings.findUnique({
    where: { key: 'FOOTBALL_DATA_API_TOKEN' }
  });
  return setting ? setting.value : null;
};

// Get available competitions/leagues
export const getCompetitions = async (req: Request, res: Response) => {
  try {
    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    const response = await axios.get(`${FOOTBALL_DATA_API_BASE_URL}/competitions`, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Get teams for a specific competition
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { competitionCode } = req.params;
    const { season } = req.query;

    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    let url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/teams`;
    if (season) {
      url += `?season=${season}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Get matches with various filters
export const getMatches = async (req: Request, res: Response) => {
  try {
    const { competitionCode, teamId } = req.params;
    const { matchday, dateFrom, dateTo, status, season } = req.query;

    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    let url: string;
    const params: string[] = [];

    // Build URL based on filters
    if (teamId) {
      url = `${FOOTBALL_DATA_API_BASE_URL}/teams/${teamId}/matches`;
    } else if (competitionCode) {
      url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/matches`;
    } else {
      url = `${FOOTBALL_DATA_API_BASE_URL}/matches`;
    }

    // Add query parameters
    if (matchday) params.push(`matchday=${matchday}`);
    if (dateFrom) params.push(`dateFrom=${dateFrom}`);
    if (dateTo) params.push(`dateTo=${dateTo}`);
    if (status) params.push(`status=${status}`);
    if (season) params.push(`season=${season}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};

// Get standings for a competition
export const getStandings = async (req: Request, res: Response) => {
  try {
    const { competitionCode } = req.params;
    const { season, matchday } = req.query;

    const apiToken = await getApiToken();
    if (!apiToken) {
      return res.status(500).json({
        success: false,
        message: 'Football Data API token not configured'
      });
    }

    let url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/${competitionCode}/standings`;
    const params: string[] = [];

    if (season) params.push(`season=${season}`);
    if (matchday) params.push(`matchday=${matchday}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiToken
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data
    });
  }
};
