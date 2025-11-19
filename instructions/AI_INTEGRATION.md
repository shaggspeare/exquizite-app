# AI Integration with OpenAI

This app uses OpenAI's ChatGPT API to power AI features.

## Features

1. **Word Suggestions** - Generate vocabulary words based on themes
2. **Smart Hints** - AI-generated memory tips for flashcards
3. **Quiz Options** - Intelligent distractor generation for quiz questions

## Local Development

The API key is stored in `.env.local` (already configured, not tracked by git).

## Production Deployment

For production with Expo:

### Option 1: EAS Secrets (Recommended)

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Add the secret
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value YOUR_API_KEY_HERE
```

### Option 2: Environment Variables in EAS Build

Create `eas.json` in the root directory:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "env": {
        "EXPO_PUBLIC_OPENAI_API_KEY": "your-api-key-here"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_OPENAI_API_KEY": "your-api-key-here"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Option 3: Manual App Store Updates

For manual builds, set the environment variable before building:

```bash
export EXPO_PUBLIC_OPENAI_API_KEY="your-api-key-here"
npx expo build:ios
# or
npx expo build:android
```

## Security Notes

1. The API key is prefixed with `EXPO_PUBLIC_` to be accessible in the React Native app
2. **Important**: This means the key is embedded in the app bundle and could be extracted
3. For production, consider:
   - Setting up a backend API proxy that calls OpenAI
   - Using rate limiting on the key
   - Monitoring API usage in OpenAI dashboard
   - Setting spending limits on your OpenAI account

## API Usage

The app uses:
- Model: `gpt-3.5-turbo`
- Max tokens per request: ~500
- Features fallback to mock data if API fails

## Cost Estimation

Typical usage per session:
- Word suggestions: ~$0.001 per request (5 words)
- Hints: ~$0.0005 per hint
- Quiz options: ~$0.001 per question

Expected monthly cost: $5-20 depending on usage

## Error Handling

All AI features have fallback mechanisms:
- Word suggestions → Mock data by theme
- Hints → Simple memory tips
- Quiz options → Use existing translations

The app will continue to work even if:
- API key is invalid
- Rate limits are exceeded
- Network is unavailable
