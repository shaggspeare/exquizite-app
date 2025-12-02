import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SetsProvider, useSets } from '@/contexts/SetsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { TourProvider } from '@/contexts/TourContext';
import { TourModal } from '@/components/tour/TourModal';
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
    // User should skip language setup only if languages are already configured
    // This ensures guest users who created sets still go through language setup when they sign up
    const shouldSkipLanguageSetup = preferences.isConfigured;

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
      // Redirect to language setup if languages not configured
      // This includes newly signed up users (even if they were guests with sets)
      console.log('➡️  Redirecting to language setup (user but no languages configured)');
      router.replace('/(auth)/language-setup');
    } else if (user && shouldSkipLanguageSetup && (onLanguageSetup || (inAuthGroup && !onLanguageSetup)) && !user.isGuest) {
      // Redirect to main app if authenticated (NOT guest) and languages configured
      // Guest users can stay in auth group to sign up
      // This handles both: being on language-setup page AND being elsewhere in auth group
      console.log('➡️  Redirecting to main app (user and languages configured)');
      router.replace('/(tabs)');
    } else if (user && shouldSkipLanguageSetup && !inAuthGroup && !user.isGuest) {
      // User is authenticated (NOT guest), configured, and already in main app - no redirect needed
      console.log('✅ User properly in main app, no redirect needed');
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
      <TourModal />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <LanguageProvider>
            <SetsProvider>
              <TourProvider>
                <RootLayoutNav />
              </TourProvider>
            </SetsProvider>
          </LanguageProvider>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
