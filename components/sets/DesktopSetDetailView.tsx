// Desktop set detail view with bento layout
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { LinearGradient } from 'expo-linear-gradient';

export function DesktopSetDetailView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById } = useSets();
  const { colors } = useTheme();

  const set = getSetById(id!);

  if (!set) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Set not found</Text>
      </View>
    );
  }

  const practiceOptions = [
    { id: 'flashcard', name: 'Flashcards', icon: 'albums', gradient: ['#5B9EFF', '#E066FF'] },
    { id: 'match', name: 'Match', icon: 'grid', gradient: ['#00D4FF', '#00E5A0'] },
    { id: 'quiz', name: 'Quiz', icon: 'help-circle', gradient: ['#FF6B9D', '#C06BFF'] },
    { id: 'fill-blank', name: 'Fill in the Blank', icon: 'create', gradient: ['#FFB84D', '#FF6B6B'] },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <DesktopContainer>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{set.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/create?editId=${id}`)}
              style={[styles.editButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Set</Text>
            </TouchableOpacity>
          </View>
        </DesktopContainer>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DesktopContainer>
          <View style={styles.bentoLayout}>
            {/* Left Column - Stats & Info */}
            <View style={styles.leftColumn}>
              <Card style={styles.statsCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="book" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{set.words.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Words</Text>
              </Card>

              <Card style={styles.infoCard}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Languages</Text>
                <View style={styles.infoRow}>
                  <View style={styles.languageTag}>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    <Text style={[styles.languageText, { color: colors.text }]}>{set.targetLanguage?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.languageTag}>
                    <Ionicons name="language" size={16} color={colors.textSecondary} />
                    <Text style={[styles.languageText, { color: colors.text }]}>{set.nativeLanguage?.toUpperCase()}</Text>
                  </View>
                </View>
              </Card>

              {/* Practice Options */}
              <View style={styles.practiceSection}>
                <Text style={[styles.practiceTitle, { color: colors.text }]}>Practice Modes</Text>
                {practiceOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => router.push(`/sets/${id}/play/${option.id}`)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={option.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.practiceCard}
                    >
                      <Ionicons name={option.icon as any} size={28} color="#FFFFFF" />
                      <Text style={styles.practiceCardText}>{option.name}</Text>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Right Column - Word List */}
            <View style={styles.rightColumn}>
              <View style={styles.wordsHeader}>
                <Text style={[styles.wordsTitle, { color: colors.text }]}>Word List</Text>
                <Text style={[styles.wordsCount, { color: colors.textSecondary }]}>
                  {set.words.length} {set.words.length === 1 ? 'word' : 'words'}
                </Text>
              </View>
              <View style={styles.wordsGrid}>
                {set.words.map((pair, index) => (
                  <Card key={pair.id} style={styles.wordCard}>
                    <View style={styles.wordCardContent}>
                      <View style={[styles.wordNumber, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.wordNumberText, { color: colors.primary }]}>{index + 1}</Text>
                      </View>
                      <View style={styles.wordPair}>
                        <Text style={[styles.word, { color: colors.text }]}>{pair.word}</Text>
                        <Text style={[styles.translation, { color: colors.textSecondary }]}>{pair.translation}</Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          </View>
        </DesktopContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    ...Shadow.button,
  },
  editButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xxl,
  },
  bentoLayout: {
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  leftColumn: {
    width: 380,
    gap: Spacing.lg,
  },
  rightColumn: {
    flex: 1,
  },
  statsCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  statIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    ...Typography.h1,
    fontSize: 48,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 14,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  infoTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#5B9EFF20',
    borderRadius: BorderRadius.button,
  },
  languageText: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
  },
  practiceSection: {
    gap: Spacing.sm,
  },
  practiceTitle: {
    ...Typography.h3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.card,
    ...Shadow.card,
  },
  practiceCardText: {
    ...Typography.body,
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  wordsTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
  },
  wordsCount: {
    ...Typography.body,
    fontSize: 16,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  wordCard: {
    padding: Spacing.md,
    width: 'calc(50% - 8px)' as any, // 2 columns
    minWidth: 280,
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wordNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordNumberText: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 14,
  },
  wordPair: {
    flex: 1,
  },
  word: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  translation: {
    ...Typography.caption,
    fontSize: 14,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
