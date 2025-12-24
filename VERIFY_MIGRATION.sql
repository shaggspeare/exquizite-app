-- Run this query in Supabase SQL Editor to verify the migration was applied correctly

-- Check if the get_or_create_share function contains the new URL
SELECT
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'get_or_create_share';

-- Expected: The function_body should contain 'https://app.exquizite.app/shared/'
-- If you see this URL in the output, the migration was successful!
