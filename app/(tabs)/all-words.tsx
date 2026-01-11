import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { Card } from '@/components/ui/Card';

interface WordWithSet {
  word: string;
  translation: string;
  setName: string;
  setId: string;
}

export default function AllWordsScreen() {
  const router = useRouter();
  const { sets } = useSets();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation('common');

  // Get all words from all sets (exclude featured sets for user's personal words)
  const allWords: WordWithSet[] = sets
    .filter(set => !set.isFeatured)
    .flatMap(set =>
      set.words.map(word => ({
        word: word.word,
        translation: word.translation,
        setName: set.name,
        setId: set.id,
      }))
    )
    .sort((a, b) => a.word.localeCompare(b.word));

  const renderWordItem = ({ item }: { item: WordWithSet }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/sets/${item.setId}`)}
      activeOpacity={0.7}
    >
      <Card style={[styles.wordCard, { backgroundColor: colors.card }]}>
        <View style={styles.wordContent}>
          <View style={styles.wordInfo}>
            <Text style={[styles.wordText, { color: colors.text }]}>
              {item.word}
            </Text>
            <Text style={[styles.translationText, { color: colors.textSecondary }]}>
              {item.translation}
            </Text>
          </View>
          <View style={styles.setInfo}>
            <View
              style={[
                styles.setBadge,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons
                name="folder-outline"
                size={14}
                color={colors.primary}
              />
              <Text
                style={[styles.setName, { color: colors.primary }]}
                numberOfLines={1}
              >
                {item.setName}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isDesktop) {
    return (
      <DesktopLayout>
        <View
          style={[
            styles.desktopContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.desktopHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <DesktopContainer>
              <View style={styles.desktopHeaderContent}>
                <View style={styles.headerLeft}>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <View>
                    <Text style={[styles.desktopTitle, { color: colors.text }]}>
                      {t('allWords.title')}
                    </Text>
                    <Text
                      style={[
                        styles.desktopSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('allWords.subtitle', { count: allWords.length })}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.totalBadge,
                    { backgroundColor: `${colors.success}20` },
                  ]}
                >
                  <Ionicons name="book" size={20} color={colors.success} />
                  <Text style={[styles.totalText, { color: colors.success }]}>
                    {t('counts.wordCount', { count: allWords.length })}
                  </Text>
                </View>
              </View>
            </DesktopContainer>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.desktopScrollView}
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <DesktopContainer>
              <View style={styles.desktopGrid}>
                {allWords.map((item, index) => (
                  <View key={`${item.setId}-${item.word}-${index}`}>
                    {renderWordItem({ item })}
                  </View>
                ))}
              </View>
              {allWords.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="book-outline"
                    size={80}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {t('allWords.noWords')}
                  </Text>
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    {t('allWords.createSetsFirst')}
                  </Text>
                </View>
              )}
            </DesktopContainer>
          </ScrollView>
        </View>
      </DesktopLayout>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('allWords.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('allWords.subtitle', { count: allWords.length })}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <FlatList
        data={allWords}
        renderItem={renderWordItem}
        keyExtractor={(item, index) => `${item.setId}-${item.word}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="book-outline"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('allWords.noWords')}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('allWords.createSetsFirst')}
            </Text>
          </View>
        }
      />
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
    gap: Spacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 28,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  wordCard: {
    marginBottom: Spacing.xs,
    ...Shadow.card,
  },
  wordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  wordInfo: {
    flex: 1,
    gap: 2,
  },
  wordText: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '600',
  },
  translationText: {
    ...Typography.body,
    fontSize: 14,
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    maxWidth: 120,
  },
  setName: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    ...Typography.h2,
    fontSize: 24,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 300,
  },
  // Desktop styles
  desktopContainer: {
    flex: 1,
  },
  desktopHeader: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.lg,
  },
  desktopHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  desktopTitle: {
    ...Typography.h1,
    fontSize: 28,
    fontWeight: '700',
  },
  desktopSubtitle: {
    ...Typography.body,
    fontSize: 14,
    marginTop: 2,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  totalText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  desktopScrollView: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingVertical: Spacing.xxl,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
