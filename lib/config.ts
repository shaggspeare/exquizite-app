// Environment configuration
// Note: In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be available in the app

export const config = {
  openai: {
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  },
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};
