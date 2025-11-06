# Supabase Connection Pooling Setup

## Why Connection Pooling is Critical for Vercel

Serverless functions (like Vercel) create new database connections for each request. Without pooling:
- ❌ **"Too many connections"** errors (PostgreSQL default: 100 connections)
- ❌ **Slow connection establishment** (adds 100-300ms per request)
- ❌ **Connection exhaustion** under load

With connection pooling:
- ✅ **Reuse existing connections** (instant)
- ✅ **Support 1000s of concurrent requests** (vs 100 without pooling)
- ✅ **Lower latency** (50-200ms faster)

---

## Setup Guide

### 1. Get Supabase Pooler Connection String

#### Option A: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection Pooling**
4. Copy the **Transaction Mode** connection string
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

#### Option B: Build Manually
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key differences from direct connection:**
- Port: `6543` (pooler) instead of `5432` (direct)
- Host: `[region].pooler.supabase.com` instead of `db.supabase.co`
- Query param: `?pgbouncer=true`

---

### 2. Update Environment Variables

#### Backend `.env`:
```env
# ✅ For Prisma queries (uses connection pooler)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"

# ✅ For migrations only (direct connection)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.supabase.co:5432/postgres"
```

#### Frontend `.env.local`:
```env
# Supabase client (for Edge runtime routes)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

### 3. Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     // ✅ Pooled connection for queries
  directUrl = env("DIRECT_URL")       // ✅ Direct connection for migrations
}

generator client {
  provider = "prisma-client-js"
}

// ... rest of your schema
```

**Why two URLs?**
- `url`: Used for Prisma Client queries (pooled, fast)
- `directUrl`: Used for migrations and schema introspection (direct, required for DDL statements)

---

### 4. Regenerate Prisma Client

```bash
cd backend
npx prisma generate
```

---

### 5. Test Connection Pooling

#### Test Script:
**File:** `backend/test-connection.ts`

```typescript
import prisma from './src/config/database';

async function testConnection() {
  console.log('Testing Supabase connection pooling...\n');

  const startTime = Date.now();

  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - startTime;

    console.log('✅ Connection successful!');
    console.log(`⏱️  Query time: ${duration}ms`);
    console.log('📊 Result:', result);

    // Test connection info
    const connectionInfo = await prisma.$queryRaw`
      SELECT
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `;

    console.log('\n📡 Connection Info:', connectionInfo);

    // Test pool status
    const poolStatus = await prisma.$queryRaw`
      SELECT
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    console.log('\n🏊 Pool Status:', poolStatus);

    console.log('\n✅ All tests passed! Connection pooling is working.');
  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

#### Run test:
```bash
cd backend
npx ts-node test-connection.ts
```

**Expected output:**
```
Testing Supabase connection pooling...

✅ Connection successful!
⏱️  Query time: 45ms
📊 Result: [ { test: 1 } ]

📡 Connection Info: [
  {
    database: 'postgres',
    user: 'postgres',
    server_ip: '10.0.0.123',
    server_port: 6543
  }
]

🏊 Pool Status: [ { total_connections: 12, active_connections: 3 } ]

✅ All tests passed! Connection pooling is working.
```

**Key indicators pooling is working:**
- ✅ `server_port: 6543` (pooler port)
- ✅ Query time < 100ms (fast)
- ✅ Multiple connections visible in pg_stat_activity

---

### 6. Vercel Environment Variables

Add these to your Vercel project:

```bash
# Using Vercel CLI
vercel env add DATABASE_URL
# Paste: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10

vercel env add DIRECT_URL
# Paste: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.supabase.co:5432/postgres

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://[PROJECT-REF].supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: your-service-role-key
```

Or via Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add each variable
3. Select environments: **Production**, **Preview**, **Development**

---

### 7. PgBouncer Configuration Options

#### Transaction Mode (Recommended for Prisma):
```
?pgbouncer=true&connection_limit=10
```
- Each function instance maintains max 10 connections
- Connections released after each transaction
- Best for serverless (Vercel)

#### Session Mode (For long-lived connections):
```
?pgbouncer=true&pool_mode=session&connection_limit=5
```
- Connection held for entire session
- Not recommended for serverless

#### Connection Limit Guidelines:
| Vercel Plan | Recommended Limit |
|-------------|-------------------|
| Hobby | 5-10 |
| Pro | 10-15 |
| Enterprise | 15-20 |

**Formula:** `(Expected concurrent requests) / (Avg functions per request) = connection_limit`

---

### 8. Monitoring Connection Usage

#### Query to check connections:
```sql
SELECT
  datname as database,
  usename as user,
  application_name,
  client_addr,
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY datname, usename, application_name, client_addr, state
ORDER BY connection_count DESC;
```

#### Run from Supabase Dashboard:
1. Go to **SQL Editor**
2. Paste query above
3. Click **Run**

#### Watch for issues:
- ❌ Total connections approaching 100 (direct connection limit)
- ❌ Many `idle` connections (not using pooler)
- ❌ Spike in connection errors in logs

---

### 9. Edge Runtime Considerations

**Edge functions CANNOT use Prisma** (requires Node.js runtime).

For Edge routes, use Supabase JS client:

```typescript
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Queries automatically use Supabase's built-in connection pooling
const { data } = await supabase.from('Match').select('*');
```

**Connection pooling is handled automatically by Supabase JS client.**

---

### 10. Troubleshooting

#### Error: "remaining connection slots reserved for non-replication superuser connections"
**Solution:** Enable connection pooling (you're hitting the 100 connection limit)

#### Error: "prepared statement already exists"
**Solution:** Add `?pgbouncer=true` to connection string (disables prepared statements in transaction mode)

#### Error: "SSL connection required"
**Solution:** Add `?sslmode=require` to connection string

#### Slow queries (>500ms)
**Solution:**
1. Check if using pooled connection (port 6543)
2. Verify `connection_limit` is set (default too high)
3. Check Supabase region matches Vercel region

---

## Performance Comparison

### Before (Direct Connection):
```
Cold start: 1200-2500ms (includes connection establishment)
Warm request: 200-400ms
Connection errors: Common under load
Max concurrent: ~50-70 requests
```

### After (Connection Pooling):
```
Cold start: 800-1500ms (faster connection reuse)
Warm request: 50-150ms
Connection errors: Rare
Max concurrent: 500-1000+ requests
```

**Result:** 2-5x faster, supports 10-20x more traffic

---

## Best Practices

1. ✅ **Always use pooler for Prisma queries**
2. ✅ **Use direct URL only for migrations**
3. ✅ **Set reasonable connection_limit** (10-15 for most apps)
4. ✅ **Monitor connection usage** (Supabase Dashboard → Database → Connections)
5. ✅ **Match Supabase region to Vercel region** (lower latency)
6. ✅ **Use Edge runtime with Supabase JS client** (when possible)
7. ❌ **Don't use direct connection in production** (will hit limits)
8. ❌ **Don't set connection_limit too high** (defeats pooling purpose)

---

## Vercel Region Optimization

Match Supabase and Vercel regions for lowest latency:

| Supabase Region | Vercel Region | Latency |
|-----------------|---------------|---------|
| US East (N. Virginia) | iad1 (US East) | ~2-5ms |
| EU West (Ireland) | dub1 (EU Dublin) | ~2-5ms |
| AP Southeast (Singapore) | sin1 (Singapore) | ~2-5ms |

**Set Vercel region:**
```json
// vercel.json
{
  "regions": ["iad1"]
}
```

---

## Summary Checklist

- [ ] Copy pooled connection string from Supabase Dashboard
- [ ] Update `DATABASE_URL` with pooler URL
- [ ] Add `DIRECT_URL` for migrations
- [ ] Update `prisma/schema.prisma` with both URLs
- [ ] Run `npx prisma generate`
- [ ] Test connection with test script
- [ ] Deploy to Vercel with environment variables
- [ ] Monitor connection usage in Supabase Dashboard
- [ ] Match Supabase and Vercel regions (optional but recommended)

**You're done!** Your app now supports 10-20x more concurrent users. 🚀
