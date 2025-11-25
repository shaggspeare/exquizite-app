-- Completely rebuild the get_or_create_share function with no ambiguous references
-- Drop all versions of the function first
DROP FUNCTION IF EXISTS get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) CASCADE;

-- Create fresh function with completely unambiguous variable names
CREATE FUNCTION get_or_create_share(
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_share_code TEXT;
  result_share_id UUID;
  result_is_new BOOLEAN := false;
  calculated_expires_at TIMESTAMP WITH TIME ZONE;
  existing_id UUID;
  existing_code TEXT;
BEGIN
  -- Check if user owns the set
  IF NOT EXISTS (SELECT 1 FROM word_sets ws WHERE ws.id = p_set_id AND ws.user_id = p_user_id) THEN
    RAISE EXCEPTION 'User does not own this set';
  END IF;

  -- Check for existing active share
  SELECT
    s.id,
    s.share_code
  INTO
    existing_id,
    existing_code
  FROM shared_sets s
  WHERE s.set_id = p_set_id
    AND s.created_by = p_user_id
    AND s.is_active = true
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Return existing share
    share_id := existing_id;
    share_code := existing_code;
    share_url := 'exquizite://shared/' || existing_code;
    is_new := false;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Create new share
  result_is_new := true;

  -- Calculate expiration if specified
  IF p_expires_in_days IS NOT NULL THEN
    calculated_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  END IF;

  -- Generate unique share code
  LOOP
    result_share_code := generate_share_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM shared_sets s WHERE s.share_code = result_share_code
    );
  END LOOP;

  -- Insert new share
  INSERT INTO shared_sets (set_id, share_code, is_public, created_by, expires_at)
  VALUES (p_set_id, result_share_code, p_is_public, p_user_id, calculated_expires_at)
  RETURNING id INTO result_share_id;

  -- Return new share
  share_id := result_share_id;
  share_code := result_share_code;
  share_url := 'exquizite://shared/' || result_share_code;
  is_new := result_is_new;
  RETURN NEXT;
  RETURN;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO service_role;

-- Test the function (optional - comment out if you don't have test data)
-- SELECT * FROM get_or_create_share(
--   'your-set-id'::UUID,
--   'your-user-id'::UUID,
--   true,
--   NULL
-- );
