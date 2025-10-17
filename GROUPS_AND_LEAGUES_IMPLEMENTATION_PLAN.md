# Groups and League-Based Points System - Implementation Plan

## Overview
Implement a comprehensive group system with league-specific points tracking, automatic public group management, and private groups with custom team selection.

---

## 1. Database Schema Changes

### 1.1 Update Group Model
Add league relationship and team filtering for groups:

```prisma
model Group {
  id              Int           @id @default(autoincrement())
  name            String
  description     String?       @db.Text
  code            String        @unique @default(cuid())
  isPrivate       Boolean       @default(false)
  isPublic        Boolean       @default(false)  // NEW: Mark official public groups
  joinCode        String?       @unique
  maxMembers      Int           @default(50)
  owner           User          @relation(fields: [ownerId], references: [id])
  ownerId         Int
  logoUrl         String?

  // NEW: League and team filtering
  leagueId        Int?          // NULL for cross-league private groups, SET for public groups
  league          League?       @relation(fields: [leagueId], references: [id])
  allowedTeamIds  Int[]         // Array of team IDs (empty = all teams, populated = specific teams)

  // Relations
  members         GroupMember[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([code])
  @@index([joinCode])
  @@index([leagueId])
  @@index([isPublic])
}
```

### 1.2 Update GroupMember Model
Add league-specific points tracking:

```prisma
model GroupMember {
  id              Int       @id @default(autoincrement())
  group           Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  groupId         Int
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          Int
  role            GroupRole @default(MEMBER)

  // NEW: League-specific points (JSON to track points per league)
  pointsByLeague  Json      @default("{}") // {"1": 30, "2": 20, "3": 15, "4": 10}
  totalPoints     Int       @default(0)    // Sum of all league points or filtered points

  joinedAt        DateTime  @default(now())
  lastUpdated     DateTime  @updatedAt

  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
}
```

### 1.3 Remove GroupLeaderboard Model
Replace with dynamic calculation from GroupMember pointsByLeague.

### 1.4 Add League Relation to Groups
Update League model to include groups:

```prisma
model League {
  // ... existing fields
  groups      Group[]  // NEW: Public groups for this league
}
```

---

## 2. Backend Implementation

### 2.1 Database Migration
**File**: `backend/prisma/migrations/XXXXXXX_add_groups_leagues_system/migration.sql`

- Add new columns to Group table
- Add pointsByLeague to GroupMember table
- Drop GroupLeaderboard table
- Create 4 public groups (one per league)
- Add indexes

### 2.2 Create Public Groups Seeder
**File**: `backend/scripts/create-public-groups.ts`

Create one public group per league:
- Premier League Public Group
- La Liga Public Group
- Bundesliga Public Group
- Serie A Public Group (assuming 4th league)

### 2.3 Group Controller
**File**: `backend/src/controllers/groupController.ts`

**Endpoints**:
- `POST /api/groups` - Create private group (with league + teams selection)
- `GET /api/groups` - Get all groups (public + user's private groups)
- `GET /api/groups/:id` - Get group details
- `GET /api/groups/public` - Get all public groups
- `GET /api/groups/user` - Get user's groups
- `POST /api/groups/:id/join` - Join group (with join code for private)
- `DELETE /api/groups/:id/leave` - Leave group
- `GET /api/groups/:id/leaderboard` - Get group leaderboard (with optional leagueId filter)
- `PUT /api/groups/:id` - Update group (owner only)
- `DELETE /api/groups/:id` - Delete group (owner only)

**Key Logic**:
```typescript
// Auto-join user to public group on first prediction
async autoJoinPublicGroup(userId: number, leagueId: number) {
  const publicGroup = await prisma.group.findFirst({
    where: { isPublic: true, leagueId }
  });

  if (publicGroup) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: publicGroup.id, userId } },
      create: { groupId: publicGroup.id, userId, role: 'MEMBER' },
      update: {}
    });
  }
}

// Calculate group leaderboard with league filter
async getGroupLeaderboard(groupId: number, leagueId?: number) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true, group: true }
  });

  return members.map(member => {
    const pointsByLeague = member.pointsByLeague as Record<string, number>;
    const points = leagueId
      ? (pointsByLeague[leagueId.toString()] || 0)
      : Object.values(pointsByLeague).reduce((sum, p) => sum + p, 0);

    return { ...member, points };
  }).sort((a, b) => b.points - a.points);
}
```

### 2.4 Update Prediction Controller
**File**: `backend/src/controllers/predictionController.ts`

**Modify**: `createPrediction` method

Add group parameter and auto-join logic:

```typescript
export const createPrediction = async (req: Request, res: Response) => {
  const { matchId, predictedHomeScore, predictedAwayScore, groupId } = req.body;
  const userId = (req as any).userId;

  // Get match with league
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { league: true, homeTeam: true, awayTeam: true }
  });

  // If groupId provided, validate team is allowed in group
  if (groupId) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (group.allowedTeamIds.length > 0) {
      const isAllowed = group.allowedTeamIds.includes(match.homeTeamId) ||
                        group.allowedTeamIds.includes(match.awayTeamId);
      if (!isAllowed) {
        return res.status(400).json({ error: 'Teams not allowed in this group' });
      }
    }
  }

  // Auto-join public group for this league
  await autoJoinPublicGroup(userId, match.leagueId);

  // Create prediction...
};
```

### 2.5 Update Points Calculation Service
**File**: `backend/src/services/pointsUpdateService.ts` (NEW)

Service to update GroupMember points when predictions are scored:

```typescript
export class PointsUpdateService {
  async updateGroupPoints(userId: number, leagueId: number, pointsEarned: number) {
    // Get all groups user is member of
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: { group: true }
    });

    for (const membership of memberships) {
      const group = membership.group;

      // Update points in relevant groups
      // Public group: only if matches league
      if (group.isPublic && group.leagueId === leagueId) {
        await this.addPointsToMember(membership.id, leagueId, pointsEarned);
      }
      // Private group: always update (cross-league)
      else if (!group.isPublic) {
        // Check if league filter applies to private group
        if (!group.leagueId || group.leagueId === leagueId) {
          await this.addPointsToMember(membership.id, leagueId, pointsEarned);
        }
      }
    }
  }

  private async addPointsToMember(membershipId: number, leagueId: number, points: number) {
    const member = await prisma.groupMember.findUnique({ where: { id: membershipId } });
    const pointsByLeague = member.pointsByLeague as Record<string, number>;
    const leagueKey = leagueId.toString();

    pointsByLeague[leagueKey] = (pointsByLeague[leagueKey] || 0) + points;

    // Recalculate from ALL historical predictions for this user in this group
    const totalPoints = await this.calculateTotalGroupPoints(member.userId, member.groupId);

    await prisma.groupMember.update({
      where: { id: membershipId },
      data: { pointsByLeague, totalPoints }
    });
  }

  private async calculateTotalGroupPoints(userId: number, groupId: number): Promise<number> {
    const group = await prisma.group.findUnique({ where: { id: groupId } });

    // Get all finished predictions for user
    const predictions = await prisma.prediction.findMany({
      where: {
        userId,
        isProcessed: true,
        match: {
          leagueId: group.leagueId || undefined, // Filter by league if public group
          OR: group.allowedTeamIds.length > 0 ? [
            { homeTeamId: { in: group.allowedTeamIds } },
            { awayTeamId: { in: group.allowedTeamIds } }
          ] : undefined
        }
      },
      include: { match: true }
    });

    // Group by league and sum
    const pointsByLeague: Record<string, number> = {};
    for (const pred of predictions) {
      const leagueKey = pred.match.leagueId.toString();
      pointsByLeague[leagueKey] = (pointsByLeague[leagueKey] || 0) + pred.totalPoints;
    }

    return pointsByLeague;
  }
}
```

### 2.6 Update Prediction Processing
**File**: `backend/src/controllers/predictionController.ts`

Modify the prediction scoring endpoint to update group points:

```typescript
// After calculating points for a prediction
const pointsService = new PointsUpdateService();
await pointsService.updateGroupPoints(prediction.userId, match.leagueId, prediction.totalPoints);
```

### 2.7 Group Routes
**File**: `backend/src/routes/groupRoutes.ts` (NEW)

```typescript
import { Router } from 'express';
import * as groupController from '../controllers/groupController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware); // All group routes require authentication

router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/public', groupController.getPublicGroups);
router.get('/user', groupController.getUserGroups);
router.get('/:id', groupController.getGroupDetails);
router.get('/:id/leaderboard', groupController.getGroupLeaderboard);
router.post('/:id/join', groupController.joinGroup);
router.delete('/:id/leave', groupController.leaveGroup);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

export default router;
```

Register in `backend/src/index.ts`:
```typescript
import groupRoutes from './routes/groupRoutes';
app.use('/api/groups', groupRoutes);
```

---

## 3. Frontend Implementation

### 3.1 Update API Library
**File**: `frontend/lib/api.ts`

Add groups API:

```typescript
export const groupsApi = {
  create: (data: {
    name: string;
    description?: string;
    isPrivate: boolean;
    joinCode?: string;
    leagueId?: number;
    allowedTeamIds?: number[];
  }) => api.post('/groups', data),

  getAll: () => api.get('/groups'),
  getPublic: () => api.get('/groups/public'),
  getUserGroups: () => api.get('/groups/user'),
  getById: (id: number) => api.get(`/groups/${id}`),
  getLeaderboard: (id: number, leagueId?: number) =>
    api.get(`/groups/${id}/leaderboard`, { params: { leagueId } }),

  join: (id: number, joinCode?: string) =>
    api.post(`/groups/${id}/join`, { joinCode }),
  leave: (id: number) => api.delete(`/groups/${id}/leave`),
  update: (id: number, data: any) => api.put(`/groups/${id}`, data),
  delete: (id: number) => api.delete(`/groups/${id}`)
};
```

### 3.2 Dashboard - Update Leaderboard Cards
**File**: `frontend/app/dashboard/page.tsx`

Replace single leaderboard with TWO cards:

1. **Public Groups Leaderboard Card**:
   - League selector (dropdown or tabs for 4 leagues)
   - Shows leaderboard for selected league's public group
   - Auto-updates when league changes

2. **Private Groups Leaderboard Card**:
   - Group selector (dropdown of user's private groups)
   - Shows leaderboard for selected private group
   - If private group has league filter, show league-specific points
   - If cross-league, show total points with optional league filter

```typescript
// Public Groups Card
const [selectedPublicLeague, setSelectedPublicLeague] = useState<number>(1);
const [publicLeaderboard, setPublicLeaderboard] = useState([]);

useEffect(() => {
  // Fetch public group for selected league
  const fetchPublicLeaderboard = async () => {
    const publicGroups = await groupsApi.getPublic();
    const group = publicGroups.data.find(g => g.leagueId === selectedPublicLeague);
    if (group) {
      const leaderboard = await groupsApi.getLeaderboard(group.id, selectedPublicLeague);
      setPublicLeaderboard(leaderboard.data);
    }
  };
  fetchPublicLeaderboard();
}, [selectedPublicLeague]);

// Private Groups Card
const [selectedPrivateGroup, setSelectedPrivateGroup] = useState<number | null>(null);
const [privateLeaderboard, setPrivateLeaderboard] = useState([]);
const [privateGroups, setPrivateGroups] = useState([]);

useEffect(() => {
  // Fetch user's private groups
  const fetchPrivateGroups = async () => {
    const groups = await groupsApi.getUserGroups();
    const privateOnly = groups.data.filter(g => g.isPrivate);
    setPrivateGroups(privateOnly);
    if (privateOnly.length > 0) {
      setSelectedPrivateGroup(privateOnly[0].id);
    }
  };
  fetchPrivateGroups();
}, []);

useEffect(() => {
  if (selectedPrivateGroup) {
    const fetchPrivateLeaderboard = async () => {
      const leaderboard = await groupsApi.getLeaderboard(selectedPrivateGroup);
      setPrivateLeaderboard(leaderboard.data);
    };
    fetchPrivateLeaderboard();
  }
}, [selectedPrivateGroup]);
```

### 3.3 Create Group Management Page
**File**: `frontend/app/groups/page.tsx` (NEW)

Page to view all groups, create new groups, join groups with code:

- List of public groups (all 4 leagues)
- List of user's private groups
- Button to create new private group
- Input to join private group with code

### 3.4 Create Group Creation Dialog
**File**: `frontend/components/CreateGroupDialog.tsx` (NEW)

Dialog/Modal for creating a private group:

1. Group name input
2. Description textarea
3. League selector (required for private groups)
4. Team selector (multi-select checkboxes for teams in selected league)
5. Privacy toggle (generate join code if private)
6. Submit button

### 3.5 Update Prediction Page
**File**: `frontend/app/predict/page.tsx`

Add group selector at the top:

```typescript
const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
const [availableMatches, setAvailableMatches] = useState([]);

useEffect(() => {
  const fetchMatches = async () => {
    if (selectedGroup) {
      const group = await groupsApi.getById(selectedGroup);

      // Fetch matches filtered by group's league and teams
      const matches = await matchesApi.getAll(
        group.leagueId,
        'SCHEDULED'
      );

      // Filter by allowed teams if specified
      const filtered = group.allowedTeamIds.length > 0
        ? matches.data.filter(m =>
            group.allowedTeamIds.includes(m.homeTeamId) ||
            group.allowedTeamIds.includes(m.awayTeamId)
          )
        : matches.data;

      setAvailableMatches(filtered);
    } else {
      // No group selected = show all matches
      const matches = await matchesApi.getAll(undefined, 'SCHEDULED');
      setAvailableMatches(matches.data);
    }
  };
  fetchMatches();
}, [selectedGroup]);
```

Update prediction submission to include groupId:
```typescript
await predictionsApi.create({
  matchId,
  predictedHomeScore,
  predictedAwayScore,
  groupId: selectedGroup // NEW
});
```

### 3.6 Group Detail Page
**File**: `frontend/app/groups/[id]/page.tsx` (NEW)

- Group info (name, description, league, teams)
- Leaderboard with league filter (if cross-league private group)
- Members list
- Join code display (for admins)
- Leave/Delete buttons

### 3.7 Update Leaderboard Component
**File**: `frontend/components/GroupLeaderboard.tsx` (NEW)

Reusable leaderboard component:
- Accepts groupId and optional leagueId filter
- Shows rank, username, points
- Highlights current user
- Shows medals for top 3

---

## 4. Data Migration & Seeding

### 4.1 Migration Script
**File**: `backend/scripts/migrate-groups-system.ts`

1. Run Prisma migration
2. Create 4 public groups (one per league)
3. Auto-join existing users to public groups based on their predictions
4. Recalculate points for all group members from historical predictions

### 4.2 Points Recalculation Script
**File**: `backend/scripts/recalculate-group-points.ts`

For each user:
- Get all finished predictions
- Group by league
- Calculate points per league
- Update all GroupMember records with pointsByLeague

---

## 5. Testing Plan

### 5.1 Backend Tests
- Create public groups
- Create private group with team selection
- Auto-join user on first prediction
- Calculate league-specific points
- Calculate cross-league points for private groups
- Group leaderboard with league filter

### 5.2 Frontend Tests
- Display two leaderboard cards in dashboard
- Switch leagues in public leaderboard
- Switch groups in private leaderboard
- Create private group with team selection
- Join private group with code
- Filter matches by group in prediction page

---

## 6. Implementation Order

1. **Phase 1: Database & Backend Core** (Priority: HIGH)
   - Update Prisma schema
   - Run migration
   - Create public groups seeder
   - Implement groupController with all endpoints
   - Update predictionController for auto-join

2. **Phase 2: Points Calculation** (Priority: HIGH)
   - Implement PointsUpdateService
   - Integrate with prediction scoring
   - Create points recalculation script

3. **Phase 3: Frontend API & Dashboard** (Priority: HIGH)
   - Update api.ts with groups endpoints
   - Update dashboard with two leaderboard cards
   - Test public/private leaderboards

4. **Phase 4: Group Management** (Priority: MEDIUM)
   - Create groups page
   - Create group creation dialog
   - Implement join with code

5. **Phase 5: Prediction Integration** (Priority: MEDIUM)
   - Add group selector to prediction page
   - Filter matches by group teams
   - Test prediction flow with groups

6. **Phase 6: Polish & Testing** (Priority: LOW)
   - Group detail page
   - Responsive design
   - Error handling
   - Loading states

---

## 7. Key Technical Decisions

### 7.1 Points Storage
- Store `pointsByLeague` as JSON in GroupMember model
- Format: `{"1": 30, "2": 20, "3": 15, "4": 10}`
- Benefits: Flexible, supports any number of leagues, easy to query

### 7.2 Public Groups
- Exactly 4 public groups (one per league)
- Created via seeder script
- Marked with `isPublic: true` and `leagueId: X`
- Users auto-join on first prediction in that league

### 7.3 Private Groups
- Can be cross-league (`leagueId: null`) or league-specific
- Must select league and teams on creation
- Points calculated from ALL predictions since user's first prediction (not from join date)

### 7.4 Group Leaderboard
- Dynamic calculation from GroupMember.pointsByLeague
- Supports league filter for cross-league private groups
- No separate GroupLeaderboard table (removed for simplicity)

### 7.5 Prediction Flow
- User selects group (optional) on prediction page
- If group selected, only show matches with allowed teams
- Auto-join public group of match's league
- GroupId stored with prediction for future reference

---

## 8. Database Schema Summary

```
Group
├── id
├── name
├── isPrivate
├── isPublic (NEW)
├── leagueId (NEW - nullable)
├── allowedTeamIds (NEW - Int[])
└── members (GroupMember[])

GroupMember
├── id
├── userId
├── groupId
├── pointsByLeague (NEW - Json) {"1": 30, "2": 20}
└── totalPoints (NEW - Int)

League
└── groups (NEW - Group[])
```

---

## 9. API Endpoints Summary

```
Groups:
POST   /api/groups                    - Create private group
GET    /api/groups                    - Get all groups
GET    /api/groups/public             - Get public groups
GET    /api/groups/user               - Get user's groups
GET    /api/groups/:id                - Get group details
GET    /api/groups/:id/leaderboard    - Get group leaderboard (with ?leagueId filter)
POST   /api/groups/:id/join           - Join group
DELETE /api/groups/:id/leave          - Leave group
PUT    /api/groups/:id                - Update group
DELETE /api/groups/:id                - Delete group

Predictions (Updated):
POST   /api/predictions               - Create prediction (+ groupId param)
```

---

## 10. UI Components Summary

```
Dashboard:
├── PublicGroupsLeaderboardCard (with league selector)
└── PrivateGroupsLeaderboardCard (with group selector)

Groups Page:
├── PublicGroupsList
├── PrivateGroupsList
├── CreateGroupButton → CreateGroupDialog
└── JoinGroupWithCodeInput

Prediction Page:
├── GroupSelector (dropdown)
└── MatchesList (filtered by group teams)

Group Detail Page:
├── GroupInfo
├── GroupLeaderboard
├── MembersList
└── ActionButtons (Leave/Delete)
```

---

## Estimated Implementation Time

- **Phase 1-2 (Backend)**: 4-6 hours
- **Phase 3 (Dashboard)**: 2-3 hours
- **Phase 4-5 (Group Management & Predictions)**: 3-4 hours
- **Phase 6 (Polish)**: 2-3 hours

**Total**: 11-16 hours

---

## Notes & Considerations

1. **Historical Points**: When a user joins a private group, their points should be calculated from ALL their historical predictions (not just from join date). This is handled in `calculateTotalGroupPoints()`.

2. **Public Group Auto-Join**: Users are automatically added to a league's public group when they make their first prediction in that league.

3. **Team Filtering**: Private groups can specify which teams to track. Only matches involving those teams will be available for prediction in that group.

4. **Cross-League Private Groups**: Private groups can track all leagues. In this case, the leaderboard shows total points from all leagues, with an optional league filter.

5. **Group Ownership**: The user who creates a group is the owner and can delete/modify it. Consider adding admin roles for larger groups.

6. **Join Codes**: Private groups require a join code. Generate a readable code (e.g., "MYGROUP2025") on group creation.

7. **Performance**: For large groups, consider caching leaderboards and updating them asynchronously after predictions are scored.

8. **Future Enhancements**:
   - Group chat/comments
   - Group achievements
   - Weekly/monthly leaderboard snapshots
   - Group invitations via email
   - Group badges/emblems
