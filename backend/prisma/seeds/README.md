# Database Seeding Structure

This directory contains the database seeding logic with a clean separation between data and seeder classes.

## 📁 Folder Structure

```
seeds/
├── classes/              # Seeder classes (logic)
│   ├── UserSeeder.ts
│   ├── LeagueSeeder.ts
│   ├── TeamSeeder.ts
│   ├── MatchSeeder.ts
│   ├── PredictionSeeder.ts
│   ├── GameWeekSeeder.ts
│   ├── GroupSeeder.ts
│   ├── AchievementSeeder.ts
│   ├── NotificationSeeder.ts
│   └── SystemDataSeeder.ts
├── data/                 # JSON data files
│   ├── users.json
│   ├── leagues.json
│   ├── teams.json
│   ├── matches.json
│   ├── groups.json
│   ├── achievements.json
│   ├── notifications.json
│   └── pointsRules.json
└── README.md
```

## 🎯 Design Pattern

### Seeder Classes
Each table in the database has its own seeder class that:
- Loads data from JSON files
- Contains the seeding logic
- Has methods for creating related records
- Named exactly as the table name + "Seeder" (e.g., `UserSeeder`, `TeamSeeder`)

### Data Files
- Stored in JSON format for easy editing
- Contains only data, no logic
- Easy to modify without touching code
- Can be version controlled separately

## 🚀 How to Use

### Running Seeds
```bash
# Reset database and run all seeds
npm run prisma:seed

# Or manually
npx ts-node prisma/seed.ts

# Reset database with seeds
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force
```

### Adding New Seed Data

1. **Create a JSON data file** in `seeds/data/`:
```json
{
  "tableName": [
    { "field1": "value1", "field2": "value2" }
  ]
}
```

2. **Create a seeder class** in `seeds/classes/`:
```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TableData {
  field1: string;
  field2: string;
}

interface SeedData {
  tableName: TableData[];
}

export class TableSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/tableName.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedTable() {
    console.log('\n📦 Creating table records...');

    const records = await Promise.all(
      this.data.tableName.map((record) =>
        prisma.table.create({
          data: {
            field1: record.field1,
            field2: record.field2,
          },
        })
      )
    );

    console.log(`✅ Created ${records.length} records`);
    return records;
  }
}
```

3. **Update the main seed file** (`prisma/seed.ts`):
```typescript
import { TableSeeder } from './seeds/classes/TableSeeder';

// In main function:
const tableSeeder = new TableSeeder();
await tableSeeder.seedTable();
```

## 📋 Seeder Classes Overview

| Class Name | Table(s) | Description |
|------------|----------|-------------|
| `UserSeeder` | User, Session, LoginHistory | User accounts and authentication |
| `LeagueSeeder` | League | Football leagues |
| `TeamSeeder` | Team, UserFavoriteTeam | Teams and user favorites |
| `MatchSeeder` | Match, MatchEvent | Matches and match events |
| `PredictionSeeder` | Prediction, Standing | User predictions and league standings |
| `GameWeekSeeder` | GameWeek, TeamGameWeekStats, StandingsSnapshot | Weekly tracking data |
| `GroupSeeder` | Group, GroupMember | User groups and memberships |
| `AchievementSeeder` | Achievement, UserAchievement | Achievements and unlocks |
| `NotificationSeeder` | Notification | User notifications |
| `SystemDataSeeder` | PointsRule, Analytics, AuditLog | System configuration and logs |

## ✨ Benefits

1. **Separation of Concerns**: Data and logic are completely separate
2. **Easy Maintenance**: Update data without touching code
3. **Reusability**: Seeder classes can be reused in different contexts
4. **Type Safety**: Full TypeScript support with interfaces
5. **Scalability**: Easy to add new seeders as the app grows
6. **Testability**: Each seeder can be tested independently
7. **Version Control**: Track data changes separately from code changes

## 🔧 Modifying Seed Data

To change seed data, simply edit the JSON files in the `data/` folder. For example, to add a new user:

**Before** (`data/users.json`):
```json
{
  "users": [
    { "name": "Mustafa", "email": "mustafa@example.com", ... }
  ]
}
```

**After**:
```json
{
  "users": [
    { "name": "Mustafa", "email": "mustafa@example.com", ... },
    { "name": "Ahmed", "email": "ahmed@example.com", ... }
  ]
}
```

Then run `npm run prisma:seed` to apply the changes!

## 🔑 Test User Credentials

All users have password: `password123`

| Email | Username | Role | Rank | Points | Accuracy |
|-------|----------|------|------|--------|----------|
| mustafa@example.com | mustafa | SUPER_ADMIN | #1 | 1250 | 72.5% |
| youssef@example.com | youssef | ADMIN | #2 | 1150 | 68.9% |
| ali@example.com | ali | USER | #3 | 980 | 65.3% |
| mohammed@example.com | mohammed | USER | #4 | 875 | 61.8% |
| majid@example.com | majid | USER | #5 | 650 | 58.2% |

## 📝 Notes

- All seeder classes follow the same pattern for consistency
- JSON files are validated at runtime by TypeScript interfaces
- Dates can be specified as ISO strings or calculated dynamically
- Related data uses indices to reference other records (e.g., `userIndex: 0`)
- Password hashing is handled by bcrypt in the UserSeeder
- Team logos use official URLs from league resources
