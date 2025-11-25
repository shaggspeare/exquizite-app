-- Migration: Add Language Columns to word_sets
-- Created: 2025-01-23
-- Description: Adds target_language and native_language columns to word_sets table
-- NOTE: Run this AFTER the main sharing feature migration

-- Add language columns to word_sets
ALTER TABLE word_sets
  ADD COLUMN IF NOT EXISTS target_language VARCHAR(10) DEFAULT 'uk',
  ADD COLUMN IF NOT EXISTS native_language VARCHAR(10) DEFAULT 'en';

-- Create index for faster language-based queries
CREATE INDEX IF NOT EXISTS idx_word_sets_languages
  ON word_sets(target_language, native_language);

-- Update database types to reflect new columns
COMMENT ON COLUMN word_sets.target_language IS 'Language code for the words being learned (e.g., uk, es, fr)';
COMMENT ON COLUMN word_sets.native_language IS 'Language code for the translations (e.g., en)';

-- Update the shared_sets_with_details view to include language info
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
  (SELECT COUNT(*) FROM word_pairs WHERE set_id = ws.id) as word_count
FROM shared_sets ss
JOIN word_sets ws ON ss.set_id = ws.id
LEFT JOIN profiles p ON ss.created_by = p.id;

-- Grant permissions
GRANT SELECT ON shared_sets_with_details TO authenticated;
GRANT SELECT ON shared_sets_with_details TO anon;
