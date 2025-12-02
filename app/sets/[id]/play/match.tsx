import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '@/lib/alert';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface MatchItem {
  id: string;
  text: string;
  isWord: boolean;
  matched: boolean;
}

export default function MatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById, updateLastPracticed } = useSets();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  const set = getSetById(id!);
  const [words, setWords] = useState<MatchItem[]>([]);
  const [translations, setTranslations] = useState<MatchItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (set) {
      initializeGame();
    }
  }, [set]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeGame = () => {
    if (!set) return;

    const wordItems: MatchItem[] = shuffleArray(
      set.words.map(w => ({
        id: w.id,
        text: w.word,
        isWord: true,
        matched: false,
      }))
    );

    const translationItems: MatchItem[] = shuffleArray(
      set.words.map(w => ({
        id: w.id,
        text: w.translation,
        isWord: false,
        matched: false,
      }))
    );

    setWords(wordItems);
    setTranslations(translationItems);
  };

  const handleWordPress = (item: MatchItem) => {
    if (item.matched) return;

    if (selectedWord === item.id) {
      setSelectedWord(null);
    } else {
      setSelectedWord(item.id);
      if (selectedTranslation) {
        checkMatch(item.id, selectedTranslation);
      }
    }
  };

  const handleTranslationPress = (item: MatchItem) => {
    if (item.matched) return;

    if (selectedTranslation === item.id) {
      setSelectedTranslation(null);
    } else {
      setSelectedTranslation(item.id);
      if (selectedWord) {
        checkMatch(selectedWord, item.id);
      }
    }
  };

  const checkMatch = (wordId: string, translationId: string) => {
    if (wordId === translationId) {
      // Correct match
      setWords(prev =>
        prev.map(w => (w.id === wordId ? { ...w, matched: true } : w))
      );
      setTranslations(prev =>
        prev.map(t => (t.id === translationId ? { ...t, matched: true } : t))
      );
      setScore(score + 1);
      setSelectedWord(null);
      setSelectedTranslation(null);

      // Check if game is complete
      if (score + 1 === set!.words.length) {
        setTimeout(() => handleComplete(), 500);
      }
    } else {
      // Wrong match - shake animation would go here
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
      }, 500);
    }
  };

  const handleComplete = () => {
    updateLastPracticed(id!);
    showAlert(
      'Congratulations!',
      `You completed the match game in ${formatTime(timer)}!`,
      [
        { text: 'Play Again', onPress: initializeGame },
        { text: 'Done', onPress: () => router.back() },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!set || set.words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No words in this set</Text>
      </SafeAreaView>
    );
  }

  if (isDesktop) {
    return (
      <DesktopLayout>
        <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.desktopHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <DesktopContainer>
              <View style={styles.desktopHeaderContent}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.desktopTitle, { color: colors.text }]}>
                  Match: {set.name}
                </Text>
                <View style={styles.stats}>
                  <View style={[styles.statBadge, { backgroundColor: `${colors.ai}20` }]}>
                    <Ionicons name="timer" size={18} color={colors.ai} />
                    <Text style={[styles.statText, { color: colors.ai }]}>{formatTime(timer)}</Text>
                  </View>
                  <View style={[styles.statBadge, { backgroundColor: `${colors.success}20` }]}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={[styles.statText, { color: colors.success }]}>{score}/{set.words.length}</Text>
                  </View>
                </View>
              </View>
            </DesktopContainer>
          </View>

          {/* Content */}
          <View style={styles.desktopContentWrapper}>
            <View style={styles.desktopContent}>
              <View style={styles.desktopColumns}>
                <View style={styles.desktopColumn}>
                  <LinearGradient
                    colors={['#B537F2', '#E066FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.columnHeader}
                  >
                    <Ionicons name="language" size={24} color="#FFFFFF" />
                    <Text style={styles.columnTitle}>Words</Text>
                  </LinearGradient>
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    {words.map(item => (
                      <MatchCard
                        key={item.id}
                        item={item}
                        isSelected={selectedWord === item.id}
                        onPress={() => handleWordPress(item)}
                        colors={colors}
                        accentColor="#B537F2"
                      />
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.desktopColumn}>
                  <LinearGradient
                    colors={['#00D4FF', '#00E5A0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.columnHeader}
                  >
                    <Ionicons name="text" size={24} color="#FFFFFF" />
                    <Text style={styles.columnTitle}>Translations</Text>
                  </LinearGradient>
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    {translations.map(item => (
                      <MatchCard
                        key={item.id}
                        item={item}
                        isSelected={selectedTranslation === item.id}
                        onPress={() => handleTranslationPress(item)}
                        colors={colors}
                        accentColor="#00D4FF"
                      />
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </DesktopLayout>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <View style={[styles.statBadge, { backgroundColor: `${colors.ai}20` }]}>
            <Ionicons name="timer" size={18} color={colors.ai} />
            <Text style={[styles.statText, { color: colors.ai }]}>{formatTime(timer)}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: `${colors.success}20` }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.statText, { color: colors.success }]}>{score}/{set.words.length}</Text>
          </View>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.columns}>
          <View style={styles.column}>
            <LinearGradient
              colors={['#B537F2', '#E066FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.columnHeader}
            >
              <Ionicons name="language" size={20} color="#FFFFFF" />
              <Text style={styles.columnTitle}>Words</Text>
            </LinearGradient>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {words.map(item => (
                <MatchCard
                  key={item.id}
                  item={item}
                  isSelected={selectedWord === item.id}
                  onPress={() => handleWordPress(item)}
                  colors={colors}
                  accentColor="#B537F2"
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.column}>
            <LinearGradient
              colors={['#00D4FF', '#00E5A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.columnHeader}
            >
              <Ionicons name="text" size={20} color="#FFFFFF" />
              <Text style={styles.columnTitle}>Translations</Text>
            </LinearGradient>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {translations.map(item => (
                <MatchCard
                  key={item.id}
                  item={item}
                  isSelected={selectedTranslation === item.id}
                  onPress={() => handleTranslationPress(item)}
                  colors={colors}
                  accentColor="#00D4FF"
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface MatchCardProps {
  item: MatchItem;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  accentColor: string;
}

function MatchCard({ item, isSelected, onPress, colors, accentColor }: MatchCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!item.matched) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getBorderColor = () => {
    if (item.matched) return colors.success;
    if (isSelected) return accentColor;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (item.matched) return `${colors.success}15`;
    if (isSelected) return `${accentColor}15`;
    return colors.card;
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={item.matched}
        style={[
          styles.matchCard,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            opacity: item.matched ? 0.5 : 1,
          },
        ]}
        activeOpacity={1}
      >
        <Text style={[styles.matchCardText, { color: colors.text }]}>
          {item.text}
        </Text>
        {item.matched && (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        )}
      </TouchableOpacity>
    </Animated.View>
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
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 14,
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  columnTitle: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  matchCard: {
    borderRadius: BorderRadius.button,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 3,
    minHeight: 64,
    ...Shadow.card,
  },
  matchCardText: {
    ...Typography.body,
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
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
  desktopTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  desktopContentWrapper: {
    flex: 1, // Maintain flex chain for height constraint
    width: '100%',
    alignSelf: 'center',
    maxWidth: 1400, // Same as MAX_CONTENT_WIDTH
    paddingHorizontal: 32, // Same as DesktopContainer padding
  },
  desktopContent: {
    flex: 1,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: Spacing.xl,
    flex: 1,
  },
  desktopColumn: {
    flex: 1,
  },
});
