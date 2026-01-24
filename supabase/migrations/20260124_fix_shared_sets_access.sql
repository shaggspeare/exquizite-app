-- Migration: Fix Shared Sets Access
-- Created: 2026-01-24
-- Description: Fixes RLS policies to allow proper access to shared sets
-- Issue: Users cannot view other users' shared sets due to missing RLS policies

-- ============================================================================
-- 1. FIX PROFILES ACCESS FOR SHARED SETS
-- ============================================================================

-- Allow reading basic profile info (name) for users who have shared sets
-- This is needed so viewers can see the author's name on shared sets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Anyone can read names of users with shared sets'
  ) THEN
    CREATE POLICY "Anyone can read names of users with shared sets"
      ON public.profiles FOR SELECT
      USING (
        id IN (
          SELECT created_by FROM shared_sets
          WHERE is_active = true
          AND is_public = true
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 2. FIX WORD_PAIRS ACCESS FOR SHARED SETS
-- ============================================================================

-- Allow reading word pairs from sets that are publicly shared
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'word_pairs'
    AND policyname = 'Anyone can read word pairs from shared sets'
  ) THEN
    CREATE POLICY "Anyone can read word pairs from shared sets"
      ON public.word_pairs FOR SELECT
      USING (
        set_id IN (
          SELECT set_id FROM shared_sets
          WHERE is_active = true
          AND is_public = true
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 3. RECREATE VIEW WITH PROPER SECURITY
-- ============================================================================

-- Drop and recreate the view to ensure proper permissions
DROP VIEW IF EXISTS shared_sets_with_details;

CREATE VIEW shared_sets_with_details AS
SELECT
  ss.id,
  ss.share_code,
  ss.is_public,
  ss.created_by,
  ss.view_count,
  ss.copy_count,
  ss.created_at,
  ss.expires_at,
  ss.is_active,
  ws.id as set_id,
  ws.name as set_name,
  ws.target_language,
  ws.native_language,
  ws.created_at as set_created_at,
  p.name as creator_name,
  (SELECT COUNT(*) FROM word_pairs wp WHERE wp.set_id = ws.id) as word_count
FROM shared_sets ss
JOIN word_sets ws ON ss.set_id = ws.id
LEFT JOIN profiles p ON ss.created_by = p.id;

-- Grant access to the view
GRANT SELECT ON shared_sets_with_details TO authenticated;
GRANT SELECT ON shared_sets_with_details TO anon;
GRANT SELECT ON shared_sets_with_details TO service_role;

-- ============================================================================
-- 4. ENSURE ANONYMOUS ACCESS FOR SHARED SETS
-- ============================================================================

-- Shared sets table - ensure anon can read active public shares
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'shared_sets'
    AND policyname = 'Anon can read active public shares'
  ) THEN
    CREATE POLICY "Anon can read active public shares"
      ON shared_sets FOR SELECT
      TO anon
      USING (
        is_active = true
        AND is_public = true
        AND (expires_at IS NULL OR expires_at > NOW())
      );
  END IF;
END $$;

-- Word sets - allow anon to read shared sets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'word_sets'
    AND policyname = 'Anon can read shared sets'
  ) THEN
    CREATE POLICY "Anon can read shared sets"
      ON word_sets FOR SELECT
      TO anon
      USING (
        id IN (
          SELECT set_id FROM shared_sets
          WHERE is_active = true
          AND is_public = true
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      );
  END IF;
END $$;

-- Word pairs - allow anon to read word pairs from shared sets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'word_pairs'
    AND policyname = 'Anon can read word pairs from shared sets'
  ) THEN
    CREATE POLICY "Anon can read word pairs from shared sets"
      ON word_pairs FOR SELECT
      TO anon
      USING (
        set_id IN (
          SELECT set_id FROM shared_sets
          WHERE is_active = true
          AND is_public = true
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      );
  END IF;
END $$;

-- Profiles - allow anon to read names of users with shared sets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Anon can read names of users with shared sets'
  ) THEN
    CREATE POLICY "Anon can read names of users with shared sets"
      ON profiles FOR SELECT
      TO anon
      USING (
        id IN (
          SELECT created_by FROM shared_sets
          WHERE is_active = true
          AND is_public = true
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 5. GRANT PERMISSIONS TO SERVICE ROLE
-- ============================================================================

-- Ensure service role has full access (should be default, but explicit is better)
GRANT ALL ON shared_sets TO service_role;
GRANT ALL ON set_copies TO service_role;
GRANT SELECT ON word_sets TO service_role;
GRANT SELECT ON word_pairs TO service_role;
GRANT SELECT ON profiles TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
