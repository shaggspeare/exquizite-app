// Desktop Set Card with external play button
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { WordSet } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShareModal } from './ShareModal';
import { showAlert } from '@/lib/alert';

interface DesktopSetCardProps {
  set: WordSet;
}

export function DesktopSetCard({ set }: DesktopSetCardProps) {
  const { colors } = useTheme();
  const { deleteSet } = useSets();
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);

  const getGradientColors = () => {
    const hash = set.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

  const gradientColors = getGradientColors();

  return (
    <View style={styles.horizontalContainer}>
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => router.push(`/sets/${set.id}`)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {set.name}
              </Text>
              {/* Word count badge */}
              <View style={styles.wordBadge}>
                <Ionicons name="book" size={12} color="#FFFFFF" />
                <Text style={styles.wordBadgeText}>{set.words.length}</Text>
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
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>
                  {formatDate(set.lastPracticed)}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Action Buttons on the Right */}
      <View style={styles.actionsColumn}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/sets/${set.id}/play/template`)}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>

        <View style={styles.iconButtonsRow}>
          <TouchableOpacity
            style={[styles.smallIconButton, { backgroundColor: colors.card }]}
            onPress={() => setShowShareModal(true)}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallIconButton, { backgroundColor: colors.card }]}
            onPress={handleDeletePress}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ShareModal
        visible={showShareModal}
        set={set}
        onClose={() => setShowShareModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardWrapper: {
    flex: 1,
  },
  gradientCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.lg,
    minHeight: 110,
    ...Shadow.card,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: Spacing.sm,
  },
  wordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  wordBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 5,
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
    fontSize: 11,
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
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  actionsColumn: {
    flexDirection: 'column',
    gap: Spacing.sm,
    minWidth: 120,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.button,
    gap: Spacing.xs,
    ...Shadow.button,
  },
  playButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  iconButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  smallIconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
});
