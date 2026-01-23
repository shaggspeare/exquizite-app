// Desktop Set Card with internal controls and clean design
import { TouchableOpacity, Text, StyleSheet, View, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('games');
  const { colors } = useTheme();
  const { deleteSet } = useSets();
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getGradientColors = (): [string, string] => {
    const hash = set.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients: [string, string][] = [
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
    if (!dateString) return t('common:time.never');
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('common:time.today');
    if (diffDays === 1) return t('common:time.yesterday');
    if (diffDays < 7) return t('common:time.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  const handleEditPress = () => {
    setShowMenu(false);
    router.push(`/(tabs)/sets/${set.id}`);
  };

  const handleSharePress = () => {
    setShowMenu(false);
    setShowShareModal(true);
  };

  const handleDeletePress = () => {
    setShowMenu(false);
    showAlert(
      t('setCard.deleteSet'),
      t('setCard.deleteConfirm', { setName: set.name }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:buttons.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSet(set.id);
            } catch (error: any) {
              showAlert(
                t('common:status.error'),
                error?.message || 'Failed to delete set. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handlePlayPress = () => {
    router.push(`/(tabs)/sets/${set.id}/play/template`);
  };

  const gradientColors = getGradientColors();

  return (
    <View style={styles.cardContainer}>
      {/* Backdrop to close menu - placed first so it's behind everything */}
      {showMenu && (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setShowMenu(false)}
        />
      )}

      {/* Featured badge */}
      {set.isFeatured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={10} color="#000" />
          <Text style={styles.featuredBadgeText}>{t('setCard.featured')}</Text>
        </View>
      )}

      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Three-dot menu button - Top right */}
          {!set.isFeatured && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(!showMenu)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Card Content */}
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => router.push(`/(tabs)/sets/${set.id}`)}
            activeOpacity={0.9}
          >
            {/* Title and Word Count */}
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {set.name}
              </Text>
              <View style={styles.wordBadge}>
                <Ionicons name="book" size={12} color="#FFFFFF" />
                <Text style={styles.wordBadgeText}>{set.words.length}</Text>
              </View>
            </View>

            {/* Progress Section */}
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
                {t('setCard.complete', { percent: Math.min(Math.round((set.words.length / 20) * 100), 100) })}
              </Text>
            </View>

            {/* Last Practiced */}
            {set.lastPracticed && (
              <View style={styles.metaRow}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.metaText}>
                  {t('setCard.lastPracticed', { date: formatDate(set.lastPracticed) })}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Play Button - Internal at bottom */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPress}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={18} color={gradientColors[0]} />
            <Text style={[styles.playButtonText, { color: gradientColors[0] }]}>
              {t('common:buttons.play')}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu Dropdown - placed outside gradient so it can overflow */}
        {showMenu && (
          <View style={[styles.menuDropdown, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditPress}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {t('common:buttons.edit')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {t('common:buttons.share')}
              </Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                {t('common:buttons.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  cardContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  cardWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  gradientCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.lg,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.card,
  },
  menuButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  menuDropdown: {
    position: 'absolute',
    top: Spacing.md + 36,
    right: Spacing.md,
    borderRadius: BorderRadius.input,
    paddingVertical: Spacing.xs,
    minWidth: 160,
    zIndex: 100,
    ...Shadow.cardDeep,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  menuItemText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  menuBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 5,
  },
  featuredBadge: {
    position: 'absolute',
    top: -Spacing.xs,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,215,0,0.9)',
    zIndex: 20,
    ...Shadow.button,
  },
  featuredBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingRight: 40,
  },
  title: {
    ...Typography.h2,
    fontSize: 18,
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
    marginBottom: Spacing.sm,
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
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    alignSelf: 'center',
    minWidth: 120,
    zIndex: 1,
    ...Shadow.button,
  },
  playButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '700',
  },
});
