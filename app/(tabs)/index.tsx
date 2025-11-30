import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SetCard } from '@/components/set/SetCard';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopHomeView } from '@/components/home/DesktopHomeView';

export default function HomeScreen() {
  const { user } = useAuth();
  const { sets } = useSets();
  const { colors } = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();

  // Use desktop layout for desktop screens
  if (isDesktop) {
    return (
      <DesktopLayout>
        <DesktopHomeView />
      </DesktopLayout>
    );
  }

  // Mobile layout below

  const totalWords = sets.reduce((sum, set) => sum + set.words.length, 0);
  const recentSets = sets.slice(0, 3);

  // Calculate streak (mock for now)
  const streak = sets.filter(s => s.lastPracticed).length;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No sets yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Create your first word set to get started!
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/create')}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Create Set</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Widget */}
        <LinearGradient
          colors={['#5B9EFF', '#E066FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeWidget}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Hello, {user?.name || 'there'}!
            </Text>
            <Text style={styles.welcomeSubtitle}>Ready to learn today?</Text>
          </View>
          <TouchableOpacity
            style={styles.createFab}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#5B9EFF" />
          </TouchableOpacity>
        </LinearGradient>

        {sets.length > 0 ? (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="library" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{sets.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sets</Text>
              </Card>

              <Card style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}20` }]}>
                  <Ionicons name="book" size={32} color={colors.success} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{totalWords}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Words</Text>
              </Card>

              <Card style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.ai}20` }]}>
                  <Ionicons name="flame" size={32} color={colors.ai} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
              </Card>
            </View>

            {/* Quick Practice Widget */}
            {recentSets.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(`/sets/${recentSets[0].id}`)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00D4FF', '#00E5A0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickPracticeWidget}
                >
                  <View>
                    <Text style={styles.quickPracticeTitle}>Quick Practice</Text>
                    <Text style={styles.quickPracticeSubtitle}>{recentSets[0].name}</Text>
                  </View>
                  <View style={styles.playIconContainer}>
                    <Ionicons name="play" size={28} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* My Sets Section */}
            <View style={styles.setsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>My Sets</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/create')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {sets.map(set => (
                <SetCard key={set.id} set={set} />
              ))}
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  welcomeWidget: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
    ...Shadow.cardDeep,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
  },
  createFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.button,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h1,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
  },
  quickPracticeWidget: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
    ...Shadow.card,
  },
  quickPracticeTitle: {
    ...Typography.caption,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.xs,
  },
  quickPracticeSubtitle: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsSection: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    ...Typography.h2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.button,
    ...Shadow.button,
  },
  emptyButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
