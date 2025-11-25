-- Migration: Add Sharing Feature
-- Created: 2025-01-23
-- Description: Adds tables and policies for set sharing functionality

-- ============================================================================
-- 1. CREATE NEW TABLES
-- ============================================================================

-- Table: shared_sets
-- Stores information about shared sets and their share codes
CREATE TABLE IF NOT EXISTS shared_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE CASCADE,
  share_code VARCHAR(12) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Table: set_copies
-- Tracks when users save copies of shared sets
CREATE TABLE IF NOT EXISTS set_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_set_id UUID REFERENCES word_sets(id) ON DELETE SET NULL,
  copied_set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE CASCADE,
  copied_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shared_via_code VARCHAR(12),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. ADD COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add sharing-related columns to word_sets table
ALTER TABLE word_sets
  ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS original_author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_copy BOOLEAN DEFAULT false;

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shared_sets_share_code ON shared_sets(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_sets_set_id ON shared_sets(set_id);
CREATE INDEX IF NOT EXISTS idx_shared_sets_created_by ON shared_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_shared_sets_active ON shared_sets(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_set_copies_copied_by ON set_copies(copied_by);
CREATE INDEX IF NOT EXISTS idx_set_copies_original_set ON set_copies(original_set_id);
CREATE INDEX IF NOT EXISTS idx_set_copies_share_code ON set_copies(shared_via_code);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE shared_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_copies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR shared_sets
-- ============================================================================

-- Policy: Anyone can read active public shares
CREATE POLICY "Anyone can read active public shares"
  ON shared_sets FOR SELECT
  USING (
    is_active = true
    AND is_public = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Policy: Users can create shares for their own sets
CREATE POLICY "Users can create shares for own sets"
  ON shared_sets FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    set_id IN (SELECT id FROM word_sets WHERE user_id = auth.uid())
  );

-- Policy: Users can update their own shares
CREATE POLICY "Users can update own shares"
  ON shared_sets FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can delete their own shares
CREATE POLICY "Users can delete own shares"
  ON shared_sets FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR set_copies
-- ============================================================================

-- Policy: Users can read their own copy records
CREATE POLICY "Users can read own copy records"
  ON set_copies FOR SELECT
  USING (copied_by = auth.uid());

-- Policy: Users can create copy records
CREATE POLICY "Users can create copy records"
  ON set_copies FOR INSERT
  WITH CHECK (copied_by = auth.uid());

-- ============================================================================
-- 7. UPDATE EXISTING word_sets RLS POLICIES
-- ============================================================================

-- Drop existing select policy if it exists (we'll recreate it with sharing support)
DROP POLICY IF EXISTS "Users can read own sets" ON word_sets;

-- Policy: Users can read their own sets OR sets that are shared
CREATE POLICY "Users can read own or shared sets"
  ON word_sets FOR SELECT
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT set_id FROM shared_sets
      WHERE is_active = true
      AND is_public = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: Generate random share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Get or create share for a set
CREATE OR REPLACE FUNCTION get_or_create_share(
  p_set_id UUID,
  p_user_id UUID,
  p_is_public BOOLEAN DEFAULT true,
  p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS TABLE (
  share_id UUID,
  share_code TEXT,
  share_url TEXT,
  is_new BOOLEAN
) AS $$
DECLARE
  v_share_code TEXT;
  v_share_id UUID;
  v_existing_share RECORD;
  v_is_new BOOLEAN := false;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user owns the set
  IF NOT EXISTS (SELECT 1 FROM word_sets WHERE id = p_set_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'User does not own this set';
  END IF;

  -- Check for existing active share
  SELECT * INTO v_existing_share
  FROM shared_sets
  WHERE set_id = p_set_id
    AND created_by = p_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF FOUND THEN
    -- Return existing share
    RETURN QUERY
    SELECT
      v_existing_share.id,
      v_existing_share.share_code,
      'exquizite://shared/' || v_existing_share.share_code,
      false;
  ELSE
    -- Create new share
    v_is_new := true;

    -- Calculate expiration if specified
    IF p_expires_in_days IS NOT NULL THEN
      v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
    END IF;

    -- Generate unique share code
    LOOP
      v_share_code := generate_share_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM shared_sets WHERE share_code = v_share_code);
    END LOOP;

    -- Insert new share
    INSERT INTO shared_sets (set_id, share_code, is_public, created_by, expires_at)
    VALUES (p_set_id, v_share_code, p_is_public, p_user_id, v_expires_at)
    RETURNING id INTO v_share_id;

    RETURN QUERY
    SELECT
      v_share_id,
      v_share_code,
      'exquizite://shared/' || v_share_code,
      v_is_new;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment view count
CREATE OR REPLACE FUNCTION increment_share_view_count(p_share_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE shared_sets
  SET view_count = view_count + 1
  WHERE share_code = p_share_code
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment copy count
CREATE OR REPLACE FUNCTION increment_share_copy_count(p_share_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE shared_sets
  SET copy_count = copy_count + 1
  WHERE share_code = p_share_code
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. CREATE VIEW FOR SHARED SETS WITH METADATA
-- ============================================================================

CREATE OR REPLACE VIEW shared_sets_with_details AS
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
  (SELECT COUNT(*) FROM word_pairs WHERE set_id = ws.id) as word_count
FROM shared_sets ss
JOIN word_sets ws ON ss.set_id = ws.id
LEFT JOIN profiles p ON ss.created_by = p.id;

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON shared_sets TO authenticated;
GRANT INSERT ON shared_sets TO authenticated;
GRANT UPDATE ON shared_sets TO authenticated;
GRANT DELETE ON shared_sets TO authenticated;

GRANT SELECT ON set_copies TO authenticated;
GRANT INSERT ON set_copies TO authenticated;

GRANT SELECT ON shared_sets_with_details TO authenticated;

-- Grant access to anonymous users (for public shares)
GRANT SELECT ON shared_sets TO anon;
GRANT SELECT ON shared_sets_with_details TO anon;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add comment to track migration
COMMENT ON TABLE shared_sets IS 'Stores shareable links for word sets';
COMMENT ON TABLE set_copies IS 'Tracks when users copy shared sets';
