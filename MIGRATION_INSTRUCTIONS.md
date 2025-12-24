# Fix Sharing Feature - Migration Required

## Problem

After changing the web URL to `https://app.exquizite.app/`, the sharing feature is failing with the error:
**"Failed to generate share link. Please try again."**

## Root Cause

The database migration file `supabase/migrations/20251223_update_share_url.sql` was created but **not yet applied** to your remote Supabase database. This migration updates the `get_or_create_share` function to generate share URLs using the new domain.

## Solution - Apply the Migration

You need to run this migration on your Supabase database. Here are 3 ways to do it:

### Option 1: Using Supabase CLI (Recommended)

1. **Link your project (if not already linked):**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   Get your project ref from: https://supabase.com/dashboard/project/_/settings/general

2. **Push the migration:**
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard SQL Editor (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy the ENTIRE contents of the file:
   ```
   supabase/migrations/20251223_update_share_url.sql
   ```
6. Paste it into the SQL editor
7. Click **"Run"** or press `Cmd/Ctrl + Enter`

### Option 3: Using psql (Advanced)

If you have psql installed and your database connection string:

```bash
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_REF].supabase.co:5432/postgres" < supabase/migrations/20251223_update_share_url.sql
```

## Verify the Fix

After applying the migration:

1. **Test the sharing feature:**
   - Open your app
   - Try to share a word set
   - You should now see the share link generated successfully
   - The share URL should be: `https://app.exquizite.app/shared/[SHARE_CODE]`

2. **Check the database function:**
   In Supabase SQL Editor, run:
   ```sql
   SELECT prosrc
   FROM pg_proc
   WHERE proname = 'get_or_create_share';
   ```

   The function should contain: `'https://app.exquizite.app/shared/'`

## What This Migration Does

The migration updates the `get_or_create_share` PostgreSQL function to:
- Generate share URLs using `https://app.exquizite.app/shared/` instead of the old URL
- Return the correct URL format for both new and existing shares

**Before:** `exquiziteapp://shared/CODE` or old domain
**After:** `https://app.exquizite.app/shared/CODE`

## Need Help?

If you encounter any errors while running the migration:
1. Check that you have the correct database permissions
2. Verify you're connected to the right Supabase project
3. Look for any error messages in the SQL editor output
4. The migration is safe to run multiple times (it uses `CREATE OR REPLACE FUNCTION`)
