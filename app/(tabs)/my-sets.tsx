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
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SetCard } from '@/components/set/SetCard';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopMySetsView } from '@/components/sets/DesktopMySetsView';
import { useTranslation } from 'react-i18next';

export default function MySetsScreen() {
  const { user } = useAuth();
  const { sets, refreshSets } = useSets();
  const { colors } = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation('games');

  // Filter out featured sets to only show user-created sets
  const userSets = sets.filter(set => !set.isFeatured);

  // Use desktop layout for desktop screens
  if (isDesktop) {
    return (
      <DesktopLayout>
        <DesktopMySetsView />
      </DesktopLayout>
    );
  }

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('mySets.title')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/create')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
        {userSets.length > 0 ? (
          <>
            {userSets.map(set => (
              <SetCard key={set.id} set={set} />
            ))}

            {/* Upgrade Account Banner for Guests */}
            {user?.isGuest && (
              <Card
                style={[styles.upgradeCard, { borderColor: colors.primary }]}
              >
                <View style={styles.upgradeContent}>
                  <View
                    style={[
                      styles.upgradeIconContainer,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <Ionicons name="rocket" size={28} color={colors.primary} />
                  </View>
                  <View style={styles.upgradeTextContainer}>
                    <Text style={[styles.upgradeTitle, { color: colors.text }]}>
                      Create a Full Account
                    </Text>
                    <Text
                      style={[
                        styles.upgradeDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Sync your data and never lose your progress
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => router.push('/(auth)/login?mode=signup')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.upgradeButtonText}>Create Account</Text>
                </TouchableOpacity>
              </Card>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
  upgradeCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 2,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  upgradeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  upgradeDescription: {
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 18,
  },
  upgradeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    ...Shadow.button,
  },
  upgradeButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
