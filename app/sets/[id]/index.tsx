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
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function SetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById } = useSets();

  const set = getSetById(id!);

  if (!set) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Set not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {set.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/create?editId=${id}`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Ionicons name="book" size={32} color={Colors.primary} />
              <Text style={styles.statValue}>{set.words.length}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Words in this set</Text>
        {set.words.map((pair, index) => (
          <Card key={pair.id} style={styles.wordCard}>
            <View style={styles.wordCardContent}>
              <Text style={styles.wordNumber}>{index + 1}</Text>
              <View style={styles.wordPair}>
                <Text style={styles.word}>{pair.word}</Text>
                <Text style={styles.translation}>{pair.translation}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.text,
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
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.text,
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
    color: Colors.textSecondary,
    fontWeight: '600',
    width: 24,
  },
  wordPair: {
    flex: 1,
  },
  word: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  translation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
