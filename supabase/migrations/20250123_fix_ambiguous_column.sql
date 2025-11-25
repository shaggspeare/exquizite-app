-- Fix the ambiguous column reference in get_or_create_share function
-- This fixes the error: column reference "share_code" is ambiguous

DROP FUNCTION IF EXISTS get_or_create_share(UUID, UUID, BOOLEAN, INTEGER);

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
  SELECT
    ss.id,
    ss.share_code,
    ss.created_at
  INTO v_existing_share
  FROM shared_sets ss
  WHERE ss.set_id = p_set_id
    AND ss.created_by = p_user_id
    AND ss.is_active = true
    AND (ss.expires_at IS NULL OR ss.expires_at > NOW())
  LIMIT 1;

  IF FOUND THEN
    -- Return existing share
    RETURN QUERY
    SELECT
      v_existing_share.id::UUID,
      v_existing_share.share_code::TEXT,
      ('exquizite://shared/' || v_existing_share.share_code)::TEXT,
      false::BOOLEAN;
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
      EXIT WHEN NOT EXISTS (SELECT 1 FROM shared_sets WHERE shared_sets.share_code = v_share_code);
    END LOOP;

    -- Insert new share
    INSERT INTO shared_sets (set_id, share_code, is_public, created_by, expires_at)
    VALUES (p_set_id, v_share_code, p_is_public, p_user_id, v_expires_at)
    RETURNING id INTO v_share_id;

    RETURN QUERY
    SELECT
      v_share_id::UUID,
      v_share_code::TEXT,
      ('exquizite://shared/' || v_share_code)::TEXT,
      v_is_new::BOOLEAN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO service_role;
