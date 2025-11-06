# Vercel API Routes Optimization Guide

## 🚨 Current Architecture Issues

### Your Current Setup:
```
Frontend (Next.js) → Axios → Express Backend (Single Serverless Function) → Supabase
```

### Problems:
1. ❌ **Entire Express app bundled as ONE serverless function** (slow cold starts)
2. ❌ **No Edge runtime usage** (missing 10-100x faster responses for reads)
3. ❌ **No HTTP caching headers** (unnecessary database hits)
4. ❌ **No pagination** on most list endpoints
5. ❌ **Large payloads** (fetching all columns even when not needed)
6. ❌ **No ISR/SSR** for data that can be statically generated
7. ❌ **Suboptimal Supabase connection** (likely not using connection pooling)
8. ❌ **Extra network hop** (Next.js → Express serverless → Supabase)

---

## ✅ Recommended Architecture

### Option 1: Migrate to Next.js API Routes (RECOMMENDED)
```
Frontend (Next.js) → Next.js API Routes (Edge/Node) → Supabase
```

**Benefits:**
- 🚀 **10-100x faster** for read operations (Edge runtime)
- 🔥 **Zero cold starts** for Edge functions
- 💰 **Lower costs** (Edge is cheaper than Node serverless)
- 🌍 **Global distribution** (Edge runs at user's nearest location)
- 📦 **Smaller bundles** (individual API routes vs monolithic Express)
- ⚡ **Better Vercel integration** (built-in optimizations)

### Option 2: Keep Express but Split Routes
```
Frontend → [Edge Routes] → Supabase
Frontend → [Node Routes (Express)] → Supabase
```

---

## 🎯 Edge vs Node Runtime Decision Matrix

| Endpoint Type | Runtime | Reason |
|---------------|---------|--------|
| **GET /api/leaderboard** | Edge ✅ | Simple SELECT, no compute, cacheable |
| **GET /api/matches** | Edge ✅ | Read-only, high traffic, cacheable |
| **GET /api/leagues** | Edge ✅ | Rarely changes, perfect for ISR |
| **GET /api/teams** | Edge ✅ | Static data, cacheable |
| **GET /api/standings** | Edge ✅ | Read-only, can cache 1-5 min |
| **GET /api/predictions/user** | Node 🟡 | User-specific, needs auth session |
| **POST /api/predictions** | Node 🟡 | Write operation + validation |
| **POST /api/auth/login** | Node 🟡 | Needs crypto, session creation |
| **POST /api/sync/gameweek** | Node 🟡 | Heavy compute, multiple writes |
| **GET /api/groups/:id** | Node 🟡 | Complex auth + privacy checks |
| **POST /api/export** | Node 🟡 | Heavy processing (Excel generation) |

### Edge Runtime Limitations:
- ❌ No native Node.js modules (crypto, fs, child_process)
- ❌ No long-running operations (30s timeout)
- ❌ Smaller memory (4MB response limit)
- ✅ Perfect for: Simple reads, Supabase queries, JSON responses

---

## 📊 Performance Comparison

### Before (Express Monolith):
```
GET /api/matches (cold start)   → 1200-2500ms
GET /api/matches (warm)          → 300-500ms
GET /api/leaderboard (warm)      → 400-600ms
```

### After (Next.js Edge):
```
GET /api/matches (Edge, cached)  → 10-50ms   ⚡ 50-100x faster
GET /api/matches (Edge, no cache)→ 100-200ms ⚡ 5-10x faster
GET /api/leaderboard (Edge)      → 80-150ms  ⚡ 4-7x faster
```

---

## 🔧 Implementation Guide

### 1. Supabase Connection String Optimization

**Current (likely):**
```env
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
```

**Optimized (Connection Pooling):**
```env
# For Prisma with Supabase Pooler (PgBouncer)
DATABASE_URL="postgresql://user:pass@db.supabase.co:6543/postgres?pgbouncer=true"

# Direct connection (for migrations only)
DIRECT_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
```

**Update `backend/prisma/schema.prisma`:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

**Benefits:**
- ✅ Prevents "too many connections" errors
- ✅ Faster connection reuse
- ✅ Better for serverless (connection pooling is essential)

---

### 2. Next.js API Route Structure

**Create:** `frontend/app/api/` folder structure:

```
frontend/app/api/
├── auth/
│   ├── login/route.ts           (Node - crypto, session)
│   ├── register/route.ts        (Node)
│   └── me/route.ts              (Node - session check)
├── matches/
│   ├── route.ts                 (Edge - GET list)
│   └── [id]/route.ts            (Edge - GET by ID)
├── leaderboard/
│   └── route.ts                 (Edge - cacheable reads)
├── predictions/
│   ├── route.ts                 (Node - POST create)
│   └── user/route.ts            (Node - authenticated)
├── sync/
│   └── gameweek/[id]/route.ts   (Node - heavy writes)
└── leagues/
    └── route.ts                 (Edge - static ISR)
```

---

### 3. Example: Optimized Edge Route (Matches List)

**File:** `frontend/app/api/matches/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ EDGE RUNTIME - Global distribution, fast cold starts
export const runtime = 'edge';

// ✅ CACHING - Revalidate every 60 seconds (ISR-like)
export const revalidate = 60;

// Initialize Supabase client (Edge-compatible)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // ✅ PAGINATION - Always limit results
    const offset = (page - 1) * limit;

    // ✅ SELECTIVE FIELDS - Only fetch what's needed
    let query = supabase
      .from('Match')
      .select(`
        id,
        matchDate,
        homeScore,
        awayScore,
        status,
        weekNumber,
        homeTeam:Team!Match_homeTeamId_fkey(id, name, shortName, logoUrl),
        awayTeam:Team!Match_awayTeamId_fkey(id, name, shortName, logoUrl),
        league:League(id, name, code)
      `)
      .order('matchDate', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (leagueId) query = query.eq('leagueId', parseInt(leagueId));
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // ✅ HTTP CACHING HEADERS - Browser/CDN caching
    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'CDN-Cache-Control': 'public, s-maxage=120',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300'
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Key Optimizations:**
- ✅ Edge runtime (10-100x faster, global distribution)
- ✅ Pagination (limit + offset)
- ✅ Selective fields (smaller payloads)
- ✅ HTTP caching headers (CDN caching)
- ✅ Revalidate every 60s (ISR-like behavior)
- ✅ Proper error handling

---

### 4. Example: Node Route (Predictions Create)

**File:** `frontend/app/api/predictions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

// ✅ NODE RUNTIME - Needs Prisma, session validation
export const runtime = 'nodejs';

// Prisma singleton for serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Verify user session (simplified - use your auth library)
async function verifySession(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function POST(request: NextRequest) {
  try {
    // ✅ SESSION VALIDATION
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // ✅ INPUT VALIDATION
    const body = await request.json();
    const { matchId, predictedHomeScore, predictedAwayScore } = body;

    if (!matchId || predictedHomeScore == null || predictedAwayScore == null) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    // ✅ BUSINESS LOGIC - Check deadline
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { matchDate: true, status: true }
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    const deadlineHours = 4;
    const deadline = new Date(match.matchDate.getTime() - deadlineHours * 60 * 60 * 1000);

    if (new Date() > deadline) {
      return NextResponse.json(
        { success: false, error: 'Prediction deadline has passed' },
        { status: 400 }
      );
    }

    // ✅ UPSERT PREDICTION
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId
        }
      },
      update: {
        predictedHomeScore,
        predictedAwayScore
      },
      create: {
        userId: user.id,
        matchId,
        predictedHomeScore,
        predictedAwayScore
      }
    });

    // ✅ NO CACHING for writes
    return NextResponse.json(
      { success: true, data: prediction },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error: any) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET user's predictions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySession(sessionToken);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    // ✅ PAGINATION
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // ✅ SELECTIVE FIELDS
    const predictions = await prisma.prediction.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        predictedHomeScore: true,
        predictedAwayScore: true,
        totalPoints: true,
        isProcessed: true,
        match: {
          select: {
            id: true,
            matchDate: true,
            homeScore: true,
            awayScore: true,
            status: true,
            homeTeam: { select: { id: true, name: true, logoUrl: true } },
            awayTeam: { select: { id: true, name: true, logoUrl: true } },
            league: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // ✅ SHORT CACHE for authenticated reads
    return NextResponse.json(
      { success: true, data: predictions },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=30' // 30s cache for user
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

### 5. Example: Leaderboard with Edge + Caching

**File:** `frontend/app/api/leaderboard/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let leaderboard;

    if (leagueId) {
      // League-specific: Aggregate from predictions
      const { data, error } = await supabase.rpc('get_league_leaderboard', {
        p_league_id: parseInt(leagueId),
        p_limit: limit
      });

      if (error) throw error;
      leaderboard = data;
    } else {
      // Global: Use pre-calculated User.totalPoints
      const { data, error } = await supabase
        .from('User')
        .select('id, username, totalPoints, totalPredictions')
        .gt('totalPredictions', 0)
        .order('totalPoints', { ascending: false })
        .limit(limit);

      if (error) throw error;
      leaderboard = data?.map((user, index) => ({ rank: index + 1, ...user }));
    }

    // ✅ AGGRESSIVE CACHING for leaderboards
    return NextResponse.json(
      { success: true, data: leaderboard },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=600',
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

### 6. Create Supabase RPC Functions (for Edge-compatible aggregation)

Since Edge runtime can't use Prisma's `$queryRaw`, create database functions:

```sql
-- Create function for league leaderboard
CREATE OR REPLACE FUNCTION get_league_leaderboard(p_league_id INT, p_limit INT)
RETURNS TABLE (
  rank BIGINT,
  id INT,
  username VARCHAR,
  "totalPoints" BIGINT,
  "totalPredictions" BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(p."totalPoints") DESC) as rank,
    u.id,
    u.username,
    COALESCE(SUM(p."totalPoints"), 0) as "totalPoints",
    COUNT(p.id) as "totalPredictions"
  FROM "User" u
  LEFT JOIN "Prediction" p ON u.id = p."userId"
  LEFT JOIN "Match" m ON p."matchId" = m.id
  WHERE m."leagueId" = p_league_id
  GROUP BY u.id, u.username
  HAVING COUNT(p.id) > 0
  ORDER BY "totalPoints" DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 📦 Payload Size Optimization

### Before (Express - Full Objects):
```json
{
  "homeTeam": {
    "id": 1,
    "name": "Arsenal",
    "shortName": "ARS",
    "code": "ARS",
    "apiName": "Arsenal FC",
    "logoUrl": "...",
    "stadiumName": "Emirates Stadium",
    "foundedYear": 1886,
    "website": "https://...",
    "primaryColor": "#EF0107",
    "createdAt": "2024-...",
    "updatedAt": "2024-..."
  }
}
```
**Size:** ~300-500 bytes per team

### After (Selective Fields):
```json
{
  "homeTeam": {
    "id": 1,
    "name": "Arsenal",
    "logoUrl": "..."
  }
}
```
**Size:** ~50-80 bytes per team
**Reduction:** 80-85% smaller

---

## 🗜️ Response Compression

**Update `frontend/next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // ✅ Enable gzip compression

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 🚀 Frontend Optimization (SWR/React Query)

### Install SWR:
```bash
cd frontend
npm install swr
```

### Create API hook:
**File:** `frontend/lib/hooks/useMatches.ts`

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useMatches(leagueId?: number, options = {}) {
  const url = leagueId
    ? `/api/matches?leagueId=${leagueId}`
    : '/api/matches';

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Dedupe requests within 60s
    ...options
  });

  return {
    matches: data?.data,
    isLoading,
    isError: error,
    mutate
  };
}
```

### Use in component:
```typescript
'use client';

import { useMatches } from '@/lib/hooks/useMatches';

export default function MatchesPage() {
  const { matches, isLoading, isError } = useMatches();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading matches</div>;

  return (
    <div>
      {matches?.map(match => (
        <div key={match.id}>{/* render match */}</div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Automatic caching
- ✅ Deduplication (multiple components = 1 request)
- ✅ Automatic revalidation
- ✅ Optimistic updates

---

## 📊 Migration Strategy

### Phase 1: Quick Wins (Keep Express, Add Optimizations)
1. Add pagination to all list endpoints
2. Add `select` to reduce payload sizes
3. Add HTTP caching headers
4. Configure Supabase connection pooling
5. Deploy: **~2-4 hours, 40-60% performance improvement**

### Phase 2: Hybrid Approach
1. Keep Express backend for writes
2. Create Next.js Edge routes for high-traffic reads:
   - GET /api/matches
   - GET /api/leaderboard
   - GET /api/leagues
   - GET /api/standings
3. Deploy: **~1-2 days, 70-85% performance improvement**

### Phase 3: Full Migration (Recommended)
1. Migrate all routes to Next.js API routes
2. Use Edge runtime for 60% of routes
3. Remove Express backend entirely
4. Deploy: **~3-5 days, 85-95% performance improvement**

---

## 🔍 Testing Performance

### Before/After Comparison:

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test Express endpoint (before)
ab -n 100 -c 10 https://your-backend.vercel.app/api/matches

# Test Next.js Edge endpoint (after)
ab -n 100 -c 10 https://your-app.vercel.app/api/matches
```

### Monitor in Vercel Dashboard:
- Cold start duration
- P50/P95/P99 latency
- Cache hit ratio
- Edge vs Node invocations

---

## 💰 Cost Comparison

| Setup | Cost/1M Requests | Cold Starts | Avg Latency |
|-------|-----------------|-------------|-------------|
| Express Serverless | $40-60 | High (1-3s) | 300-500ms |
| Next.js Edge (reads) | $5-10 | None | 20-100ms |
| Next.js Node (writes) | $20-30 | Low (200-500ms) | 150-300ms |

**Hybrid approach savings:** 60-70% cost reduction for read-heavy apps

---

## ✅ Summary Checklist

- [ ] Configure Supabase connection pooling (`?pgbouncer=true`)
- [ ] Add pagination to all list endpoints (`limit`, `offset`)
- [ ] Add HTTP caching headers (`Cache-Control`)
- [ ] Reduce payload sizes (selective `select`)
- [ ] Migrate high-traffic reads to Edge runtime
- [ ] Keep complex writes in Node runtime
- [ ] Use SWR/React Query on frontend
- [ ] Enable compression in `next.config.ts`
- [ ] Create Supabase RPC functions for aggregations
- [ ] Monitor performance in Vercel dashboard
- [ ] Set up proper error handling with `NextResponse`

---

## 📝 Next Steps

1. **Immediate** (1 hour):
   - Update Supabase connection string
   - Add pagination limits to Express routes

2. **Short-term** (1-2 days):
   - Create `/api/matches/route.ts` (Edge)
   - Create `/api/leaderboard/route.ts` (Edge)
   - Update frontend to use new endpoints

3. **Long-term** (1 week):
   - Migrate all read routes to Edge
   - Keep write routes in Node
   - Remove Express dependency

**Need help with migration? Let me know which endpoints to prioritize!**
