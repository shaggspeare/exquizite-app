// Desktop profile view
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { DesktopContainer } from '@/components/layout/DesktopContainer';

export function DesktopProfileView() {
  const { user, signOut } = useAuth();
  const { sets, deleteSet } = useSets();
  const { colors } = useTheme();
  const router = useRouter();

  const totalWords = sets.reduce((sum, set) => sum + set.words.length, 0);
  const practicedSets = sets.filter(s => s.lastPracticed).length;
  const accuracy = sets.length > 0 ? Math.round((practicedSets / sets.length) * 100) : 0;

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
    showAlert('Delete Set', `Are you sure you want to delete "${setName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSet(setId),
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <DesktopContainer>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
        </View>

        <View style={styles.bentoLayout}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Profile Card */}
            <LinearGradient colors={['#5B9EFF', '#E066FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={64} color="#FFFFFF" />
              </View>
              <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
              {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
              <View style={styles.accountBadge}>
                <Ionicons name={user?.isGuest ? 'person-outline' : 'shield-checkmark'} size={14} color="#FFFFFF" />
                <Text style={styles.accountBadgeText}>{user?.isGuest ? 'Guest Account' : 'Full Account'}</Text>
              </View>
            </LinearGradient>

            {/* Upgrade Banner for Guests */}
            {user?.isGuest && (
              <Card style={[styles.upgradeCard, { borderColor: colors.primary }]}>
                <View style={[styles.upgradeIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="rocket" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.upgradeTitle, { color: colors.text }]}>Upgrade Your Account</Text>
                <Text style={[styles.upgradeDescription, { color: colors.textSecondary }]}>
                  Create a full account to sync your data across devices and never lose your progress
                </Text>
                <Button title="Create Account" onPress={() => router.push('/(auth)/login')} style={styles.upgradeButton} />
              </Card>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <LinearGradient colors={['#4A90E2', '#5B9EFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
                  <Ionicons name="library" size={40} color="#FFFFFF" />
                  <Text style={styles.statValue}>{sets.length}</Text>
                  <Text style={styles.statLabel}>Total Sets</Text>
                </LinearGradient>
              </Card>

              <Card style={styles.statCard}>
                <LinearGradient colors={['#00D4FF', '#00E5A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
                  <Ionicons name="book" size={40} color="#FFFFFF" />
                  <Text style={styles.statValue}>{totalWords}</Text>
                  <Text style={styles.statLabel}>Total Words</Text>
                </LinearGradient>
              </Card>
            </View>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <LinearGradient colors={['#B537F2', '#E066FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
                  <Ionicons name="flame" size={40} color="#FFFFFF" />
                  <Text style={styles.statValue}>{practicedSets}</Text>
                  <Text style={styles.statLabel}>Practiced</Text>
                </LinearGradient>
              </Card>

              <Card style={styles.statCard}>
                <LinearGradient colors={['#FF6B35', '#FFBB00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
                  <Ionicons name="trophy" size={40} color="#FFFFFF" />
                  <Text style={styles.statValue}>{accuracy}%</Text>
                  <Text style={styles.statLabel}>Progress</Text>
                </LinearGradient>
              </Card>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/settings')} activeOpacity={0.7}>
                <View style={[styles.settingsIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="settings" size={28} color={colors.primary} />
                </View>
                <View style={styles.settingsInfo}>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>App Settings</Text>
                  <Text style={[styles.settingsDescription, { color: colors.textSecondary }]}>Theme, languages, and preferences</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Your Sets */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Sets</Text>
              {sets.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="folder-open-outline" size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sets created yet</Text>
                </Card>
              ) : (
                <View style={styles.setsList}>
                  {sets.map(set => (
                    <Card key={set.id} style={styles.setCard}>
                      <View style={styles.setInfo}>
                        <Text style={[styles.setName, { color: colors.text }]}>{set.name}</Text>
                        <Text style={[styles.setMeta, { color: colors.textSecondary }]}>
                          {set.words.length} {set.words.length === 1 ? 'word' : 'words'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteSet(set.id, set.name)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                      </TouchableOpacity>
                    </Card>
                  ))}
                </View>
              )}
            </View>

            {/* Sign Out */}
            <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
          </View>
        </View>
      </DesktopContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xxl,
  },
  pageHeader: {
    marginBottom: Spacing.xxl,
  },
  pageTitle: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: '700',
  },
  bentoLayout: {
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  leftColumn: {
    width: 420,
    gap: Spacing.lg,
  },
  rightColumn: {
    flex: 1,
  },
  profileCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadow.cardDeep,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  userName: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  accountBadgeText: {
    ...Typography.caption,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  upgradeCard: {
    padding: Spacing.xl,
    borderWidth: 2,
    alignItems: 'center',
    textAlign: 'center' as any,
  },
  upgradeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  upgradeTitle: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  upgradeDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  upgradeButton: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
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
    minHeight: 140,
  },
  statValue: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.md,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsInfo: {
    flex: 1,
  },
  settingsLabel: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingsDescription: {
    ...Typography.caption,
    fontSize: 14,
  },
  setsList: {
    gap: Spacing.sm,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  setMeta: {
    ...Typography.caption,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
