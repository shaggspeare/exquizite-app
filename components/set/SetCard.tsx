import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { WordSet } from '@/lib/types';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface SetCardProps {
  set: WordSet;
  onPress: () => void;
}

export function SetCard({ set, onPress }: SetCardProps) {
  const { colors } = useTheme();
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>{set.name}</Text>

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
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    marginBottom: Spacing.sm,
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
});
