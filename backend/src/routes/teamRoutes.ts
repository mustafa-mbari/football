import { Router } from 'express';
import { getTeamsByLeague } from '../controllers/leagueController';
import {
  getAllTeams,
  getTeamsNotInLeague,
  createTeam,
  addTeamsToLeague,
  createAndAddTeamsToLeague
} from '../controllers/teamController';

const router = Router();

// Get all teams (optionally filtered by leagueId)
router.get('/', getAllTeams);

// Get teams not in a specific league
router.get('/not-in-league/:leagueId', getTeamsNotInLeague);

// Get teams by league (legacy route)
router.get('/league/:leagueId', getTeamsByLeague);

// Create new team
router.post('/', createTeam);

// Add existing teams to league (bulk)
router.post('/add-to-league', addTeamsToLeague);

// Create teams and add to league (bulk)
router.post('/create-and-add-to-league', createAndAddTeamsToLeague);

export default router;
