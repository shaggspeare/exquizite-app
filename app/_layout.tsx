import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SetsProvider } from '@/contexts/SetsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { TourProvider } from '@/contexts/TourContext';
import { TourModal } from '@/components/tour/TourModal';
import { getRoutingDecision } from '@/lib/routing';
import '@/lib/i18n';
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
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Routing check:', {
      authLoading,
      langLoading,
      hasUser: !!user,
      isGuest: user?.isGuest,
      isConfigured: preferences.isConfigured,
      segments,
    });

    // Only wait for auth and language to load - NOT sets
    // Sets loading shouldn't block navigation decisions
    if (authLoading || langLoading) {
      console.log('⏳ Still loading auth/language, skipping navigation');
      return;
    }

    // Use the extracted routing logic (testable pure function)
    const decision = getRoutingDecision({
      user: user ? { isGuest: user.isGuest } : null,
      isConfigured: preferences.isConfigured,
      segments: segments as string[],
    });

    if (decision.action === 'redirect') {
      console.log(`➡️  Redirecting to ${decision.to}`);
      router.replace(decision.to);
    } else {
      console.log('✅ No redirect needed, staying on current route');
    }
  }, [
    user,
    authLoading,
    langLoading,
    preferences.isConfigured,
    segments,
  ]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <TourModal />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
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
      </I18nProvider>
    </ThemeProvider>
  );
}
