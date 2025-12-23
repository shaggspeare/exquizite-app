import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { useAuth } from '@/contexts/AuthContext';
import { SharedSetDetails } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { showAlert } from '@/lib/alert';

export default function SharedSetScreen() {
  const { shareCode } = useLocalSearchParams<{ shareCode: string }>();
  const { colors } = useTheme();
  const { getSharedSet, copySharedSet } = useSets();
  const { user } = useAuth();
  const router = useRouter();

  const [setData, setSetData] = useState<SharedSetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareCode) {
      fetchSharedSet();
    }
  }, [shareCode]);

  const fetchSharedSet = async () => {
    if (!shareCode) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSharedSet(shareCode);
      if (data) {
        setSetData(data);
      } else {
        setError('Set not found or link is invalid');
      }
    } catch (err: any) {
      console.error('Error fetching shared set:', err);
      setError(err.message || 'Failed to load shared set');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySet = async () => {
    if (!shareCode) return;

    if (!user) {
      showAlert(
        'Sign In Required',
        'You need to sign in to save this set to your collection.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    setIsCopying(true);
    try {
      const copiedSet = await copySharedSet(shareCode);
      if (copiedSet) {
        // Show success message and redirect to home
        showAlert(
          'Success!',
          `"${copiedSet.name}" has been saved to your collection with ${copiedSet.words?.length || 0} words.`
        );
        // Redirect to home after a brief delay
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } else {
        console.error(
          'copySharedSet returned null - check console for details'
        );
        showAlert('Error', 'Failed to copy set. Please try again.');
      }
    } catch (err: any) {
      console.error('Error in handleCopySet:', err);
      showAlert(
        'Error',
        err.message || 'Failed to copy set. Please try again.'
      );
    } finally {
      setIsCopying(false);
    }
  };

  // Generate gradient colors based on set ID
  const getGradientColors = () => {
    if (!setData) return ['#4A90E2', '#5B9EFF'];
    const hash = setData.setId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      ['#4A90E2', '#5B9EFF'],
      ['#B537F2', '#E066FF'],
      ['#00D4FF', '#06593f'],
      ['#EF4444', '#F97316'],
      ['#EC4899', '#F472B6'],
      ['#10B981', '#059669'],
      ['#581C87', '#7C3AED'],
      ['#FF006E', '#8338EC'],
      ['#FF9E00', '#FF0099'],
    ];
    return gradients[hash % gradients.length];
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading shared set...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !setData) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {error || 'Set not found'}
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            This share link may be invalid, expired, or deactivated.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const gradientColors = getGradientColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Shared Set
          </Text>
          <View style={styles.headerButton} />
        </View>

        {/* Set Card */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.setCard}
        >
          <View style={styles.setHeader}>
            <Ionicons name="share-social-outline" size={32} color="#FFFFFF" />
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="book" size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>{setData.wordCount} words</Text>
              </View>
            </View>
          </View>

          <Text style={styles.setName}>{setData.name}</Text>

          <View style={styles.languageInfo}>
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>
                {setData.targetLanguage.toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>
                {setData.nativeLanguage.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.authorInfo}>
            <Ionicons
              name="person-circle-outline"
              size={20}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.authorText}>
              Created by {setData.author.name}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {setData.shareInfo.viewCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Views
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.stat}>
            <Ionicons name="copy-outline" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {setData.shareInfo.copyCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Copies
            </Text>
          </View>
        </View>

        {/* Word Preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              Word Preview
            </Text>
            <Text
              style={[styles.previewCount, { color: colors.textSecondary }]}
            >
              {Math.min(5, setData.words.length)} of {setData.wordCount}
            </Text>
          </View>

          {setData.words.slice(0, 5).map((word, index) => (
            <View
              key={word.id}
              style={[
                styles.wordItem,
                { borderBottomColor: colors.border },
                index === Math.min(4, setData.words.length - 1) &&
                  styles.wordItemLast,
              ]}
            >
              <View style={styles.wordContent}>
                <Text style={[styles.wordText, { color: colors.text }]}>
                  {word.word}
                </Text>
                <Text
                  style={[
                    styles.translationText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {word.translation}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          ))}

          {setData.words.length > 5 && (
            <Text style={[styles.moreText, { color: colors.textSecondary }]}>
              + {setData.words.length - 5} more words
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={handleCopySet}
          disabled={isCopying}
          activeOpacity={0.8}
        >
          {isCopying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Save to My Sets</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    padding: Spacing.lg,
    paddingBottom: 100, // Space for action bar
    maxWidth: Platform.OS === 'web' ? 800 : undefined,
    width: '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    ...Typography.h2,
    textAlign: 'center',
  },
  errorMessage: {
    ...Typography.body,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.lg,
  },
  backButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Platform.OS === 'web' ? Spacing.md : 0,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
  },
  setCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Platform.OS === 'web' ? Spacing.xl * 1.5 : Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.cardDeep,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  badgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  setName: {
    ...Typography.h1,
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: Spacing.md,
    fontWeight: '700',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  languageBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.input,
  },
  languageText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  authorText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.card,
    padding: Platform.OS === 'web' ? Spacing.xl : Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadow.card,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  statValue: {
    ...Typography.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.small,
  },
  previewCard: {
    borderRadius: BorderRadius.card,
    padding: Platform.OS === 'web' ? Spacing.xl : Spacing.lg,
    ...Shadow.card,
    marginBottom: Platform.OS === 'web' ? Spacing.xl : 0,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewTitle: {
    ...Typography.h3,
  },
  previewCount: {
    ...Typography.caption,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  wordItemLast: {
    borderBottomWidth: 0,
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  translationText: {
    ...Typography.caption,
  },
  moreText: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.button,
    gap: Spacing.sm,
    ...Shadow.button,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    minWidth: 200,
  },
  actionButtonText: {
    ...Typography.body,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
