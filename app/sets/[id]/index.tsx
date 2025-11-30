import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopSetDetailView } from '@/components/sets/DesktopSetDetailView';

export default function SetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById } = useSets();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  const set = getSetById(id!);

  // Use desktop layout for desktop screens
  if (isDesktop) {
    return (
      <DesktopLayout>
        <DesktopSetDetailView />
      </DesktopLayout>
    );
  }

  // Mobile layout below

  if (!set) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Set not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {set.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/create?editId=${id}`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Ionicons name="book" size={32} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{set.words.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Words</Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Words in this set</Text>
        {set.words.map((pair, index) => (
          <Card key={pair.id} style={styles.wordCard}>
            <View style={styles.wordCardContent}>
              <Text style={[styles.wordNumber, { color: colors.textSecondary }]}>{index + 1}</Text>
              <View style={styles.wordPair}>
                <Text style={[styles.word, { color: colors.text }]}>{pair.word}</Text>
                <Text style={[styles.translation, { color: colors.textSecondary }]}>{pair.translation}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title="Start Practice"
          onPress={() => router.push(`/sets/${id}/play/template`)}
        />
      </View>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h1,
    fontSize: 24,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  wordCard: {
    marginBottom: Spacing.sm,
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wordNumber: {
    ...Typography.body,
    fontWeight: '600',
    width: 24,
  },
  wordPair: {
    flex: 1,
  },
  word: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  translation: {
    ...Typography.caption,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
