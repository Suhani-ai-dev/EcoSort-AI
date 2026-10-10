-- =============================================================================
-- 001_initial_schema.sql
-- EcoSort AI — initial database schema
-- Run once against your Supabase project via the SQL editor or CLI.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. scans
--    image_path stores the Storage object path (e.g. "{user_id}/{scan_id}.jpg")
--    NOT a URL — signed URLs are generated on-demand server-side.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scans (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_path            TEXT        NOT NULL,
  category              TEXT        NOT NULL,
  sub_category          TEXT,
  confidence            NUMERIC(5,4),
  carbon_kg             NUMERIC(10,4),
  carbon_source_citation TEXT,
  disposal_guidance     JSONB,       -- stores full GuidanceResponse JSON
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_user_id    ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. points
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.points (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. badges  (read-only reference table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badges (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT    UNIQUE NOT NULL,
  description      TEXT    NOT NULL,
  icon_url         TEXT,
  threshold_points INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- 5. user_badges
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_badges (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id   UUID        NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

-- =============================================================================
-- Row-Level Security
-- =============================================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- scans policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can select own scans"   ON public.scans FOR SELECT   TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans"   ON public.scans FOR INSERT   TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans"   ON public.scans FOR UPDATE   TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans"   ON public.scans FOR DELETE   TO authenticated USING      (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- points policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can select own points"   ON public.points FOR SELECT   TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "Users can insert own points"   ON public.points FOR INSERT   TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points"   ON public.points FOR UPDATE   TO authenticated USING      (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- badges policies  (read-only for all authenticated users)
-- ---------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read badges"
  ON public.badges FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- user_badges policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can select own user_badges"   ON public.user_badges FOR SELECT   TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_badges"   ON public.user_badges FOR INSERT   TO authenticated WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- Trigger: auto-create a points row when a new auth user registers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.points(user_id, total_points)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_points ON auth.users;
CREATE TRIGGER on_auth_user_created_points
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_points();

-- =============================================================================
-- Seed: default badge definitions
-- =============================================================================

INSERT INTO public.badges (name, description, threshold_points) VALUES
  ('Eco Starter',    'Awarded for reaching 50 points',    50),
  ('Green Guardian', 'Awarded for reaching 200 points',  200),
  ('Waste Warrior',  'Awarded for reaching 500 points',  500),
  ('Planet Hero',    'Awarded for reaching 1000 points', 1000)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- Privileges & Grants: ensure service_role, authenticated, and anon have access
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
