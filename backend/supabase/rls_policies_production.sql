-- =============================================================================
-- JustiFi Legal AI — Production Row Level Security (RLS)
-- =============================================================================
--
-- CONTEXT
-- -------
-- • Node.js API uses the Supabase *service role* key → bypasses RLS (unchanged).
-- • RLS protects: Supabase SQL editor accidents, leaked anon key, future
--   PostgREST / Supabase client usage from the browser.
-- • Your app users live in `public.users` with UUID ids. Supabase exposes
--   `auth.uid()` only when the active JWT is verified by Supabase Auth (or a
--   custom JWT integration that sets `request.jwt.claim.sub` the same as
--   `users.id`). If there is no such session, `auth.uid()` IS NULL and all
--   policies below that require it evaluate to “no access” — safe default.
--
-- FRONTEND (current repo)
-- -----------------------
-- • No Supabase client calls were found in the frontend; traffic goes through
--   the Node API + service role. Deploying this file does NOT break the UI.
-- • If you later add `@supabase/supabase-js` with the anon key, you MUST log
--   users in with Supabase Auth and ensure `auth.users.id` (or JWT `sub`)
--   equals `public.users.id` for these policies to grant access. Otherwise
--   direct queries will return empty sets (by design).
--
-- HOW TO APPLY
-- ------------
-- 1) Review helper functions and policies.
-- 2) Run in Supabase SQL Editor (or migration pipeline).
-- 3) Test with anon + authenticated keys in staging before production.
--
-- OPTIONAL: After migration to Supabase Auth, link `public.users.id` to
-- `auth.users.id` (same UUID on signup) and optionally add triggers to keep
-- them in sync.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Clean up previous policies (idempotent re-run)
--    Adjust names if you created custom policies elsewhere.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;
DROP POLICY IF EXISTS "lawyer_profiles_select_directory_or_own" ON public.lawyer_profiles;
DROP POLICY IF EXISTS "lawyer_profiles_insert_own_lawyer" ON public.lawyer_profiles;
DROP POLICY IF EXISTS "lawyer_profiles_update_own" ON public.lawyer_profiles;
DROP POLICY IF EXISTS "lawyer_profiles_delete_own" ON public.lawyer_profiles;
DROP POLICY IF EXISTS "cases_select_participant_or_admin" ON public.cases;
DROP POLICY IF EXISTS "case_proposals_select_scoped" ON public.case_proposals;
DROP POLICY IF EXISTS "case_messages_select_participants" ON public.case_messages;
DROP POLICY IF EXISTS "case_messages_insert_sender_participant" ON public.case_messages;
DROP POLICY IF EXISTS "case_messages_update_read_own_recipient" ON public.case_messages;
DROP POLICY IF EXISTS "case_documents_select_case_participant" ON public.case_documents;
DROP POLICY IF EXISTS "notifications_select_owner_or_admin" ON public.notifications;
DROP POLICY IF EXISTS "subscriptions_select_owner_or_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "reviews_select_parties_or_admin" ON public.reviews;
DROP POLICY IF EXISTS "case_updates_select_case_participant" ON public.case_updates;
DROP POLICY IF EXISTS "case_predictions_select_owner_or_admin" ON public.case_predictions;
DROP POLICY IF EXISTS "plans_select_catalog" ON public.plans;
DROP POLICY IF EXISTS "ai_usage_select_owner_or_admin" ON public.ai_usage;
DROP POLICY IF EXISTS "refresh_tokens_select_own" ON public.refresh_tokens;

DROP FUNCTION IF EXISTS public.can_access_case(integer);

-- -----------------------------------------------------------------------------
-- 1. Helper functions (SECURITY DEFINER, stable, search_path locked)
--    • Bypass RLS on internal lookups — required to avoid infinite recursion
--      when policies reference `users` or `cases`.
--    • Still keyed off auth.uid() — see header: without Supabase session this
--      stays empty / false.
-- -----------------------------------------------------------------------------

-- Returns true if JWT identity is an admin row in public.users.
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_app_admin IS
  'True when auth.uid() matches a users row with role admin. Requires JWT sub = public.users.id.';

-- Case visibility: citizen, assigned lawyer, preferred lawyer, or any lawyer
-- who has submitted a proposal on the case. Open-market discovery of all
-- pending cases is intentionally NOT granted at DB layer (use Node API).
CREATE OR REPLACE FUNCTION public.can_access_case(p_case_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      public.is_app_admin()
      OR EXISTS (
        SELECT 1
        FROM public.cases c
        WHERE c.id = p_case_id
          AND (
            c.citizen_id = auth.uid()
            OR c.lawyer_id = auth.uid()
            OR c.preferred_lawyer_id = auth.uid()
            OR EXISTS (
              SELECT 1
              FROM public.case_proposals cp
              WHERE cp.case_id = c.id
                AND cp.lawyer_id = auth.uid()
            )
          )
      )
    );
$$;

COMMENT ON FUNCTION public.can_access_case IS
  'Participant / applicant / admin case access for RLS. Does not grant global open-case listing to lawyers.';

-- -----------------------------------------------------------------------------
-- 2. Enable RLS on all application tables
-- -----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_predictions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. USERS
--    Sensitive: password hash. Never query this table from browser clients;
--    prefer API or a future `users_safe` view without password.
--    NO INSERT / UPDATE / DELETE for client roles — backend (service role) only.
-- -----------------------------------------------------------------------------

CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR id = auth.uid()
  );

-- anon: no policy → deny

COMMENT ON POLICY "users_select_own_or_admin" ON public.users IS
  'Owner or admin read. WARNING: includes password hash — do not use from frontend.';

-- No INSERT/UPDATE/DELETE policies → authenticated cannot modify users via PostgREST.

-- -----------------------------------------------------------------------------
-- 4. REFRESH TOKENS
--    Written only by backend. Clients: read own rows only (e.g. debugging);
--    no DML from client.
-- -----------------------------------------------------------------------------

CREATE POLICY "refresh_tokens_select_own"
  ON public.refresh_tokens
  FOR SELECT
  TO authenticated
  USING (public.is_app_admin() OR user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. BLOG POSTS (marketing / content — public read)
-- -----------------------------------------------------------------------------

CREATE POLICY "blog_posts_select_public"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No client writes (service role only).

-- -----------------------------------------------------------------------------
-- 6. LAWYER PROFILES
--    Directory: readable for lawyer-role accounts (public directory pattern).
--    Owner: full row for own profile.
--    Narrow INSERT/UPDATE/DELETE: own row + your users.role = lawyer for insert.
-- -----------------------------------------------------------------------------

CREATE POLICY "lawyer_profiles_select_directory_or_own"
  ON public.lawyer_profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Own profile always
    user_id = auth.uid()
    OR public.is_app_admin()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = lawyer_profiles.user_id
        AND u.role = 'lawyer'
    )
  );

-- For anon, auth.uid() is NULL: only rows tied to lawyer role user accounts are visible.
-- If you want lawyer directory hidden from unauthenticated clients, change TO authenticated only
-- and remove lawyer visibility for anon (use: TO authenticated only + tighten USING).

CREATE POLICY "lawyer_profiles_insert_own_lawyer"
  ON public.lawyer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_app_admin()
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
          AND u.role = 'lawyer'
      )
    )
  );

CREATE POLICY "lawyer_profiles_update_own"
  ON public.lawyer_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_app_admin() OR user_id = auth.uid())
  WITH CHECK (public.is_app_admin() OR user_id = auth.uid());

CREATE POLICY "lawyer_profiles_delete_own"
  ON public.lawyer_profiles
  FOR DELETE
  TO authenticated
  USING (public.is_app_admin() OR user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. CASES
--    Citizen: own cases. Lawyer: assigned, preferred, or applied (proposal).
--    Admin: all. No client INSERT/UPDATE/DELETE (API only).
-- -----------------------------------------------------------------------------

CREATE POLICY "cases_select_participant_or_admin"
  ON public.cases
  FOR SELECT
  TO authenticated
  USING (public.can_access_case(id));

-- -----------------------------------------------------------------------------
-- 8. CASE PROPOSALS
--    Citizen (case owner): all proposals on their cases.
--    Assigned lawyer on case: all proposals on that case.
--    Applying lawyer: own proposal rows (even before assignment).
-- -----------------------------------------------------------------------------

CREATE POLICY "case_proposals_select_scoped"
  ON public.case_proposals
  FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR case_proposals.lawyer_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.cases c
      WHERE c.id = case_proposals.case_id
        AND c.citizen_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.cases c
      WHERE c.id = case_proposals.case_id
        AND c.lawyer_id = auth.uid()
    )
  );

-- Optional future: add INSERT/UPDATE policies mirroring API (lawyer applies, citizen accepts).
-- Omitted by default so writes stay service-role-only.

-- -----------------------------------------------------------------------------
-- 9. CASE MESSAGES (attorney–client sensitive)
--    Read: sender, recipient, both must be able to access the case; admin.
--    Insert: sender = self and case accessible (participant as sender side).
--    Update: only recipient may flip is_read for their incoming messages.
-- -----------------------------------------------------------------------------

CREATE POLICY "case_messages_select_participants"
  ON public.case_messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR (
      public.can_access_case(case_id)
      AND (sender_id = auth.uid() OR recipient_id = auth.uid())
    )
  );

CREATE POLICY "case_messages_insert_sender_participant"
  ON public.case_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_app_admin()
    OR (
      sender_id = auth.uid()
      AND recipient_id IS NOT NULL
      AND recipient_id <> auth.uid()
      AND public.can_access_case(case_id)
    )
  );

-- No UPDATE via client roles: PostgreSQL RLS cannot limit updates to is_read only;
-- allowing UPDATE would let recipients rewrite message body. Mark-read stays on
-- the Node API (service role). No DELETE (retention); service role if required.

-- -----------------------------------------------------------------------------
-- 10. CASE DOCUMENTS
--     Any case participant with can_access_case may read metadata.
--     INSERT/UPDATE/DELETE: service role only (omit policies).
-- -----------------------------------------------------------------------------

CREATE POLICY "case_documents_select_case_participant"
  ON public.case_documents
  FOR SELECT
  TO authenticated
  USING (public.is_app_admin() OR public.can_access_case(case_id));

-- -----------------------------------------------------------------------------
-- 11. NOTIFICATIONS — owner or admin
-- -----------------------------------------------------------------------------

CREATE POLICY "notifications_select_owner_or_admin"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.is_app_admin() OR user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 12. CASE UPDATES — anyone who can see the case
-- -----------------------------------------------------------------------------

CREATE POLICY "case_updates_select_case_participant"
  ON public.case_updates
  FOR SELECT
  TO authenticated
  USING (public.is_app_admin() OR public.can_access_case(case_id));

-- -----------------------------------------------------------------------------
-- 13. REVIEWS — citizen, lawyer on record, admin
-- -----------------------------------------------------------------------------

CREATE POLICY "reviews_select_parties_or_admin"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR citizen_id = auth.uid()
    OR lawyer_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- 14. PLANS — subscription catalog (read-only public)
-- -----------------------------------------------------------------------------

CREATE POLICY "plans_select_catalog"
  ON public.plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 15. SUBSCRIPTIONS — owner or admin
-- -----------------------------------------------------------------------------

CREATE POLICY "subscriptions_select_owner_or_admin"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (public.is_app_admin() OR user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 16. AI USAGE — row owner when user_id set; admin sees all
--     Rows with NULL user_id (anonymous) are admin-only.
-- -----------------------------------------------------------------------------

CREATE POLICY "ai_usage_select_owner_or_admin"
  ON public.ai_usage
  FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR (user_id IS NOT NULL AND user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 17. CASE PREDICTIONS — owner or admin
-- -----------------------------------------------------------------------------

CREATE POLICY "case_predictions_select_owner_or_admin"
  ON public.case_predictions
  FOR SELECT
  TO authenticated
  USING (public.is_app_admin() OR user_id = auth.uid());

-- =============================================================================
-- POLICIES THAT **DO NOT** WORK (OR ARE INEFFECTIVE) WITHOUT SUPABASE JWT
-- =============================================================================
-- • Every policy that references auth.uid() or public.is_app_admin() /
--   public.can_access_case() assumes the database session has a Supabase-
--   verified JWT whose `sub` equals `public.users.id`.
-- • Custom Node JWTs do NOT populate auth.uid() for PostgREST connections.
-- • Anon key without login: auth.uid() IS NULL → safe “deny” on authenticated-
--   only tables; public reads still apply to blog_posts / plans / lawyer
--   directory per policies above.
--
-- OPTIONAL IMPROVEMENTS AFTER SUPABASE AUTH MIGRATION
-- ====================================================
-- 1) On signup: INSERT into auth.users and public.users with SAME uuid PK.
-- 2) Add FK public.users.id → auth.users.id (optional) for integrity.
-- 3) Store app role in auth.users.raw_app_meta_data or a JWT hook so you can
--    write policies using (auth.jwt() ->> 'app_role') = 'admin' without
--    scanning public.users for every request (still combine with EXISTS for cases).
-- 4) Replace password-based app login with Supabase Auth; keep Node API as BFF
--    using service role only server-side.
-- 5) Add column-level protection: expose a VIEW users_without_password for
--    any rare client SELECT need.
-- 6) Storage buckets: mirror these RLS ideas in storage.objects policies.
--
-- FRONTEND COMPATIBILITY NOTE
-- ===========================
-- • Today: no Supabase direct queries → no impact.
-- • Future: use supabase.auth.signIn*, pass session to client; use RLS-safe
--   queries only. Never ship service role key to the browser.
-- =============================================================================
