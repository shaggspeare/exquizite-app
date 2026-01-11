// Desktop sidebar navigation
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Typography, Spacing, BorderRadius } from '@/lib/constants';
import { showAlert } from '@/lib/alert';

interface NavItem {
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

// Base navigation items - will be filtered based on user type
const getNavItems = (isGuest: boolean): NavItem[] => {
  const items: NavItem[] = [];

  // For guests: show Home. For logged users: show Dashboard
  if (isGuest) {
    items.push({ labelKey: 'home', icon: 'home', route: '/(tabs)' });
  } else {
    items.push({ labelKey: 'dashboard', icon: 'stats-chart', route: '/(tabs)' });
  }

  // My Sets for all users
  items.push({ labelKey: 'mySets', icon: 'library', route: '/(tabs)/my-sets' });

  // Create Set and Profile
  items.push(
    { labelKey: 'createSet', icon: 'add-circle', route: '/(tabs)/create' },
    { labelKey: 'profile', icon: 'person', route: '/(tabs)/profile' }
  );

  return items;
};

export function DesktopSidebar() {
  const { t } = useTranslation(['games', 'profile', 'create', 'auth']);
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = getNavItems(user?.isGuest ?? true);

  const getNavLabel = (key: string) => {
    const labels: Record<string, string> = {
      home: t('games:home.title'),
      dashboard: t('games:dashboard.title'),
      mySets: t('games:mySets.title'),
      createSet: t('create:title'),
      profile: t('profile:title'),
    };
    return labels[key] || key;
  };

  const handleSignOut = () => {
    showAlert(t('auth:signOut.title'), t('auth:signOut.message'), [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      {
        text: t('auth:signOut.confirm'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.sidebar,
        { backgroundColor: colors.card, borderRightColor: colors.border },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo/Brand */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={[styles.logo, { color: colors.text }]}>Exquizite</Text>
        </TouchableOpacity>

        {/* User Info */}
        {user && (
          <TouchableOpacity
            style={[styles.userCard, { backgroundColor: colors.background }]}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text
                style={[styles.userName, { color: colors.text }]}
                numberOfLines={1}
              >
                {user.name}
              </Text>
              {user.isGuest && (
                <Text
                  style={[styles.guestBadge, { color: colors.textSecondary }]}
                >
                  {t('profile:guest')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Navigation */}
        <View style={styles.nav}>
          {navItems.map(item => {
            const isActive =
              pathname === item.route || pathname.startsWith(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.navItem,
                  isActive && { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? colors.primary : colors.text },
                  ]}
                >
                  {getNavLabel(item.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sign Out Button (Always at bottom) */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.background }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            {t('auth:signOut.title')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    height: '100%',
    borderRightWidth: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  logo: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B9EFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    fontWeight: '600',
  },
  guestBadge: {
    ...Typography.caption,
    fontSize: 12,
  },
  nav: {
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  navLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  signOutText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
