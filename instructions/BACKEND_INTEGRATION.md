# Backend Integration with Supabase

The Exquizite app now uses Supabase for authentication and data persistence.

## Setup Complete

✅ Supabase SDK installed
✅ Environment variables configured
✅ Database schema created
✅ Authentication integrated
✅ Data persistence implemented

## Quick Start

### 1. Set Up Database (IMPORTANT - DO THIS FIRST!)

1. Go to your Supabase Dashboard: https://wenqlegazqvsmnchippx.supabase.co
2. Navigate to **SQL Editor**
3. Open the file `supabase-schema.sql` in this project
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** to create all tables and security policies

### 2. Test the App

```bash
npm start
```

Then:

1. Sign in as a guest
2. Create a word set
3. Check Supabase dashboard **Table Editor** to see your data!

## What Changed

### Authentication (AuthContext)

- **Before**: Mock users stored in SecureStore
- **Now**: Real Supabase authentication
  - Guest users via `signInAnonymously()`
  - Google OAuth ready (needs Google Cloud setup)
  - Automatic profile creation via database trigger

### Data Storage (SetsContext)

- **Before**: Local state (lost on app restart)
- **Now**: Supabase PostgreSQL database
  - Real-time sync with database
  - Multi-device support
  - Row Level Security (RLS) for data protection
  - Automatic loading on user login

### Database Structure

**Tables:**

- `profiles` - User information
- `word_sets` - Word sets created by users
- `word_pairs` - Individual words in each set

**Security:**

- Row Level Security (RLS) enabled
- Users can only see/modify their own data
- Cascading deletes (deleting a set deletes all its words)

## Features

### Working Now ✅

- Guest authentication
- Create word sets → Saved to database
- Edit word sets → Updates database
- Delete word sets → Removes from database
- Play games → Updates last practiced timestamp
- Multi-device sync (same account, multiple devices)
- Offline support (data cached locally)

### Ready to Enable 🔧

- Google Sign-in (requires Google OAuth setup)
- Email/Password authentication
- Profile picture upload
- Social sharing

## Google OAuth Setup (Optional)

To enable Google Sign-in:

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create new project
   - Enable Google+ API

2. **Create OAuth Credentials:**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - For iOS: Bundle ID from `app.json`
   - For Android: Package name + SHA-1 certificate
   - For Web: Add authorized redirect URI

3. **Configure Supabase:**
   - Supabase Dashboard → **Authentication** → **Providers**
   - Enable Google
   - Add Client ID and Client Secret
   - Add redirect URL: `https://wenqlegazqvsmnchippx.supabase.co/auth/v1/callback`

4. **Update App:**
   - Edit `contexts/AuthContext.tsx`
   - Replace `YOUR_*_CLIENT_ID` with actual IDs

## API Reference

### Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://wenqlegazqvsmnchippx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### Supabase Client

```typescript
import { supabase } from '@/lib/supabase';

// Authentication
await supabase.auth.signInAnonymously();
await supabase.auth.signOut();

// Database queries
const { data } = await supabase
  .from('word_sets')
  .select('*')
  .eq('user_id', userId);
```

## Troubleshooting

### Issue: "Tables not found"

**Solution:** Run the SQL schema in Supabase SQL Editor

### Issue: "Can't insert data"

**Solution:** Check that RLS policies are created (part of schema)

### Issue: "Not authenticated"

**Solution:** Make sure you're signed in (check auth state)

### Issue: Data not syncing

**Solution:**

- Check internet connection
- Check Supabase dashboard for errors
- Look at app console logs

### Issue: Google OAuth not working

**Solution:**

- Verify Client IDs in AuthContext
- Check redirect URLs match exactly
- Enable Google+ API in Google Cloud

## Production Checklist

Before deploying to production:

- [ ] Run database schema in production Supabase
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Set up proper OAuth redirect URLs
- [ ] Configure custom SMTP for emails
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and tighten RLS policies
- [ ] Test multi-device sync
- [ ] Add rate limiting
- [ ] Set up error tracking (Sentry, etc.)

## Cost Estimation

Supabase Free Tier includes:

- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

Expected usage:

- Average user: ~5 word sets × 20 words = 100 rows
- 1000 users = ~100,000 rows (well within free tier)
- Database size: ~10 MB for 1000 active users

## Security Notes

1. **Row Level Security (RLS)** - Enabled on all tables
2. **Anon key** - Safe to expose in client (limited permissions)
3. **Service role key** - NEVER expose (full database access)
4. **User data** - Isolated per user via RLS policies
5. **API limits** - Automatic rate limiting by Supabase

## Support

For issues:

- Check Supabase Dashboard logs
- Review database policies
- Check app console for errors
- See `SUPABASE_SETUP.md` for detailed setup instructions
