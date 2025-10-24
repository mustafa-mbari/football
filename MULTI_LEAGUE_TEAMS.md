# Multi-League Teams Implementation

## Overview

The database has been restructured to support teams participating in multiple leagues simultaneously. This is essential for competitions like the UEFA Champions League where teams from different domestic leagues compete together.

## Database Changes

### Previous Structure (One Team → One League)
```
Team {
  id: 1
  name: "Real Madrid"
  leagueId: 2  // ← Could only belong to La Liga
}
```

### New Structure (One Team → Many Leagues)
```
Team {
  id: 1
  name: "Real Madrid"
  // No direct leagueId anymore
}

TeamLeague {
  teamId: 1
  leagueId: 2     // La Liga
  isActive: true
}

TeamLeague {
  teamId: 1
  leagueId: 5     // Champions League
  isActive: true
}
```

## Schema

### Team Model
- **Removed**: `leagueId` field (direct foreign key)
- **Added**: `leagues` relation to `TeamLeague[]`

### TeamLeague Model (Junction Table)
```prisma
model TeamLeague {
  id        Int      @id @default(autoincrement())
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId    Int
  league    League   @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  leagueId  Int
  isActive  Boolean  @default(true)  // Can deactivate without deletion

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([teamId, leagueId])
  @@index([teamId])
  @@index([leagueId])
  @@index([isActive])
}
```

## Migration Process

### 1. Data Migration (Already Completed)
All existing team-league relationships were migrated to the `TeamLeague` table:
```bash
npx ts-node scripts/migrate-teams-to-junction.ts
```

**Result**: 78 teams successfully migrated ✅

### 2. Verify Migration
```bash
npx ts-node scripts/verify-team-league.ts
```

## Usage Examples

### Get Teams by League
```typescript
// Before (OLD - no longer works)
const teams = await prisma.team.findMany({
  where: { leagueId: 1 }
});

// After (NEW)
const teams = await prisma.team.findMany({
  where: {
    leagues: {
      some: {
        leagueId: 1,
        isActive: true
      }
    }
  }
});
```

### Get Leagues for a Team
```typescript
const team = await prisma.team.findUnique({
  where: { id: 1 },
  include: {
    leagues: {
      where: { isActive: true },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    }
  }
});

// Access leagues
team.leagues.forEach(tl => {
  console.log(tl.league.name); // "La Liga", "Champions League"
});
```

### Get All Teams in a League with Their Info
```typescript
const league = await prisma.league.findUnique({
  where: { id: 1 },
  include: {
    teams: {
      where: { isActive: true },
      include: {
        team: true
      }
    }
  }
});

// Access teams
league.teams.forEach(tl => {
  console.log(tl.team.name);
});
```

## Adding Teams to a New League

### Option 1: Using the Helper Script
```bash
# Edit the script to customize teams and league
npx ts-node scripts/add-teams-to-league.ts
```

The script will:
1. Create or find the Champions League
2. Find teams from different domestic leagues
3. Add them to Champions League
4. Verify the associations

### Option 2: Manual Addition (Programmatic)
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create Champions League
const championsLeague = await prisma.league.create({
  data: {
    name: 'UEFA Champions League',
    code: 'CL',
    country: 'Europe',
    season: '2024/2025',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-05-31'),
    isActive: true,
    priority: 10
  }
});

// Find Real Madrid (from La Liga)
const realMadrid = await prisma.team.findFirst({
  where: { name: 'Real Madrid' }
});

// Add Real Madrid to Champions League
await prisma.teamLeague.create({
  data: {
    teamId: realMadrid.id,
    leagueId: championsLeague.id,
    isActive: true
  }
});
```

### Option 3: Bulk Addition
```typescript
// Get team IDs from different leagues
const teamIds = [29, 5, 41, 67]; // Real Madrid, Arsenal, Bayern, Inter

// Add all to Champions League
await prisma.teamLeague.createMany({
  data: teamIds.map(teamId => ({
    teamId,
    leagueId: championsLeague.id,
    isActive: true
  })),
  skipDuplicates: true // Prevents errors if already added
});
```

## API Endpoints Updated

All endpoints have been updated to use the new structure:

### GET /api/teams
- Query param: `?leagueId=1` (optional)
- Returns teams with all their league associations

### GET /api/teams/league/:leagueId
- Returns all teams for a specific league

### GET /api/leagues/:id
- Returns league with all associated teams

## Common Queries

### Find all teams in multiple leagues
```typescript
const multiLeagueTeams = await prisma.team.findMany({
  where: {
    leagues: {
      some: {
        leagueId: {
          in: [1, 2, 3] // Premier League, La Liga, Bundesliga
        },
        isActive: true
      }
    }
  },
  include: {
    leagues: {
      where: { isActive: true },
      include: {
        league: {
          select: { name: true }
        }
      }
    }
  }
});
```

### Find teams participating in exactly 2 leagues (e.g., domestic + Champions League)
```typescript
const teams = await prisma.$queryRaw`
  SELECT t.*, COUNT(tl."leagueId") as league_count
  FROM "Team" t
  JOIN "TeamLeague" tl ON tl."teamId" = t.id
  WHERE tl."isActive" = true
  GROUP BY t.id
  HAVING COUNT(tl."leagueId") = 2
`;
```

### Deactivate a team from a league (without deletion)
```typescript
await prisma.teamLeague.update({
  where: {
    teamId_leagueId: {
      teamId: 1,
      leagueId: 5
    }
  },
  data: {
    isActive: false
  }
});
```

## Matching Teams from External APIs

The sync logic in `footballDataApiController.ts` has been updated to work with the new structure:

```typescript
// When syncing from football-data.org API
const matchTeamByName = async (apiTeamName: string, leagueId: number) => {
  // Looks for teams in the specific league using TeamLeague junction
  const team = await prisma.team.findFirst({
    where: {
      leagues: {
        some: {
          leagueId,
          isActive: true
        }
      },
      apiName: { equals: apiTeamName, mode: 'insensitive' }
    }
  });

  return team;
};
```

## Important Notes

1. **No Data Loss**: All existing team-league relationships were preserved during migration
2. **Backwards Compatible**: Existing matches, standings, and predictions still work
3. **Flexible**: Teams can now participate in unlimited leagues
4. **Clean Separation**: Domestic league stats remain separate from Champions League stats
5. **Cascading Deletes**: Deleting a team or league automatically removes TeamLeague entries

## Testing

To verify everything works:

```bash
# 1. Check TeamLeague data
npx ts-node scripts/verify-team-league.ts

# 2. Test API endpoints
curl http://localhost:5000/api/teams?leagueId=1
curl http://localhost:5000/api/leagues/1

# 3. Add a team to Champions League
npx ts-node scripts/add-teams-to-league.ts
```

## Future Enhancements

Possible improvements:
- **Team role in league**: Starter vs. promoted vs. relegated
- **Season-specific associations**: Different teams per season
- **League-specific team data**: Team name variations per league
- **Automatic API sync**: Detect and sync Champions League participants
