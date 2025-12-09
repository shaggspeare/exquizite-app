# Sharing Feature - Deployment Guide

## What Was Created

### 1. Database Migration Script

**File:** `supabase/migrations/20250123_add_sharing_feature.sql`

This SQL script includes:

- **New Tables:**
  - `shared_sets` - Stores share codes and metadata for shared sets
  - `set_copies` - Tracks when users copy shared sets

- **Updated Tables:**
  - `word_sets` - Added columns: `is_shareable`, `original_author_id`, `is_copy`

- **Helper Functions:**
  - `generate_share_code()` - Generates unique 12-character share codes
  - `get_or_create_share()` - Creates or retrieves existing share for a set
  - `increment_share_view_count()` - Increments view counter when set is accessed
  - `increment_share_copy_count()` - Increments copy counter when set is copied

- **Row Level Security (RLS) Policies:**
  - Public read access for active shares
  - Users can only create shares for their own sets
  - Users can manage their own shares

- **Views:**
  - `shared_sets_with_details` - Combines share and set metadata

### 2. Supabase Edge Functions

Three serverless functions for handling sharing operations:

**a. `generate-share-link`** (`supabase/functions/generate-share-link/index.ts`)

- Generates unique share codes
- Creates shareable links
- Returns share metadata

**b. `get-shared-set`** (`supabase/functions/get-shared-set/index.ts`)

- Retrieves shared sets by code
- Increments view count
- Returns set details with word pairs
- Works for anonymous users (no auth required)

**c. `copy-shared-set`** (`supabase/functions/copy-shared-set/index.ts`)

- Creates a copy of shared set for authenticated user
- Increments copy count
- Records copy in `set_copies` table

### 3. TypeScript Type Definitions

**Files Updated:**

- `lib/types.ts` - Added sharing-related interfaces
- `lib/supabase.ts` - Updated database type definitions

## Deployment Steps

### Step 1: Run Database Migration

1. Open your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250123_add_sharing_feature.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify success - you should see "Success. No rows returned" or similar

**Verify Migration:**

```sql
-- Run these queries in SQL Editor to verify tables were created
SELECT * FROM shared_sets LIMIT 1;
SELECT * FROM set_copies LIMIT 1;

-- Check if new columns exist on word_sets
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'word_sets'
  AND column_name IN ('is_shareable', 'original_author_id', 'is_copy');
```

### Step 2: Deploy Edge Functions

You have two options for deploying edge functions:

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):

```bash
npm install -g supabase
```

2. **Login to Supabase:**

```bash
supabase login
```

3. **Link your project:**

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

_Find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`_

4. **Deploy all functions:**

```bash
supabase functions deploy generate-share-link
supabase functions deploy get-shared-set
supabase functions deploy copy-shared-set
```

5. **Verify deployment:**

```bash
supabase functions list
```

#### Option B: Manual Deployment via Dashboard

1. Navigate to **Edge Functions** in your Supabase dashboard
2. Click **Create a new function**
3. Name it `generate-share-link`
4. Copy the contents of `supabase/functions/generate-share-link/index.ts`
5. Paste into the editor and deploy
6. Repeat for `get-shared-set` and `copy-shared-set`

### Step 3: Test the Functions

#### Test 1: Generate Share Link

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-share-link' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"setId": "YOUR_SET_ID"}'
```

Expected response:

```json
{
  "shareId": "uuid...",
  "shareCode": "AbC123XyZ789",
  "shareUrl": "exquizite://shared/AbC123XyZ789",
  "isNew": true,
  "viewCount": 0,
  "copyCount": 0,
  "createdAt": "2025-01-23T...",
  "expiresAt": null
}
```

#### Test 2: Get Shared Set

```bash
curl -X GET \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-shared-set?shareCode=AbC123XyZ789' \
  -H 'apikey: YOUR_ANON_KEY'
```

#### Test 3: Copy Shared Set

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/copy-shared-set' \
  -H 'Authorization: Bearer USER_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"shareCode": "AbC123XyZ789"}'
```

### Step 4: Environment Variables (Optional)

If you need to configure custom URLs or settings:

1. Go to **Edge Functions** > **Settings**
2. Add environment variables if needed:
   - `SHARE_URL_PREFIX` - Custom URL prefix (default: `exquizite://shared/`)

## Important Notes

### Note 1: Missing Language Columns

The current `word_sets` table in your database doesn't have `target_language` and `native_language` columns (they exist in the app's WordSet type but not in the database schema).

**You need to add these columns:**

```sql
ALTER TABLE word_sets
  ADD COLUMN IF NOT EXISTS target_language VARCHAR(10) DEFAULT 'uk',
  ADD COLUMN IF NOT EXISTS native_language VARCHAR(10) DEFAULT 'en';

-- Update the view to include these columns
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
```

Run this SQL in your Supabase SQL Editor **after** running the main migration.

### Note 2: RLS Policy Conflict

If you get an error about an existing policy named `"Users can read own sets"`, it means you already have this policy. The migration script handles this with `DROP POLICY IF EXISTS`.

If it still fails, manually drop the old policy:

```sql
DROP POLICY IF EXISTS "Users can read own sets" ON word_sets;
```

Then re-run the migration.

### Note 3: Function Invocation from App

Once deployed, you'll call these functions from your app like this:

```typescript
import { supabase } from '@/lib/supabase';

// Generate share link
const { data, error } = await supabase.functions.invoke('generate-share-link', {
  body: { setId: 'set-uuid-here' },
});

// Get shared set
const { data, error } = await supabase.functions.invoke('get-shared-set', {
  body: { shareCode: 'AbC123XyZ789' },
});

// Copy shared set
const { data, error } = await supabase.functions.invoke('copy-shared-set', {
  body: { shareCode: 'AbC123XyZ789' },
});
```

## Verification Checklist

- [ ] Migration ran successfully in SQL Editor
- [ ] New tables `shared_sets` and `set_copies` exist
- [ ] New columns on `word_sets` table exist
- [ ] All three edge functions are deployed
- [ ] Test call to `generate-share-link` succeeds
- [ ] Test call to `get-shared-set` succeeds
- [ ] Test call to `copy-shared-set` succeeds
- [ ] Language columns added to `word_sets` table

## Troubleshooting

### Error: "User does not own this set"

- Make sure you're passing a valid `setId` that belongs to the authenticated user
- Check that the user is properly authenticated (valid JWT token)

### Error: "Share not found or inactive"

- Verify the share code is correct
- Check if share has expired (run: `SELECT * FROM shared_sets WHERE share_code = 'CODE';`)
- Ensure `is_active = true`

### Error: "Failed to fetch word pairs"

- Check that word_pairs exist for the set: `SELECT * FROM word_pairs WHERE set_id = 'SET_UUID';`
- Verify RLS policies allow reading word_pairs

### Edge Function Not Found

- Run `supabase functions list` to see deployed functions
- Redeploy: `supabase functions deploy FUNCTION_NAME`
- Check function logs: `supabase functions logs FUNCTION_NAME`

## Next Steps

After successful deployment, you can proceed with:

1. Creating the SetsContext methods for sharing
2. Building UI components (ShareModal, shared set preview)
3. Implementing deep linking
4. Adding share buttons to existing screens

See `SHARING_FEATURE_PLAN.md` for the full frontend implementation roadmap.

## Support

If you encounter issues:

- Check Supabase logs in Dashboard > Database > Logs
- Check Edge Function logs in Dashboard > Edge Functions > Logs
- Review RLS policies in Dashboard > Authentication > Policies
- Verify table structure in Dashboard > Database > Tables

---

**Deployment Date:** 2025-01-23
**Version:** 1.0
