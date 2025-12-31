// Environment configuration
// Note: In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be available in the app

export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  app: {
    webUrl: 'https://app.exquizite.app',
    landingPageUrl: 'https://www.exquizite.app',
  },
};
