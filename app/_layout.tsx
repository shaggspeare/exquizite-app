import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SetsProvider, useSets } from '@/contexts/SetsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import 'react-native-reanimated';

// Add global emoji font support for web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    body, input, textarea, select, button {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji",
        "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji", sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, isLoading: langLoading } = useLanguage();
  const { sets, isLoading: setsLoading } = useSets();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const hasSets = sets.length > 0;
    // User should skip language setup if:
    // 1. Languages are already configured, OR
    // 2. User has sets (even if not formally configured - this is a safety fallback)
    const shouldSkipLanguageSetup = preferences.isConfigured || hasSets;

    console.log('🔍 Routing check:', {
      authLoading,
      langLoading,
      setsLoading,
      hasUser: !!user,
      isConfigured: preferences.isConfigured,
      hasSets,
      setsCount: sets.length,
      shouldSkipLanguageSetup,
      targetLanguage: preferences.targetLanguage,
      nativeLanguage: preferences.nativeLanguage,
      segments,
    });

    if (authLoading || langLoading || setsLoading) {
      console.log('⏳ Still loading, skipping navigation');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const onLanguageSetup = segments[1] === 'language-setup';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('➡️  Redirecting to login (no user)');
      router.replace('/(auth)/login');
    } else if (user && !shouldSkipLanguageSetup && !onLanguageSetup) {
      // Redirect to language setup only if both conditions are true:
      // 1. Languages not configured
      // 2. No existing sets (safety check)
      console.log('➡️  Redirecting to language setup (user but no languages configured and no sets)');
      router.replace('/(auth)/language-setup');
    } else if (user && shouldSkipLanguageSetup && inAuthGroup && !onLanguageSetup) {
      // Redirect to main app if authenticated and (languages configured OR has sets)
      console.log('➡️  Redirecting to main app (user and languages configured or has sets)');
      router.replace('/(tabs)');
    } else {
      console.log('✅ No redirect needed, staying on current route');
    }
  }, [user, authLoading, langLoading, setsLoading, preferences.isConfigured, preferences.targetLanguage, preferences.nativeLanguage, sets.length, segments]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sets" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <SetsProvider>
            <RootLayoutNav />
          </SetsProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
