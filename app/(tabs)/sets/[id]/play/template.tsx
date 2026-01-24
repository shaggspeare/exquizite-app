import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { GameMode } from '@/lib/types';
import { useResponsive } from '@/hooks/useResponsive';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { useTranslation } from 'react-i18next';

interface GameTemplate {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: GameMode;
  aiEnabled?: boolean;
  gradientColors: [string, string];
}

const getTemplates = (t: any): GameTemplate[] => [
  {
    id: 'flashcard',
    title: t('templates.flashcard.name'),
    description: t('templates.flashcard.description'),
    icon: 'layers',
    route: 'flashcard',
    aiEnabled: false,
    gradientColors: ['#4A90E2', '#5B9EFF'],
  },
  {
    id: 'match',
    title: t('templates.match.name'),
    description: t('templates.match.description'),
    icon: 'git-compare',
    route: 'match',
    gradientColors: ['#B537F2', '#E066FF'],
  },
  {
    id: 'quiz',
    title: t('templates.quiz.name'),
    description: t('templates.quiz.description'),
    icon: 'help-circle',
    route: 'quiz',
    aiEnabled: false,
    gradientColors: ['#00D4FF', '#00E5A0'],
  },
  {
    id: 'fill-blank',
    title: t('templates.fillBlank.name'),
    description: t('templates.fillBlank.description'),
    icon: 'create',
    route: 'fill-blank',
    aiEnabled: false,
    gradientColors: ['#FF6B35', '#FFBB00'],
  },
];


interface GameCardProps {
  template: GameTemplate;
  onPress: () => void;
  practiceCount: number;
}

function GameCard({ template, onPress, practiceCount }: GameCardProps) {
  const scale = useSharedValue(1);

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

  return (
    <Animated.View style={[styles.gameCardWrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={template.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gameCard}
        >
          <View style={styles.gameCardContent}>
            <View style={styles.iconCircle}>
              <Ionicons name={template.icon} size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.gameTitle}>{template.title}</Text>
            <Text style={styles.gameDescription}>{template.description}</Text>
            {template.aiEnabled && (
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>{template.id === 'fill-blank' ? 'templates.fillBlank.aiHints' : 'AI hints available'}</Text>
              </View>
            )}
          </View>
          {practiceCount > 0 && (
            <View style={styles.practiceCountBadge}>
              <Ionicons name="refresh" size={14} color="#FFFFFF" />
              <Text style={styles.practiceCountText}>{practiceCount}</Text>
            </View>
          )}
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TemplateSelectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation('games');
  const { getPracticeStats } = useSets();

  const templates = getTemplates(t);
  const stats = getPracticeStats(id || '');
  const modeStats = stats.byMode;

  const handleSelectTemplate = (template: GameTemplate) => {
    router.push(`/(tabs)/sets/${id}/play/${template.route}`);
  };

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
                <TouchableOpacity
                  onPress={() => router.back()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {t('chooseActivity')}
                </Text>
                <View style={styles.headerPlaceholder} />
              </View>
            </DesktopContainer>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DesktopContainer>
              <View style={styles.desktopGrid}>
                {templates.map(template => (
                  <View key={template.id} style={styles.desktopGridItem}>
                    <GameCard
                      template={template}
                      onPress={() => handleSelectTemplate(template)}
                      practiceCount={modeStats[template.route] || 0}
                    />
                  </View>
                ))}
              </View>
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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('chooseActivity')}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {templates.map(template => (
          <GameCard
            key={template.id}
            template={template}
            onPress={() => handleSelectTemplate(template)}
            practiceCount={modeStats[template.route] || 0}
          />
        ))}
      </ScrollView>
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
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
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
  gameCardWrapper: {
    marginBottom: Spacing.lg,
  },
  gameCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    minHeight: 160,
    ...Shadow.cardDeep,
    position: 'relative',
  },
  gameCardContent: {
    flex: 1,
    paddingRight: 72,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gameTitle: {
    ...Typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  gameDescription: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.sm,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -28 }],
  },
  practiceCountBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  practiceCountText: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
  desktopContent: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingVertical: Spacing.xxl,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  desktopGridItem: {
    width: 'calc(50% - 12px)' as any,
    minWidth: 300,
  },
});
