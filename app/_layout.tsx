import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SetsProvider } from '@/contexts/SetsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import 'react-native-reanimated';

function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, isLoading: langLoading } = useLanguage();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || langLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onLanguageSetup = segments[1] === 'language-setup';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && !preferences.isConfigured && !onLanguageSetup) {
      // Redirect to language setup if authenticated but languages not configured
      router.replace('/(auth)/language-setup');
    } else if (user && preferences.isConfigured && inAuthGroup && !onLanguageSetup) {
      // Redirect to main app if authenticated and languages configured
      router.replace('/(tabs)');
    }
  }, [user, authLoading, langLoading, preferences.isConfigured, segments]);

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
      <LanguageProvider>
        <AuthProvider>
          <SetsProvider>
            <RootLayoutNav />
          </SetsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
