import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { WordSet } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ShareModal } from './ShareModal';
import { showAlert } from '@/lib/alert';

interface SetCardProps {
  set: WordSet;
  onPress?: () => void;
}

export function SetCard({ set, onPress }: SetCardProps) {
  const { colors } = useTheme();
  const { deleteSet } = useSets();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const scale = useSharedValue(1);

  // Generate a consistent gradient based on set ID
  const getGradientColors = () => {
    const hash = set.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      ['#4A90E2', '#5B9EFF'],      // Blue
      ['#B537F2', '#E066FF'],      // Purple
      ['#00D4FF', '#06593f'],      // Teal/Dark
      ['#EF4444', '#F97316'],      // Red/Orange
      ['#EC4899', '#F472B6'],      // Pink
      ['#10B981', '#059669'],      // Green
      ['#581C87', '#7C3AED'],      // Deep Purple
      ['#FF006E', '#8338EC'],      // Pink/Purple
      ['#FF9E00', '#FF0099'],      // Orange/Pink
    ];
    return gradients[hash % gradients.length];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handlePlayPress = () => {
    router.push(`/sets/${set.id}`);
  };

  const handleDeletePress = () => {
    showAlert(
      'Delete Set',
      `Are you sure you want to delete "${set.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSet(set.id),
        },
      ]
    );
  };

  const handleSharePress = () => {
    setShowShareModal(true);
  };

  const wordPairsList = set.words
    .map(word => word.word)
    .join(', ');

  const gradientColors = getGradientColors();

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{set.name}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((set.words.length / 20) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((set.words.length / 20) * 100)}% complete
              </Text>
            </View>

            {set.lastPracticed && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>
                  Last practiced {formatDate(set.lastPracticed)}
                </Text>
              </View>
            )}
          </View>

          {/* Word count badge at top right */}
          <View style={[styles.wordBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Ionicons name="book" size={14} color="#FFFFFF" />
            <Text style={styles.wordBadgeText}>
              {set.words.length}
            </Text>
          </View>

          {/* Always visible practice button */}
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={(e) => {
              e.stopPropagation();
              handlePlayPress();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {isExpanded && (
          <View style={[styles.expandedContent, { backgroundColor: colors.card }]}>
            <View style={[styles.wordListContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.wordListText, { color: colors.textSecondary }]}>
                {wordPairsList || 'No words in this set'}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleSharePress}
                activeOpacity={0.7}
              >
                <Ionicons name="share-social" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={handleDeletePress}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <ShareModal
        visible={showShareModal}
        set={set}
        onClose={() => setShowShareModal(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  gradientCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.lg,
    minHeight: 140,
    ...Shadow.cardDeep,
  },
  cardContent: {
    position: 'relative',
    paddingRight: 60,
  },
  header: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  wordBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  wordBadgeText: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    ...Typography.small,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  expandedContent: {
    borderBottomLeftRadius: BorderRadius.cardLarge,
    borderBottomRightRadius: BorderRadius.cardLarge,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    marginTop: -BorderRadius.card,
  },
  wordListContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.input,
    marginBottom: Spacing.md,
  },
  wordListText: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    gap: Spacing.xs,
    ...Shadow.button,
  },
  actionButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  practiceButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
});
