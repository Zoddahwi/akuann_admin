-- Remove public API access to every table.
--
-- The Supabase `anon` key is a public credential: it ships to browsers and is
-- only safe if RLS restricts what it can reach. This database had the opposite
-- setup -- every policy was `FOR ALL TO public USING (true) WITH CHECK (true)`,
-- Consultation and MeasurementSheet had RLS off entirely, and both `anon` and
-- `authenticated` held SELECT/INSERT/UPDATE/DELETE/TRUNCATE on all 9 tables. A
-- plain PostgREST request with the anon key returned live client PII.
--
-- The app is unaffected: Prisma connects as `postgres`, which owns every table,
-- and no table sets FORCE ROW LEVEL SECURITY, so the owner bypasses RLS.

BEGIN;

-- 1. Drop the permissive policies. USING (true) TO public protects nothing.
DROP POLICY IF EXISTS "Enable all for ClientOnboarding" ON public."ClientOnboarding";
DROP POLICY IF EXISTS "Enable all for Gown"             ON public."Gown";
DROP POLICY IF EXISTS "Enable all for Invoice"          ON public."Invoice";
DROP POLICY IF EXISTS "Enable all for InvoiceItem"      ON public."InvoiceItem";
DROP POLICY IF EXISTS "Enable all for Order"            ON public."Order";
DROP POLICY IF EXISTS "Enable all for OrderItem"        ON public."OrderItem";
DROP POLICY IF EXISTS "Enable all for User"             ON public."User";

-- 2. Turn RLS on everywhere. With no policies and no grants this denies all
--    non-owner access, and covers the two tables that had it switched off.
ALTER TABLE public."ClientOnboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Consultation"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Gown"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InvoiceItem"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MeasurementSheet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User"             ENABLE ROW LEVEL SECURITY;

-- 3. Take the table privileges away from the two roles the public API uses.
REVOKE ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 4. Stop tables created later from being granted the same access again.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

COMMIT;
