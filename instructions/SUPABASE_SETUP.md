# Supabase Setup Guide

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://wenqlegazqvsmnchippx.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase-schema.sql` and paste it into the editor
5. Click **Run** to execute the SQL

This will create:

- `profiles` table - User profiles
- `word_sets` table - Word sets created by users
- `word_pairs` table - Individual word-translation pairs
- Row Level Security (RLS) policies for data protection
- Indexes for performance
- Triggers for automatic timestamps

## Step 2: Enable Google OAuth (Optional)

If you want Google Sign-in:

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Enable **Google** provider
3. Follow Supabase's guide to set up Google OAuth:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://wenqlegazqvsmnchippx.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

## Step 3: Configure Auth Settings

1. Go to **Authentication** > **Settings**
2. Under **Auth Providers**, make sure:
   - Email is enabled
   - Confirm email is disabled (for faster testing, enable in production)
3. Under **URL Configuration**:
   - Site URL: `exp://localhost:8081` (for development)
   - Redirect URLs: Add `exp://localhost:8081/**` and your production URL

## Database Schema Overview

### Tables

**profiles**

- `id` - UUID (references auth.users)
- `email` - User's email
- `name` - Display name
- `is_guest` - Boolean flag for guest users
- `avatar_url` - Profile picture URL
- `created_at`, `updated_at` - Timestamps

**word_sets**

- `id` - UUID
- `user_id` - References profiles
- `name` - Set name
- `created_at`, `updated_at` - Timestamps
- `last_practiced` - Last practice date

**word_pairs**

- `id` - UUID
- `set_id` - References word_sets
- `word` - English word
- `translation` - Translation
- `position` - Order in set
- `created_at` - Timestamp

### Security

All tables have Row Level Security (RLS) enabled:

- Users can only see/modify their own data
- Cascading deletes ensure data integrity
- Automatic profile creation on signup

## Step 4: Test the Connection

After running the schema:

1. Start your Expo app: `npm start`
2. Try signing up as a guest
3. Create a word set
4. Check the Supabase **Table Editor** to verify data is being saved

## Troubleshooting

**Issue: Can't insert data**

- Check RLS policies in **Authentication** > **Policies**
- Verify you're authenticated (check `auth.users` table)

**Issue: Tables not created**

- Make sure UUID extension is enabled
- Check SQL Editor for error messages
- Run queries one section at a time

**Issue: Google OAuth not working**

- Verify redirect URLs match exactly
- Check Google Cloud Console credentials
- Enable Google+ API in Google Cloud

## Production Checklist

- [ ] Enable email confirmation
- [ ] Set up custom SMTP settings
- [ ] Configure proper redirect URLs
- [ ] Set up database backups
- [ ] Review and tighten RLS policies
- [ ] Enable MFA for admin accounts
- [ ] Set up monitoring and alerts
