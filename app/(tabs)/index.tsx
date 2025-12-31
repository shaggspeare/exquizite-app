import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTour } from '@/contexts/TourContext';
import { SetCard } from '@/components/set/SetCard';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopHomeView } from '@/components/home/DesktopHomeView';

export default function HomeScreen() {
  const { t } = useTranslation('games');
  const { user, isLoading: authLoading } = useAuth();
  const { sets, isLoading: setsLoading, refreshSets } = useSets();
  const { preferences, isLoading: langLoading } = useLanguage();
  const { hasCompletedTour, showTour, isLoading: tourLoading } = useTour();
  const { colors } = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);

  // Tour trigger for new users
  useEffect(() => {
    // Wait for all contexts to load
    if (authLoading || langLoading || setsLoading || tourLoading) {
      return;
    }

    // Don't show tour if already completed
    if (hasCompletedTour) {
      return;
    }

    // Show tour to:
    // 1. Guest users who haven't completed the tour (no language config required)
    // 2. Authenticated users with configured languages and no sets
    const userSets = sets.filter(s => !s.isFeatured);
    const shouldShowTour =
      user &&
      !hasCompletedTour &&
      (user.isGuest || (preferences.isConfigured && userSets.length === 0));

    if (shouldShowTour) {
      // Small delay to allow UI to settle after navigation
      const timer = setTimeout(() => {
        showTour();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    user,
    authLoading,
    langLoading,
    setsLoading,
    tourLoading,
    preferences.isConfigured,
    sets,
    hasCompletedTour,
    showTour,
  ]);

  // Use desktop layout for desktop screens
  if (isDesktop) {
    return (
      <DesktopLayout>
        <DesktopHomeView />
      </DesktopLayout>
    );
  }

  // Mobile layout below

  // Filter to get user sets (non-featured) and featured sets
  const userSets = sets.filter(set => !set.isFeatured);
  const featuredSets = sets.filter(set => set.isFeatured);

  const totalWords = userSets.reduce((sum, set) => sum + set.words.length, 0);
  const recentSets = userSets.slice(0, 3);

  // Calculate streak (mock for now)
  const streak = userSets.filter(s => s.lastPracticed).length;

  // Get last 3 practiced sets (for logged users' dashboard)
  const practicedSets = userSets
    .filter(s => s.lastPracticed)
    .sort((a, b) => {
      const dateA = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
      const dateB = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSets();
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('home.noSets')}
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {t('home.createFirstSet')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/create')}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>{t('home.createSet')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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
              {t('home.greeting', { name: user?.name || 'there' })}
            </Text>
            <Text style={styles.welcomeSubtitle}>{t('home.readyToLearn')}</Text>
          </View>
          <TouchableOpacity
            style={styles.createFab}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#5B9EFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Grid and Quick Practice - Only for logged users with sets */}
        {!user?.isGuest && userSets.length > 0 && (
          <>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.primary}20` },
                  ]}
                >
                  <Ionicons name="library" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {userSets.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t('common:counts.sets')}
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.success}20` },
                  ]}
                >
                  <Ionicons name="book" size={32} color={colors.success} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalWords}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t('common:counts.words')}
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.ai}20` },
                  ]}
                >
                  <Ionicons name="flame" size={32} color={colors.ai} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {streak}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t('profile:stats.practiced')}
                </Text>
              </Card>
            </View>

            {/* Quick Practice Widget */}
            {recentSets.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(`/(tabs)/sets/${recentSets[0].id}`)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00D4FF', '#00E5A0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickPracticeWidget}
                >
                  <View>
                    <Text style={styles.quickPracticeTitle}>
                      {t('quickPractice')}
                    </Text>
                    <Text style={styles.quickPracticeSubtitle}>
                      {recentSets[0].name}
                    </Text>
                  </View>
                  <View style={styles.playIconContainer}>
                    <Ionicons name="play" size={28} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Last Practiced Sets - Show for logged users with practiced sets */}
            {practicedSets.length > 0 && (
              <View style={styles.setsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('dashboard.lastPracticed')}
                </Text>
                <View style={styles.lastPracticedContainer}>
                  {practicedSets.map(set => (
                    <SetCard key={set.id} set={set} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Featured Sets Section - Show for all users */}
        {featuredSets.length > 0 && (
          <View style={styles.setsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.featuredSets')}
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              {t('home.demoDescription')}
            </Text>

            {featuredSets.map(set => (
              <SetCard key={set.id} set={set} />
            ))}
          </View>
        )}

        {/* Empty state - only show if no user sets and no featured sets */}
        {userSets.length === 0 &&
          featuredSets.length === 0 &&
          renderEmptyState()}
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
  sectionTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    ...Typography.body,
    fontSize: 14,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
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
  lastPracticedContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
});
