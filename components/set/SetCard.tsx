import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { WordSet } from '@/lib/types';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface SetCardProps {
  set: WordSet;
  onPress?: () => void;
}

export function SetCard({ set, onPress }: SetCardProps) {
  const { colors } = useTheme();
  const { deleteSet } = useSets();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
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
    Alert.alert(
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

  const wordPairsList = set.words
    .map(word => word.word)
    .join(', ');

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{set.name}</Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="book" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {set.words.length} {set.words.length === 1 ? 'word' : 'words'}
            </Text>
          </View>

          {set.lastPracticed && (
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatDate(set.lastPracticed)}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((set.words.length / 20) * 100, 100)}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.wordListContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.wordListText, { color: colors.textSecondary }]}>
              {wordPairsList || 'No words in this set'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayPress}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Practice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  expandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  wordListContainer: {
    padding: Spacing.md,
    borderRadius: 8,
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
    borderRadius: 8,
    gap: Spacing.xs,
  },
  playButton: {
    // backgroundColor set dynamically
  },
  deleteButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
