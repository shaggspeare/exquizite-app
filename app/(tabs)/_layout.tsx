import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/contexts/AuthContext';

export default function TabsLayout() {
  const { t } = useTranslation(['games', 'profile']);
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          display: isDesktop ? 'none' : 'flex', // Hide tab bar on desktop
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // For guests: show as "Home", for logged users: show as "Dashboard"
          title: user?.isGuest ? t('games:home.title') : t('games:dashboard.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={user?.isGuest ? 'home' : 'stats-chart'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-sets"
        options={{
          title: t('games:mySets.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile:title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: null, // Hide from tab bar but keep route accessible
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="sets"
        options={{
          href: null, // Hide from tab bar - accessed via navigation
        }}
      />
      <Tabs.Screen
        name="shared-[shareCode]"
        options={{
          href: null, // Hide from tab bar - accessed via share links
        }}
      />
    </Tabs>
  );
}
