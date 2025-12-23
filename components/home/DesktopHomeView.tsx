// Desktop home screen layout with bento grid
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DesktopSetCard } from '@/components/set/DesktopSetCard';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { DesktopContainer } from '@/components/layout/DesktopContainer';

export function DesktopHomeView() {
  const { t } = useTranslation('games');
  const { user } = useAuth();
  const { sets, refreshSets } = useSets();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Filter to get user sets (non-featured) and featured sets
  const userSets = sets.filter(set => !set.isFeatured);
  const featuredSets = sets.filter(set => set.isFeatured);

  const totalWords = userSets.reduce((sum, set) => sum + set.words.length, 0);
  const recentSets = userSets.slice(0, 3);
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
      <Ionicons name="book-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('mySets.noSets')}
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {t('mySets.createFirstSet')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/create')}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>{t('mySets.createSet')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
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
      <DesktopContainer>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>
              {t('home.greeting', { name: user?.name || 'there' })} 👋
            </Text>
            <Text
              style={[styles.pageSubtitle, { color: colors.textSecondary }]}
            >
              {t('home.readyToLearn')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>{t('home.createSet')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Grid Layout - Show if user has sets OR featured sets */}
        {(userSets.length > 0 || featuredSets.length > 0) && (
          <>
            <View style={[
              styles.bentoGrid,
              (user?.isGuest || userSets.length === 0) && styles.bentoGridCentered
            ]}>
              {/* Left Column - Stats and Quick Practice - Only show for logged users with sets */}
              {userSets.length > 0 && !user?.isGuest && (
                <View style={styles.leftColumn}>
                  <View style={styles.statsRow}>
                    <Card style={[styles.statCard, styles.bentoCard]}>
                      <View
                        style={[
                          styles.statIconContainer,
                          { backgroundColor: `${colors.primary}20` },
                        ]}
                      >
                        <Ionicons
                          name="library"
                          size={28}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {userSets.length}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('common:counts.sets')}
                      </Text>
                    </Card>

                    <Card style={[styles.statCard, styles.bentoCard]}>
                      <View
                        style={[
                          styles.statIconContainer,
                          { backgroundColor: `${colors.success}20` },
                        ]}
                      >
                        <Ionicons
                          name="book"
                          size={28}
                          color={colors.success}
                        />
                      </View>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {totalWords}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('common:counts.words')}
                      </Text>
                    </Card>

                    <Card style={[styles.statCard, styles.bentoCard]}>
                      <View
                        style={[
                          styles.statIconContainer,
                          { backgroundColor: `${colors.ai}20` },
                        ]}
                      >
                        <Ionicons name="flame" size={28} color={colors.ai} />
                      </View>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {streak}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('dashboard.streak')}
                      </Text>
                    </Card>
                  </View>

                  {/* Quick Practice - Larger */}
                  {recentSets.length > 0 && (
                    <TouchableOpacity
                      onPress={() => router.push(`/(tabs)/sets/${recentSets[0].id}`)}
                      activeOpacity={0.8}
                      style={styles.bentoCard}
                    >
                      <LinearGradient
                        colors={['#00D4FF', '#00E5A0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.quickPracticeCard}
                      >
                        <Ionicons
                          name="play-circle"
                          size={64}
                          color="#FFFFFF"
                        />
                        <Text style={styles.quickPracticeTitle}>
                          {t('quickPractice')}
                        </Text>
                        <Text style={styles.quickPracticeSubtitle}>
                          {recentSets[0].name}
                        </Text>
                        <View style={styles.wordCount}>
                          <Ionicons
                            name="book-outline"
                            size={18}
                            color="rgba(255,255,255,0.8)"
                          />
                          <Text style={styles.wordCountText}>
                            {t('common:counts.wordCount', { count: recentSets[0].words.length })}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Center Column - Featured Sets */}
              {featuredSets.length > 0 && (
                <View style={styles.centerColumn}>
                  <View style={styles.setsHeader}>
                    <Text style={[styles.setsTitle, { color: colors.text }]}>
                      {t('home.featuredSets')}
                    </Text>
                    <View
                      style={[
                        styles.featuredBadge,
                        { backgroundColor: colors.ai + '20' },
                      ]}
                    >
                      <Ionicons name="star" size={16} color={colors.ai} />
                      <Text
                        style={[styles.featuredBadgeText, { color: colors.ai }]}
                      >
                        {t('home.tryThem')}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.setsSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t('home.demoDescription')}
                  </Text>

                  <View style={styles.setsList}>
                    {featuredSets.map(set => (
                      <DesktopSetCard key={set.id} set={set} />
                    ))}
                  </View>
                </View>
              )}

              {/* Right Column - Last Practiced Sets - Show for logged users with practiced sets */}
              {userSets.length > 0 && !user?.isGuest && practicedSets.length > 0 && (
                <View style={styles.rightColumn}>
                  <View style={styles.lastPracticedSection}>
                    <Text style={[styles.lastPracticedTitle, { color: colors.text }]}>
                      {t('dashboard.lastPracticed')}
                    </Text>
                    <View style={styles.lastPracticedList}>
                      {practicedSets.map(set => (
                        <DesktopSetCard key={set.id} set={set} compact />
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {/* Empty state - only show if no user sets and no featured sets */}
        {userSets.length === 0 &&
          featuredSets.length === 0 &&
          renderEmptyState()}
      </DesktopContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xxl,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  pageTitle: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    ...Typography.bodyLarge,
    fontSize: 18,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    ...Shadow.button,
  },
  createButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  bentoGridCentered: {
    justifyContent: 'center',
  },
  leftColumn: {
    width: 380,
    gap: Spacing.lg,
  },
  centerColumn: {
    flex: 1,
    maxWidth: 700,
  },
  rightColumn: {
    width: 380,
    gap: Spacing.lg,
  },
  bentoCard: {
    ...Shadow.card,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h1,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
    textAlign: 'center',
  },
  quickPracticeCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xxl,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPracticeTitle: {
    ...Typography.caption,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  quickPracticeSubtitle: {
    ...Typography.h2,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  wordCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  wordCountText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  setsTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  setsCount: {
    ...Typography.body,
    fontSize: 16,
  },
  setsSubtitle: {
    ...Typography.body,
    fontSize: 14,
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  featuredBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  setsList: {
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 3,
  },
  emptyTitle: {
    ...Typography.h1,
    fontSize: 32,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyLarge,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 400,
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
    fontSize: 16,
  },
  lastPracticedSection: {
    gap: Spacing.md,
  },
  lastPracticedTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  lastPracticedList: {
    gap: Spacing.sm,
  },
});
