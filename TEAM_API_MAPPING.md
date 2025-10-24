# Team API Name Mapping Guide

This document explains how to add API names for teams to ensure proper synchronization with the Football Data API.

## What is `apiName`?

The `apiName` field in the Team model stores the exact team name as it appears in the Football Data API. This ensures accurate matching when syncing matches.

## Current Status

✅ **Premier League Teams (20/20 mapped)**
- All Premier League teams have been mapped and should sync correctly

✅ **La Liga Teams (20/20 mapped)**
- All La Liga teams have been mapped and should sync correctly

✅ **Bundesliga Teams (18/18 mapped)**
- All Bundesliga teams have been mapped and should sync correctly

⚠️ **Other Leagues**
- Teams from other leagues (Serie A, Ligue 1, etc.) may need API names added

## How to Add API Names for Teams

### Option 1: Using SQL (Quick)

```sql
-- Update a single team
UPDATE "Team"
SET "apiName" = 'FC Barcelona'
WHERE name = 'Barcelona';

-- Update multiple teams
UPDATE "Team"
SET "apiName" = CASE
  WHEN name = 'Real Madrid' THEN 'Real Madrid CF'
  WHEN name = 'Atlético Madrid' THEN 'Club Atlético de Madrid'
  WHEN name = 'Bayern Munich' THEN 'FC Bayern München'
  ELSE "apiName"
END
WHERE name IN ('Real Madrid', 'Atlético Madrid', 'Bayern Munich');
```

### Option 2: Using Prisma Studio (Visual)

1. Run `npx prisma studio` in the backend folder
2. Navigate to the Team model
3. Find the team you want to update
4. Add the API name in the `apiName` field
5. Save

### Option 3: Create a Script (Bulk Updates)

Create a file `backend/add-team-mappings.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mappings: Record<string, string> = {
  // Add your mappings here
  'Barcelona': 'FC Barcelona',
  'Real Madrid': 'Real Madrid CF',
  'Bayern Munich': 'FC Bayern München',
  // ... etc
};

async function addMappings() {
  for (const [teamName, apiName] of Object.entries(mappings)) {
    await prisma.team.updateMany({
      where: { name: teamName },
      data: { apiName }
    });
    console.log(`✅ ${teamName} -> ${apiName}`);
  }
  await prisma.$disconnect();
}

addMappings();
```

Run with: `npx ts-node backend/add-team-mappings.ts`

## Finding the Correct API Names

To find the exact API name for a team:

1. Go to the **Admin > Football Data API** page
2. Select a competition (e.g., "La Liga")
3. Click "Fetch Teams"
4. Look at the response - the team names in the API are what you need to use
5. Or check the API directly: https://api.football-data.org/v4/competitions/PD/teams (requires auth token)

## Common API Name Patterns

### La Liga (Spain)
- Usually: "Team Name CF" or "Team Name FC"
- Examples:
  - Barcelona → FC Barcelona
  - Real Madrid → Real Madrid CF
  - Atlético Madrid → Club Atlético de Madrid

### Bundesliga (Germany)
- Usually: Full German names with proper characters
- Examples:
  - Bayern Munich → FC Bayern München
  - Borussia Dortmund → Borussia Dortmund
  - Borussia Mönchengladbach → Borussia Mönchengladbach

### Serie A (Italy)
- Usually: Full Italian names
- Examples:
  - Juventus FC → Juventus FC
  - Inter Milan → FC Internazionale Milano
  - AC Milan → AC Milan

### Premier League (England)
✅ All mapped! Examples:
- Arsenal → Arsenal FC
- Manchester United → Manchester United FC
- Brighton → Brighton & Hove Albion FC

## Troubleshooting

If teams still aren't matching after adding API names:

1. **Check the league**: Make sure the team is in the correct league in your database
2. **Check spelling**: API names are case-insensitive but must match exactly (including &, spaces, etc.)
3. **Check the logs**: The sync preview will show which teams couldn't be matched
4. **Use Prisma Studio**: Verify the apiName was saved correctly

## Database Schema

```prisma
model Team {
  id           Int     @id @default(autoincrement())
  name         String
  shortName    String?
  code         String  @unique
  apiName      String? // ← This is what we use for API matching
  // ... other fields
}
```

## Priority Matching Logic

The sync function matches teams in this order:

1. **Exact match on `apiName`** (highest priority)
2. Exact match on `name` or `shortName`
3. Fuzzy match (contains) on any field (fallback only)

This ensures that if you set the `apiName`, it will always be used first.
