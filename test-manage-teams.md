# Test Manage Teams Feature

## Feature Implementation Complete! ✅

The team management feature has been successfully implemented with the following components:

### Backend Changes ✅
1. **Team Controller** (`backend/src/controllers/teamController.ts`)
   - `getAllTeams()` - Get all teams with optional league filtering
   - `getTeamsNotInLeague()` - Get teams not in a specific league
   - `createTeam()` - Create new team with validation
   - `addTeamsToLeague()` - Bulk add existing teams to league
   - `createAndAddTeamsToLeague()` - Create and add teams in one operation

2. **Team Routes** (`backend/src/routes/teamRoutes.ts`)
   - `GET /teams` - Get all teams
   - `GET /teams/not-in-league/:leagueId` - Get available teams
   - `POST /teams` - Create new team
   - `POST /teams/add-to-league` - Add existing teams to league
   - `POST /teams/create-and-add-to-league` - Create and add teams

3. **Football Data API** (`backend/src/controllers/footballDataApiController.ts`)
   - `fetchAndImportTeams()` - Fetch teams from API and optionally import
   - Route: `POST /football-data/competitions/:competitionCode/fetch-import-teams`

### Frontend Changes ✅
1. **API Client** (`frontend/lib/api.ts`)
   - Added `teamsApi` with all CRUD operations
   - Added `fetchAndImportTeams()` to `footballDataApi`

2. **ManageTeamsDialog Component** (`frontend/components/admin/ManageTeamsDialog.tsx`)
   - Tab 1: Add existing teams (with league filtering and search)
   - Tab 2: Create new team (all fields optional except name and code)
   - Tab 3: Fetch from football-data.org API

3. **League Admin Page** (`frontend/app/admin/leagues/page.tsx`)
   - Added "Manage Teams" button to each league card
   - Integrated ManageTeamsDialog component

## How to Test

### Prerequisites
1. Backend server running on http://localhost:7070 ✅
2. Frontend server running on http://localhost:8080 ✅
3. User logged in with ADMIN or SUPER_ADMIN role
4. Football Data API token configured (for API import feature)

### Test Case 1: Add Existing Teams
1. Navigate to http://localhost:8080/admin/leagues
2. Click "Manage Teams" on any league
3. In the "Add Existing Teams" tab:
   - Use the search box to filter teams
   - Use the league filter dropdown to see teams from specific leagues
   - Select multiple teams using checkboxes
   - Click "Add Selected Team(s)"
4. Verify teams are added and league team count increases

### Test Case 2: Create New Team
1. Click "Manage Teams" on any league
2. Go to "Create New Team" tab
3. Fill in the form:
   - Required: Team Name and Code
   - Optional: All other fields (shortName, apiName, logoUrl, etc.)
4. Click "Create Team and Add to [League Name]"
5. Verify team is created and immediately added to the league

### Test Case 3: Fetch from API (Champions League Example)
1. Click "Manage Teams" on Champions League (or any league)
2. Go to "Fetch from API" tab
3. Enter competition code: `CL` (for Champions League)
4. Optional: Enter season (e.g., `2024`)
5. Click "Fetch Teams from API"
6. Select teams from the list (e.g., Real Madrid, Barcelona, Bayern Munich)
7. Click "Import Selected Team(s)"
8. Verify:
   - New teams are created in database
   - Existing teams are linked to the league
   - Team logos and metadata are imported from API

### Test Case 4: Multi-League Teams (Champions League)
1. Create/Select Champions League
2. Use "Fetch from API" with code `CL`
3. Import teams like:
   - Manchester City (from Premier League)
   - Real Madrid (from La Liga)
   - Bayern Munich (from Bundesliga)
   - Inter Milan (from Serie A)
4. Verify these teams now appear in multiple leagues
5. Check that matches can be created with these teams in Champions League

## API Endpoints Reference

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams?leagueId=1` - Get teams in specific league
- `GET /api/teams/not-in-league/:leagueId` - Get teams not in league
- `POST /api/teams` - Create new team
- `POST /api/teams/add-to-league` - Add existing teams to league

### Football Data API
- `POST /api/football-data/competitions/:code/fetch-import-teams`
  - Body (fetch only): `{ "season": "2024" }`
  - Body (import): `{ "season": "2024", "leagueId": 1, "importSelected": [64, 81, 86] }`

## Competition Codes for Football Data API
- `CL` - UEFA Champions League
- `PL` - Premier League
- `PD` - La Liga
- `BL1` - Bundesliga
- `SA` - Serie A
- `FL1` - Ligue 1
- `DED` - Eredivisie
- `PPL` - Primeira Liga
- `ELC` - Championship

## Features Implemented ✅
- ✅ Add existing teams from any league to new league
- ✅ Create totally new teams with all optional fields
- ✅ Unique code validation
- ✅ League-filtered team selection
- ✅ Multiple team selection (checkboxes)
- ✅ Search functionality for teams
- ✅ External API integration (football-data.org)
- ✅ Automatic team metadata import (logo, stadium, etc.)
- ✅ Multi-league team support (e.g., Champions League)
- ✅ Immediate league association

## Next Steps (Optional Enhancements)
- Add team removal from league
- Add team editing functionality
- Add bulk team operations (select all, deselect all)
- Add team preview/details before adding
- Add validation warnings (e.g., duplicate teams)
- Add import history/audit log
