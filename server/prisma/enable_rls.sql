-- ============================================
-- AURELIS — Enable Row-Level Security (RLS)
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
--
-- WHY: Supabase auto-exposes a REST API (PostgREST) using the 'anon' key.
-- Without RLS, ANYONE with your Supabase URL + anon key can read/write
-- ALL data in ALL tables — orders, customer emails, everything.
--
-- HOW THIS WORKS:
-- 1. Enable RLS on every table → blocks ALL access by default
-- 2. NO policies for 'anon' or 'authenticated' roles → REST API is fully locked
-- 3. Prisma connects as 'postgres' role → bypasses RLS automatically
--    So your Express server continues to work exactly as before.
-- ============================================

-- 1. Enable RLS on all tables
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Watch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- 2. (Optional safety) Force RLS even for the table owner
-- Uncomment these if you want extra paranoia — but this will also
-- block your Prisma server unless you add explicit policies.
-- Only uncomment if you understand the implications.
-- ALTER TABLE "Order" FORCE ROW LEVEL SECURITY;
-- ALTER TABLE "OrderItem" FORCE ROW LEVEL SECURITY;
-- ALTER TABLE "Watch" FORCE ROW LEVEL SECURITY;
-- ALTER TABLE "Review" FORCE ROW LEVEL SECURITY;

-- 3. Allow public read-only access to watches via REST API (optional)
-- This is useful if you ever want to fetch the catalog directly from
-- the frontend without going through your Express server.
-- CREATE POLICY "Allow public read access to watches"
--   ON "Watch"
--   FOR SELECT
--   TO anon
--   USING (true);

-- 4. Allow public read-only access to reviews via REST API (optional)
-- CREATE POLICY "Allow public read access to reviews"
--   ON "Review"
--   FOR SELECT
--   TO anon
--   USING (true);

-- ============================================
-- VERIFICATION: Run this query after to confirm RLS is enabled
-- ============================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('Order', 'OrderItem', 'Watch', 'Review');
