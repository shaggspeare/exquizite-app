// Desktop sidebar navigation
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Typography, Spacing, BorderRadius } from '@/lib/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { showAlert } from '@/lib/alert';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: 'home', route: '/(tabs)' },
  { label: 'Create Set', icon: 'add-circle', route: '/(tabs)/create' },
  { label: 'Profile', icon: 'person', route: '/(tabs)/profile' },
];

export function DesktopSidebar() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo/Brand */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#5B9EFF', '#E066FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.logo, { color: colors.text }]}>Exquizite</Text>
        </View>

        {/* User Info */}
        {user && (
          <View style={[styles.userCard, { backgroundColor: colors.background }]}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user.name}
              </Text>
              {user.isGuest && (
                <Text style={[styles.guestBadge, { color: colors.textSecondary }]}>
                  Guest
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(item.route);
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
                  {item.label}
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
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
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
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
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
