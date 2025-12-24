# Testing Sharing Feature with Detailed Logs

I've added comprehensive logging to help debug the sharing feature issue. Here's what to do:

## Step 1: Deploy the Updated Edge Function

The edge function needs to be redeployed with the new logging. Run:

```bash
supabase functions deploy generate-share-link
```

If you need to link your project first:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 2: Test the Sharing Feature

1. **Open your app** (locally or on web)
2. **Open the browser console** (F12 or Cmd+Option+I)
3. **Try to share a word set**
4. **Watch the console** - you'll see color-coded logs:
   - 🟡 Yellow = ShareModal logs
   - 🔵 Blue = SetsContext logs
   - 🟢 Green = Edge Function logs (in Supabase logs)
   - 🔴 Red = Errors

## Step 3: Check the Logs

### Frontend Logs (Browser Console)

You should see logs in this order:

```
🟡 [ShareModal] Starting share link generation
🟡 [ShareModal] Set ID: xxx
🟡 [ShareModal] Set name: xxx
🟡 [ShareModal] Calling shareSet...
🔵 [shareSet] Starting share process for setId: xxx
🔵 [shareSet] Options: undefined
🔵 [shareSet] User ID: xxx
🔵 [shareSet] Set to share: xxx
🔵 [shareSet] Calling Supabase function: generate-share-link
🔵 [shareSet] Waiting for response...
🔵 [shareSet] Response received
🔵 [shareSet] Data: {...}
🔵 [shareSet] Error: null
✅ [shareSet] Share link generated successfully: {...}
🟡 [ShareModal] shareSet returned: {...}
✅ [ShareModal] Share link generated successfully
✅ [ShareModal] Share URL: https://app.exquizite.app/shared/...
```

### Backend Logs (Supabase Dashboard)

To see edge function logs:

1. Go to **Supabase Dashboard** → Your Project
2. Go to **Edge Functions** in the left sidebar
3. Click on **generate-share-link**
4. Click on **Logs** tab
5. Trigger the share action in your app
6. You should see:

```
🟢 [Edge Function] generate-share-link called
🟢 [Edge Function] Method: POST
🟢 [Edge Function] Auth header present: true
🟢 [Edge Function] Creating Supabase client
🟢 [Edge Function] User authenticated: xxx
🟢 [Edge Function] Request params: {...}
🟢 [Edge Function] Calling get_or_create_share with: {...}
🟢 [Edge Function] RPC response - data: [...]
🟢 [Edge Function] Share data: {...}
✅ [Edge Function] Final response: {...}
```

## Step 4: Look for Errors

If you see a 🔴 red error, note:

1. **Where the error occurred** (ShareModal, shareSet, or Edge Function)
2. **The error message**
3. **The error details/stack**

Common issues to look for:

- **Auth issues**: "Unauthorized" or "Missing authorization header"
- **Database issues**: PostgreSQL errors from `get_or_create_share`
- **Network issues**: Timeout or connection errors
- **Data issues**: "No data returned" or "null/undefined"

## Step 5: Share the Logs

Once you've tried sharing and captured the logs, share:

1. **All console logs** from the browser (copy/paste or screenshot)
2. **Any edge function logs** from Supabase dashboard
3. **The specific error message** you see in the alert

This will help us pinpoint exactly where the sharing is failing!

## Quick Troubleshooting

### If you see "🔴 [shareSet] Error sharing set"
→ Check what comes before it to see where it failed

### If you see "🔴 [Edge Function] Auth error"
→ Authentication issue - check if you're logged in

### If you see "🔴 [Edge Function] Error creating share"
→ Database issue - check the RPC error details

### If you see "🔴 [ShareModal] shareSet returned null"
→ The function completed but returned null - check preceding errors
