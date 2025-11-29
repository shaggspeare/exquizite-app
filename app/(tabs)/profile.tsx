import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { showAlert } from '@/lib/alert';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { sets, deleteSet } = useSets();
  const { colors } = useTheme();
  const router = useRouter();

  const totalWords = sets.reduce((sum, set) => sum + set.words.length, 0);

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

  const handleDeleteSet = (setId: string, setName: string) => {
    showAlert(
      'Delete Set',
      `Are you sure you want to delete "${setName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSet(setId),
        },
      ]
    );
  };

  const practicedSets = sets.filter(s => s.lastPracticed).length;
  const accuracy = sets.length > 0 ? Math.round((practicedSets / sets.length) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <LinearGradient
          colors={['#5B9EFF', '#E066FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={56} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
          <View style={styles.accountBadge}>
            <Ionicons name={user?.isGuest ? 'person-outline' : 'shield-checkmark'} size={14} color="#FFFFFF" />
            <Text style={styles.accountBadgeText}>
              {user?.isGuest ? 'Guest Account' : 'App Account'}
            </Text>
          </View>
        </LinearGradient>

        {/* Upgrade Account Banner for Guests */}
        {user?.isGuest && (
          <Card style={[styles.upgradeCard, { borderColor: colors.primary }]}>
            <View style={styles.upgradeContent}>
              <View style={[styles.upgradeIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="rocket" size={32} color={colors.primary} />
              </View>
              <View style={styles.upgradeTextContainer}>
                <Text style={[styles.upgradeTitle, { color: colors.text }]}>
                  Upgrade Your Account
                </Text>
                <Text style={[styles.upgradeDescription, { color: colors.textSecondary }]}>
                  Create a full account to sync your data and never lose your progress
                </Text>
              </View>
            </View>
            <Button
              title="Create Account"
              onPress={() => router.push('/(auth)/login')}
              style={styles.upgradeButton}
            />
          </Card>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <LinearGradient
              colors={['#4A90E2', '#5B9EFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="library" size={36} color="#FFFFFF" />
              <Text style={styles.statValue}>{sets.length}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </LinearGradient>
          </Card>

          <Card style={styles.statCard}>
            <LinearGradient
              colors={['#00D4FF', '#00E5A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="book" size={36} color="#FFFFFF" />
              <Text style={styles.statValue}>{totalWords}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </LinearGradient>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <LinearGradient
              colors={['#B537F2', '#E066FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="flame" size={36} color="#FFFFFF" />
              <Text style={styles.statValue}>{practicedSets}</Text>
              <Text style={styles.statLabel}>Practiced</Text>
            </LinearGradient>
          </Card>

          <Card style={styles.statCard}>
            <LinearGradient
              colors={['#FF6B35', '#FFBB00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="trophy" size={36} color="#FFFFFF" />
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </LinearGradient>
          </Card>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <TouchableOpacity
            style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="settings" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingsInfo}>
              <Text style={[styles.settingsLabel, { color: colors.text }]}>App Settings</Text>
              <Text style={[styles.settingsDescription, { color: colors.textSecondary }]}>
                Theme, languages, and preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Sets</Text>
          {sets.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sets created yet</Text>
          ) : (
            sets.map(set => (
              <Card key={set.id} style={styles.setCard}>
                <View style={styles.setInfo}>
                  <Text style={[styles.setName, { color: colors.text }]}>{set.name}</Text>
                  <Text style={[styles.setMeta, { color: colors.textSecondary }]}>
                    {set.words.length} {set.words.length === 1 ? 'word' : 'words'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSet(set.id, set.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    position: 'relative',
    ...Shadow.cardDeep,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.sm,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  accountBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  upgradeCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  upgradeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  upgradeDescription: {
    ...Typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    marginTop: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  statGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statValue: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  setMeta: {
    ...Typography.caption,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  actions: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.cardLarge,
    borderWidth: 1,
    gap: Spacing.md,
  },
  settingsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsInfo: {
    flex: 1,
  },
  settingsLabel: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingsDescription: {
    ...Typography.caption,
    fontSize: 12,
  },
});
