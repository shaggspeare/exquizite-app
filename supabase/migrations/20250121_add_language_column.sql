-- Add language columns to word_sets table
ALTER TABLE word_sets
    ADD COLUMN IF NOT EXISTS target_language TEXT DEFAULT 'es',
    ADD COLUMN IF NOT EXISTS native_language TEXT DEFAULT 'en';

-- Update existing sets to have default language values
UPDATE word_sets
SET target_language = 'es', native_language = 'en'
WHERE target_language IS NULL OR native_language IS NULL;

-- Make columns non-nullable after setting defaults
ALTER TABLE word_sets
    ALTER COLUMN target_language SET NOT NULL,
ALTER COLUMN native_language SET NOT NULL;
