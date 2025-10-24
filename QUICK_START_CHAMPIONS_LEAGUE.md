# Quick Start: Creating Champions League with Multi-League Teams

## What Changed?

Your database now supports teams playing in multiple leagues simultaneously. This means Real Madrid can be in both La Liga AND Champions League without data duplication.

## ✅ Migration Complete

- **78 teams** successfully migrated to new structure
- **All existing data preserved** (matches, standings, predictions)
- **All tests passing** ✅

## How to Create Champions League

### Step 1: Run the Helper Script

The easiest way to add Champions League:

```bash
cd backend
npx ts-node scripts/add-teams-to-league.ts
```

This script will:
1. Create Champions League (or use existing)
2. Find teams from Premier League, La Liga, Bundesliga, Serie A
3. Add them to Champions League
4. Verify the setup

### Step 2: Customize Teams (Optional)

Edit `backend/scripts/add-teams-to-league.ts` to customize which teams to add:

```typescript
const teamNamesToAdd = [
  // Add or remove teams as needed
  'Manchester City',
  'Real Madrid',
  'Bayern Munich',
  'Inter Milan',
  // ... more teams
];
```

### Step 3: Verify

```bash
npx ts-node scripts/verify-team-league.ts
```

Or check via API:
```bash
# Get Champions League teams
curl http://localhost:5000/api/teams?leagueId=5

# Get all leagues for Real Madrid
curl http://localhost:5000/api/teams/29
```

## Example: Add Teams Manually

If you prefer manual control:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Create Champions League
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

// 2. Find Real Madrid (currently in La Liga)
const realMadrid = await prisma.team.findFirst({
  where: { name: 'Real Madrid' }
});

// 3. Add Real Madrid to Champions League
await prisma.teamLeague.create({
  data: {
    teamId: realMadrid.id,
    leagueId: championsLeague.id,
    isActive: true
  }
});

// Now Real Madrid is in BOTH La Liga and Champions League!
```

## Key Points

### Teams Can Be in Multiple Leagues
```typescript
const realMadrid = await prisma.team.findUnique({
  where: { name: 'Real Madrid' },
  include: {
    leagues: {
      include: {
        league: true
      }
    }
  }
});

// realMadrid.leagues will contain:
// 1. La Liga (domestic)
// 2. Champions League (European)
```

### Standings Are League-Specific
Each league has its own standings table. Real Madrid's La Liga stats don't mix with Champions League stats:

```typescript
// La Liga standings for Real Madrid
const laLigaStanding = await prisma.table.findUnique({
  where: {
    leagueId_teamId: {
      leagueId: 2,  // La Liga
      teamId: 29    // Real Madrid
    }
  }
});

// Champions League standings for Real Madrid
const clStanding = await prisma.table.findUnique({
  where: {
    leagueId_teamId: {
      leagueId: 5,  // Champions League
      teamId: 29    // Real Madrid
    }
  }
});
```

### Querying Teams by League
```typescript
// Get all Champions League teams
const clTeams = await prisma.team.findMany({
  where: {
    leagues: {
      some: {
        leagueId: 5,        // Champions League ID
        isActive: true
      }
    }
  }
});
```

## Files to Review

1. **[MULTI_LEAGUE_TEAMS.md](MULTI_LEAGUE_TEAMS.md)** - Complete documentation
2. **[backend/scripts/add-teams-to-league.ts](backend/scripts/add-teams-to-league.ts)** - Helper script
3. **[backend/scripts/test-multi-league.ts](backend/scripts/test-multi-league.ts)** - Test suite
4. **[backend/prisma/schema.prisma](backend/prisma/schema.prisma)** - Updated schema

## What's Different in Your Code?

### Before (Old - Won't Work)
```typescript
// ❌ This no longer works
const teams = await prisma.team.findMany({
  where: { leagueId: 1 }
});
```

### After (New - Use This)
```typescript
// ✅ New way
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

## Updated Controllers

These files were updated to work with the new structure:
- ✅ `teamRoutes.ts`
- ✅ `leagueController.ts`
- ✅ `footballDataApiController.ts`
- ✅ `exportController.ts`
- ✅ `groupController.ts`

## Testing

Run the comprehensive test suite:
```bash
cd backend
npx ts-node scripts/test-multi-league.ts
```

Expected output:
```
🎉 All tests passed! Multi-league implementation is working correctly.
```

## Next Steps

1. **Create Champions League**: Run `add-teams-to-league.ts`
2. **Add Matches**: Create Champions League fixtures
3. **Set Up Game Weeks**: Configure Champions League game weeks
4. **Test Predictions**: Ensure predictions work for multi-league teams

## Need Help?

- See [MULTI_LEAGUE_TEAMS.md](MULTI_LEAGUE_TEAMS.md) for detailed examples
- Check test results: `npx ts-node scripts/test-multi-league.ts`
- Verify data: `npx ts-node scripts/verify-team-league.ts`

---

**Status**: ✅ Ready to create Champions League!
