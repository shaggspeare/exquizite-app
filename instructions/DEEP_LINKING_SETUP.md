# Deep Linking Setup Guide

This guide explains how to set up Universal Links (iOS) and App Links (Android) for the Exquizite app.

## Overview

Deep linking allows users to open share links directly in your native app (if installed) instead of the web browser. This creates a seamless experience when sharing word sets.

## Files Created

The following configuration files have been created in `public/.well-known/`:

### For iOS (Universal Links)
- `apple-app-site-association` - For app.exquizite.app
- `apple-app-site-association-root` - For exquizite.app (root domain)

### For Android (App Links)
- `assetlinks.json` - For app.exquizite.app
- `assetlinks-root.json` - For exquizite.app (root domain)

## Deployment Steps

### 1. Get Your iOS Team ID

First, you need to find your Apple Developer Team ID:

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Sign in with your developer credentials
3. Your Team ID is displayed in the top right corner (10 characters, e.g., `ABC123DEFG`)

### 2. Update iOS Configuration Files

Replace `SHAGGSPEARE_TEAM_ID` in both AASA files with your actual Team ID:

**Files to update:**
- `public/.well-known/apple-app-site-association`
- `public/.well-known/apple-app-site-association-root`

Change:
```json
"appID": "SHAGGSPEARE_TEAM_ID.com.shaggspeare.exquiziteapp"
```

To:
```json
"appID": "ABC123DEFG.com.shaggspeare.exquiziteapp"
```

(Replace `ABC123DEFG` with your actual Team ID)

### 3. Get Your Android SHA-256 Fingerprint

For Android, you need the SHA-256 certificate fingerprint.

#### For Production Build (Play Store):

```bash
# Get the fingerprint from your Play Console keystore
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
```

#### For Development/Debug Build:

```bash
# Default debug keystore (useful for testing)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the `SHA256` line in the output, it will look like:
```
SHA256: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90
```

### 4. Update Android Configuration Files

Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` in both assetlinks files:

**Files to update:**
- `public/.well-known/assetlinks.json`
- `public/.well-known/assetlinks-root.json`

Change:
```json
"sha256_cert_fingerprints": [
  "REPLACE_WITH_YOUR_SHA256_FINGERPRINT"
]
```

To:
```json
"sha256_cert_fingerprints": [
  "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90"
]
```

**Note:** If you have multiple builds (debug + production), you can include multiple fingerprints:

```json
"sha256_cert_fingerprints": [
  "YOUR_DEBUG_FINGERPRINT",
  "YOUR_PRODUCTION_FINGERPRINT"
]
```

### 5. Deploy to Your Web Servers

Deploy these files to your web servers so they're accessible at these URLs:

#### For app.exquizite.app:
```
https://app.exquizite.app/.well-known/apple-app-site-association
https://app.exquizite.app/.well-known/assetlinks.json
```

**Deployment:**
- Copy `public/.well-known/apple-app-site-association` → serve at the URL above
- Copy `public/.well-known/assetlinks.json` → serve at the URL above

#### For exquizite.app (root domain):
```
https://exquizite.app/.well-known/apple-app-site-association
https://exquizite.app/.well-known/assetlinks.json
```

**Deployment:**
- Copy `public/.well-known/apple-app-site-association-root` → rename to `apple-app-site-association` and serve at the URL above
- Copy `public/.well-known/assetlinks-root.json` → rename to `assetlinks.json` and serve at the URL above

### 6. Important Server Configuration

#### Content Type Requirements

**For iOS (AASA files):**
- Must be served with `Content-Type: application/json` OR `Content-Type: application/pkcs7-mime`
- Must be served over HTTPS
- No redirects allowed
- File size must be less than 128 KB

**For Android (assetlinks.json):**
- Must be served with `Content-Type: application/json`
- Must be served over HTTPS

#### Example nginx configuration:

```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
}

location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Content-Type application/json;
}
```

#### Example for static hosting (Vercel/Netlify):

Create a `vercel.json` or `netlify.toml` file:

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    {
      "source": "/.well-known/assetlinks.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

**netlify.toml:**
```toml
[[headers]]
  for = "/.well-known/apple-app-site-association"
  [headers.values]
    Content-Type = "application/json"

[[headers]]
  for = "/.well-known/assetlinks.json"
  [headers.values]
    Content-Type = "application/json"
```

### 7. Verify Your Setup

#### iOS Verification:

1. **Apple's AASA Validator:**
   - Visit: https://branch.io/resources/aasa-validator/
   - Enter your domain: `app.exquizite.app`
   - Check for any errors

2. **Manual Test:**
   ```bash
   curl -I https://app.exquizite.app/.well-known/apple-app-site-association
   ```

   Should return:
   - Status: `200 OK`
   - Content-Type: `application/json`

#### Android Verification:

1. **Google's Statement List Generator:**
   - Visit: https://developers.google.com/digital-asset-links/tools/generator
   - Enter your details to verify

2. **Manual Test:**
   ```bash
   curl https://app.exquizite.app/.well-known/assetlinks.json
   ```

   Should return valid JSON with your fingerprint

### 8. Test Deep Linking

#### iOS Testing:

1. Build and install your app on a test device
2. Send yourself a share link via Messages/Email: `https://app.exquizite.app/shared/ABC123DEF456`
3. Long-press the link
4. You should see an option to "Open in Exquizite" (or your app name)
5. Tapping should open the app directly

#### Android Testing:

1. Build and install your app on a test device
2. Make sure "autoVerify" is enabled in `app.json` (already configured)
3. Open a share link in Chrome: `https://app.exquizite.app/shared/ABC123DEF456`
4. The app should open automatically without a dialog

**Debug Android App Links:**
```bash
# Check which apps are handling your domain
adb shell dumpsys package domain-preferred-apps

# Verify your app's domain verification status
adb shell pm get-app-links com.shaggspeare.exquiziteapp
```

## Troubleshooting

### iOS Issues

**Links not opening in app:**
1. Delete the app and reinstall (iOS caches AASA files)
2. Check that Team ID is correct
3. Verify AASA file is accessible via HTTPS
4. Ensure no redirects on the AASA URL
5. Check Content-Type header

**View iOS Logs:**
```bash
# Connect device and run:
xcrun simctl openurl booted "https://app.exquizite.app/shared/TEST123456"
```

### Android Issues

**Links opening in browser instead of app:**
1. Clear app data and reinstall
2. Verify SHA-256 fingerprint is correct
3. Check that `autoVerify: true` in app.json
4. Ensure assetlinks.json is valid JSON

**Reset Android App Links:**
```bash
adb shell pm set-app-links --package com.shaggspeare.exquiziteapp 0 all
adb shell pm verify-app-links --re-verify com.shaggspeare.exquiziteapp
```

## Current Configuration

### App Configuration (app.json)

**iOS Associated Domains:**
```json
"associatedDomains": [
  "applinks:app.exquizite.app",
  "applinks:exquizite.app"
]
```

**Android Intent Filters:**
```json
"intentFilters": [
  {
    "action": "VIEW",
    "autoVerify": true,
    "data": [
      {
        "scheme": "https",
        "host": "app.exquizite.app",
        "pathPrefix": "/shared"
      },
      {
        "scheme": "https",
        "host": "exquizite.app",
        "pathPrefix": "/shared"
      },
      {
        "scheme": "exquiziteapp",
        "host": "shared"
      }
    ],
    "category": ["BROWSABLE", "DEFAULT"]
  }
]
```

### Supported Share URLs

The app will handle these URL formats:
- `https://app.exquizite.app/shared/CODE` ✅ (Primary)
- `https://exquizite.app/shared/CODE` ✅ (Fallback)
- `exquiziteapp://shared/CODE` ✅ (Custom scheme)

## Additional Resources

- [Apple Universal Links Documentation](https://developer.apple.com/ios/universal-links/)
- [Android App Links Documentation](https://developer.android.com/training/app-links)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Branch.io AASA Validator](https://branch.io/resources/aasa-validator/)

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all URLs are accessible via HTTPS
3. Ensure you've updated Team ID and SHA-256 fingerprints
4. Test on a real device (simulators may behave differently)
