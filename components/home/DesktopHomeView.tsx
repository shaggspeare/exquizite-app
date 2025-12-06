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
  const { user } = useAuth();
  const { sets, refreshSets } = useSets();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const totalWords = sets.reduce((sum, set) => sum + set.words.length, 0);
  const recentSets = sets.slice(0, 3);
  const streak = sets.filter(s => s.lastPracticed).length;

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
        No sets yet
      </Text>
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
              Welcome back, {user?.name || 'there'}! 👋
            </Text>
            <Text
              style={[styles.pageSubtitle, { color: colors.textSecondary }]}
            >
              Ready to continue your learning journey?
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Set</Text>
          </TouchableOpacity>
        </View>

        {sets.length > 0 ? (
          <>
            {/* Bento Grid Layout */}
            <View style={styles.bentoGrid}>
              {/* Left Column - Stats and Quick Practice */}
              <View style={styles.leftColumn}>
                {/* Stats Grid and Quick Practice - Hidden for guests mobile*/}

                <>
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
                        {sets.length}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Sets
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
                        Words
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
                        Streak
                      </Text>
                    </Card>
                  </View>

                  {/* Quick Practice - Larger */}
                  {recentSets.length > 0 && (
                    <TouchableOpacity
                      onPress={() => router.push(`/sets/${recentSets[0].id}`)}
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
                          Quick Practice
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
                            {recentSets[0].words.length} words
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              </View>

              {/* Right Column - Sets List */}
              <View style={styles.rightColumn}>
                <View style={styles.setsHeader}>
                  <Text style={[styles.setsTitle, { color: colors.text }]}>
                    My Sets
                  </Text>
                  <Text
                    style={[styles.setsCount, { color: colors.textSecondary }]}
                  >
                    {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                  </Text>
                </View>

                <View style={styles.setsList}>
                  {sets.map(set => (
                    <DesktopSetCard key={set.id} set={set} />
                  ))}
                </View>

                {/* Upgrade Account Banner for Guests */}
                {user?.isGuest && (
                  <Card
                    style={[
                      styles.upgradeCard,
                      { borderColor: colors.primary },
                    ]}
                  >
                    <View style={styles.upgradeContent}>
                      <View
                        style={[
                          styles.upgradeIconContainer,
                          { backgroundColor: `${colors.primary}20` },
                        ]}
                      >
                        <Ionicons
                          name="rocket"
                          size={32}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.upgradeTextContainer}>
                        <Text
                          style={[styles.upgradeTitle, { color: colors.text }]}
                        >
                          Create a Full Account
                        </Text>
                        <Text
                          style={[
                            styles.upgradeDescription,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Sync your data across devices and never lose your
                          progress
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.upgradeButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => router.push('/(auth)/login?mode=signup')}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.upgradeButtonText}>
                          Create Account
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
              </View>
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
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
  leftColumn: {
    width: 380,
    gap: Spacing.lg,
  },
  rightColumn: {
    flex: 1,
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
    marginBottom: Spacing.lg,
  },
  setsTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
  },
  setsCount: {
    ...Typography.body,
    fontSize: 16,
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
  upgradeCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 2,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
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
    ...Typography.body,
    fontSize: 14,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    ...Shadow.button,
  },
  upgradeButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
