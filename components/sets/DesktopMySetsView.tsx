import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DesktopSetCard } from '@/components/set/DesktopSetCard';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';

export function DesktopMySetsView() {
  const { user } = useAuth();
  const { sets } = useSets();
  const { colors } = useTheme();
  const router = useRouter();

  // Filter out featured sets to only show user-created sets
  const userSets = sets.filter(set => !set.isFeatured);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={80} color={colors.textSecondary} />
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <DesktopContainer>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>My Sets</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Set</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {userSets.length > 0 ? (
          <>
            <View style={styles.setsGrid}>
              {userSets.map(set => (
                <DesktopSetCard key={set.id} set={set} />
              ))}
            </View>

            {/* Upgrade Account Banner for Guests */}
            {user?.isGuest && (
              <Card style={[styles.upgradeCard, { borderColor: colors.primary }]}>
                <View style={styles.upgradeContent}>
                  <View style={[styles.upgradeIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                    <Ionicons name="rocket" size={32} color={colors.primary} />
                  </View>
                  <View style={styles.upgradeTextContainer}>
                    <Text style={[styles.upgradeTitle, { color: colors.text }]}>
                      Create a Full Account
                    </Text>
                    <Text style={[styles.upgradeDescription, { color: colors.textSecondary }]}>
                      Sync your data across devices and never lose your progress
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(auth)/login?mode=signup')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.upgradeButtonText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </>
        ) : (
          renderEmptyState()
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  setsGrid: {
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
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
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
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  upgradeCard: {
    padding: Spacing.xl,
    marginTop: Spacing.xl,
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
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  upgradeDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    ...Shadow.button,
  },
  upgradeButtonText: {
    ...Typography.body,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
