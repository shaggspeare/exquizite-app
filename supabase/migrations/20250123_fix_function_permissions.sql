-- Fix permissions for sharing functions
-- Run this if you're getting 500 errors from the edge functions

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION generate_share_code() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_share_code() TO anon;

GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO anon;

GRANT EXECUTE ON FUNCTION increment_share_view_count(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_share_view_count(TEXT) TO anon;

GRANT EXECUTE ON FUNCTION increment_share_copy_count(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_share_copy_count(TEXT) TO anon;

-- Also ensure the service role can execute
GRANT EXECUTE ON FUNCTION generate_share_code() TO service_role;
GRANT EXECUTE ON FUNCTION get_or_create_share(UUID, UUID, BOOLEAN, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION increment_share_view_count(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION increment_share_copy_count(TEXT) TO service_role;

-- Verify the language columns exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'word_sets'
        AND column_name = 'target_language'
    ) THEN
        ALTER TABLE word_sets ADD COLUMN target_language VARCHAR(10) DEFAULT 'uk';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'word_sets'
        AND column_name = 'native_language'
    ) THEN
        ALTER TABLE word_sets ADD COLUMN native_language VARCHAR(10) DEFAULT 'en';
    END IF;
END $$;

-- Test the function (replace the UUIDs with real ones from your database)
-- SELECT * FROM get_or_create_share(
--   'your-set-id-here'::UUID,
--   'your-user-id-here'::UUID,
--   true,
--   NULL
-- );
