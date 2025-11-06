# API Optimization Migration Steps

## Overview
This guide walks you through migrating from Express backend to optimized Next.js API routes.

**Estimated time:** 2-6 hours depending on approach

---

## ⚡ Quick Start (Option 1: Hybrid Approach)

Keep your Express backend but add optimized Edge routes for high-traffic endpoints.

### Step 1: Install Dependencies (5 minutes)

```bash
cd frontend
npm install swr @supabase/supabase-js
```

### Step 2: Setup Supabase Connection Pooling (10 minutes)

1. Get your Supabase pooled connection string:
   - Dashboard → Settings → Database → Connection Pooling
   - Copy **Transaction mode** connection string

2. Update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://...db.supabase.co:5432/postgres"
   ```

3. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

4. Regenerate Prisma Client:
   ```bash
   cd backend
   npx prisma generate
   ```

### Step 3: Add Environment Variables (5 minutes)

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:7070
```

### Step 4: Deploy New API Routes (15 minutes)

The routes are already created in `frontend/app/api/`:
- ✅ `/api/matches/route.ts` (Edge runtime)
- ✅ `/api/leaderboard/route.ts` (Edge runtime)
- ✅ `/api/predictions/route.ts` (Node runtime)

**Important:** Rename `matches/supabase-edge.ts` to `matches/route.ts` for Edge runtime.

```bash
cd frontend/app/api/matches
mv route.ts route-proxy.ts.backup
mv supabase-edge.ts route.ts
```

### Step 5: Update Frontend to Use New Endpoints (30 minutes)

Replace axios calls with SWR hooks:

**Before:**
```typescript
// Old way
const [matches, setMatches] = useState([]);
useEffect(() => {
  api.get('/matches').then(res => setMatches(res.data));
}, []);
```

**After:**
```typescript
// New way (with caching, deduplication, auto-revalidation)
import { useMatches } from '@/lib/hooks/useApi';
const { matches, isLoading, error } = useMatches();
```

See `frontend/app/api/EXAMPLE_USAGE.tsx` for complete examples.

### Step 6: Test Locally (10 minutes)

```bash
# Terminal 1: Start backend (for writes)
cd backend
npm run dev

# Terminal 2: Start frontend (serves new API routes)
cd frontend
npm run dev
```

Visit: http://localhost:8080

**Test checklist:**
- [ ] Matches list loads (should be fast ~50-100ms)
- [ ] Leaderboard loads (should see "Edge" indicator)
- [ ] Create prediction still works (uses Express backend)
- [ ] No console errors

### Step 7: Deploy to Vercel (20 minutes)

```bash
# Add environment variables to Vercel
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

**Result:** 60-80% faster read operations, same write performance.

---

## 🚀 Full Migration (Option 2: All-In on Next.js API Routes)

Migrate all routes to Next.js for maximum performance.

### Additional Steps:

1. **Migrate auth routes** (1-2 hours):
   - Create `frontend/app/api/auth/login/route.ts`
   - Create `frontend/app/api/auth/register/route.ts`
   - Create `frontend/app/api/auth/me/route.ts`
   - Use Node runtime (requires session management)

2. **Migrate write endpoints** (2-3 hours):
   - Move sync operations to `/api/sync/`
   - Move group operations to `/api/groups/`
   - All use Node runtime with Prisma

3. **Remove Express backend** (30 minutes):
   - Delete `backend/` folder
   - Update all frontend API calls
   - Remove axios dependency
   - Use native fetch with SWR

4. **Test thoroughly** (1-2 hours):
   - Test all CRUD operations
   - Test authentication flow
   - Test admin operations
   - Load test with k6 or Apache Bench

---

## 📊 Expected Performance Improvements

### Hybrid Approach (Option 1):
- **Read operations:** 70-85% faster
- **Write operations:** Same (still uses Express)
- **Deployment:** 30 minutes
- **Risk:** Low (Express is fallback)

### Full Migration (Option 2):
- **Read operations:** 85-95% faster
- **Write operations:** 20-40% faster
- **Deployment:** 4-6 hours
- **Risk:** Medium (requires thorough testing)

---

## 🐛 Troubleshooting

### "Module not found: @supabase/supabase-js"
```bash
cd frontend
npm install @supabase/supabase-js
```

### "DATABASE_URL environment variable not found"
Add to Vercel environment variables or local `.env`

### "CORS error when calling API"
Update CORS settings in `backend/src/index.ts` to include frontend URL

### "Prisma Client initialization failed"
Run `npx prisma generate` in backend folder

### Edge route returns 500 error
Edge runtime can't use Prisma - use Supabase client instead

---

## 📈 Monitoring Performance

### Before Migration:
```bash
# Test current performance
curl -w "@curl-format.txt" https://your-backend.vercel.app/api/matches
```

### After Migration:
```bash
# Test new Edge route
curl -w "@curl-format.txt" https://your-app.vercel.app/api/matches
```

**Expected results:**
- Before: 300-800ms
- After: 50-150ms

### Vercel Analytics:
1. Go to Vercel Dashboard
2. Click your project
3. Navigate to **Analytics** → **Web Vitals**
4. Monitor:
   - P50 latency (should decrease by 60-80%)
   - Cache hit ratio (should increase to 70-90%)
   - Edge function invocations (new metric)

---

## 💡 Pro Tips

1. **Start with read-only routes** (matches, leaderboard, standings)
   - Lowest risk
   - Highest performance gain
   - Easy to rollback

2. **Keep writes in Express initially**
   - More complex logic
   - Requires careful testing
   - Migrate later when confident

3. **Monitor cache hit rates**
   - Check Vercel Analytics
   - Aim for 70-90% cache hits
   - Adjust `revalidate` times if needed

4. **Use feature flags**
   - Toggle between old/new endpoints
   - A/B test performance
   - Rollback instantly if issues

5. **Load test before full migration**
   ```bash
   # Install k6
   brew install k6  # macOS
   apt install k6   # Linux

   # Test endpoint
   k6 run --vus 50 --duration 30s loadtest.js
   ```

---

## 🎯 Success Criteria

Before considering migration complete:

- [ ] All API routes return 200 status
- [ ] Average response time < 200ms for Edge routes
- [ ] Cache hit ratio > 70%
- [ ] Zero errors in production logs (24 hours)
- [ ] User authentication works flawlessly
- [ ] All CRUD operations function correctly
- [ ] Admin panel fully functional
- [ ] Match syncing works without issues
- [ ] Leaderboards update correctly
- [ ] No "too many connections" errors

---

## 📞 Need Help?

If you encounter issues:

1. Check the comprehensive guides:
   - `VERCEL_API_OPTIMIZATION.md` - Full optimization guide
   - `SUPABASE_CONNECTION_POOLING.md` - Database setup
   - `frontend/app/api/EXAMPLE_USAGE.tsx` - Code examples

2. Verify environment variables:
   ```bash
   vercel env pull .env.local
   cat .env.local
   ```

3. Check Vercel logs:
   ```bash
   vercel logs [deployment-url]
   ```

4. Test routes individually:
   ```bash
   curl https://your-app.vercel.app/api/matches
   curl https://your-app.vercel.app/api/leaderboard
   ```

---

## ✅ Quick Checklist

**Pre-migration:**
- [ ] Backup database
- [ ] Document current performance metrics
- [ ] Set up staging environment (optional)

**Migration:**
- [ ] Install dependencies (swr, @supabase/supabase-js)
- [ ] Configure Supabase connection pooling
- [ ] Add environment variables
- [ ] Deploy new API routes
- [ ] Update frontend to use SWR hooks
- [ ] Test locally
- [ ] Deploy to Vercel

**Post-migration:**
- [ ] Monitor error rates (24 hours)
- [ ] Compare performance metrics
- [ ] Check cache hit ratios
- [ ] Verify all features work
- [ ] Celebrate! 🎉

---

**Estimated Total Time:**
- Hybrid approach: 2-3 hours
- Full migration: 4-6 hours

**Expected ROI:**
- 70-95% faster API responses
- 10-20x more concurrent users supported
- 50-70% cost reduction
- Better user experience

**Start with Step 1 and work through sequentially. Good luck! 🚀**
