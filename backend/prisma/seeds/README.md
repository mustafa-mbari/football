# Database Seeds - Modular Structure

This directory contains modular seed files for the Football Predictions database.

## 📁 File Structure

```
prisma/
├── seed.ts                           # Main orchestration file
└── seeds/
    ├── users.seed.ts                 # User accounts, sessions, login history
    ├── leagues-teams.seed.ts         # Leagues, teams, favorite teams
    ├── matches.seed.ts               # Matches, match events
    ├── predictions-standings.seed.ts # Predictions, standings
    ├── groups-achievements.seed.ts   # Groups, achievements, notifications
    └── system-data.seed.ts           # Points rules, analytics, audit logs
```

## 🚀 Running Seeds

### Run all seeds:
```bash
npx ts-node prisma/seed.ts
```

### Reset database and run seeds:
```bash
npx prisma migrate reset --force
```

### Reset with environment variable (for CI/CD):
```bash
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force
```

## 📊 Seed Data Included

### 👥 Users (users.seed.ts)
- **5 Test Users**: Mustafa (Super Admin), Youssef (Admin), Ali, Mohammed, Majid
- **Sessions**: Active sessions for users
- **Login History**: Login records with IP addresses

### 🏆 Leagues & Teams (leagues-teams.seed.ts)
- **3 Leagues**: Premier League, La Liga, Bundesliga
- **28 Teams**: 10 PL, 10 La Liga, 8 Bundesliga (with real logos)
- **Favorite Teams**: User-team relationships

### 📅 Matches (matches.seed.ts)
- **22 Matches**: Mix of finished, live, and scheduled
- **Match Events**: Goals and other events for finished matches
- **Real Data**: Actual scores, venues, referees

### 🔮 Predictions & Standings (predictions-standings.seed.ts)
- **55 Predictions**: User predictions with calculated points
- **10 Standings**: Realistic Premier League table

### 👥 Groups & Achievements (groups-achievements.seed.ts)
- **5 Groups**: Public and private prediction groups
- **20 Achievements**: Across all categories
- **User Achievements**: Unlocked achievements per user
- **Notifications**: Sample notifications for all users

### 📏 System Data (system-data.seed.ts)
- **11 Points Rules**: Complete scoring system
- **31 Days Analytics**: Historical analytics data
- **Audit Logs**: System audit trail

## 🔑 Test User Credentials

All users have password: `password123`

| Email | Username | Role | Rank | Points | Accuracy |
|-------|----------|------|------|--------|----------|
| mustafa@example.com | mustafa | SUPER_ADMIN | #1 | 1250 | 72.5% |
| youssef@example.com | youssef | ADMIN | #2 | 1150 | 68.9% |
| ali@example.com | ali | USER | #3 | 980 | 65.3% |
| mohammed@example.com | mohammed | USER | #4 | 875 | 61.8% |
| majid@example.com | majid | USER | #5 | 650 | 58.2% |

## 🔧 Customization

### Adding New Seed Data

1. Create a new seed file in `seeds/` directory
2. Export seed functions
3. Import and call in `seed.ts`

Example:
```typescript
// seeds/my-new-data.seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedMyData() {
  console.log('Creating my data...');
  // Your seed logic here
  console.log('✅ Created my data');
}
```

```typescript
// seed.ts
import { seedMyData } from './seeds/my-new-data.seed';

async function main() {
  // ... other seeds
  await seedMyData();
}
```

### Modifying Existing Seeds

Each seed file is independent. You can modify individual files without affecting others:

- **Users**: Edit `users.seed.ts`
- **Teams**: Edit `leagues-teams.seed.ts`
- **Matches**: Edit `matches.seed.ts`
- etc.

## 📝 Notes

- All seeds use simple password hashing for testing (prefix: `hashed_`)
- In production, use proper bcrypt/argon2 hashing
- Dates are generated relative to current time
- Team logos use official URLs where available
- Analytics data includes last 30 days
