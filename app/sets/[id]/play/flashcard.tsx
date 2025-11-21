import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { WordPair } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function FlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById, updateLastPracticed } = useSets();
  const { colors } = useTheme();

  const set = getSetById(id!);
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const rotation = useSharedValue(0);

  // Shuffle words on mount
  useEffect(() => {
    if (set) {
      setShuffledWords(shuffleArray(set.words));
    }
  }, [set]);

  // All hooks must be called before any conditional returns
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  // Conditional returns after all hooks
  if (!set || set.words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No words in this set</Text>
      </SafeAreaView>
    );
  }

  if (shuffledWords.length === 0) {
    return null; // Wait for shuffle to complete
  }

  const currentWord = shuffledWords[currentIndex];

  const flipCard = () => {
    rotation.value = withSpring(rotation.value === 0 ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });
  };

  const goToNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      rotation.value = 0;
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      rotation.value = 0;
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    updateLastPracticed(id!);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.progress, { color: colors.text }]}>
          {currentIndex + 1} of {shuffledWords.length}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={['#5B9EFF', '#E066FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.content}>
        <Pressable onPress={flipCard} style={styles.cardContainer}>
          <Animated.View style={[styles.card, { backgroundColor: colors.card }, frontAnimatedStyle]}>
            <Ionicons name="language" size={48} color={colors.primary} style={{ marginBottom: Spacing.lg }} />
            <Text style={[styles.cardText, { color: colors.text }]}>{currentWord.word}</Text>
            <View style={[styles.tapHint, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="hand-left-outline" size={16} color={colors.primary} />
              <Text style={[styles.cardHint, { color: colors.primary }]}>Tap to flip</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <LinearGradient
              colors={['#5B9EFF', '#E066FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBackGradient}
            >
              <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" style={{ marginBottom: Spacing.lg }} />
              <Text style={[styles.cardText, styles.cardTextBack]}>{currentWord.translation}</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <View style={styles.navigation}>
          <Button
            title="Previous"
            onPress={goToPrevious}
            variant="outline"
            disabled={currentIndex === 0}
            style={styles.navButton}
          />
          {currentIndex === shuffledWords.length - 1 ? (
            <Button
              title="Complete"
              onPress={handleComplete}
              style={styles.navButton}
            />
          ) : (
            <Button
              title="Next"
              onPress={goToNext}
              style={styles.navButton}
            />
          )}
        </View>
      </View>
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
  },
  progress: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 18,
  },
  headerPlaceholder: {
    width: 28,
  },
  progressBar: {
    height: 6,
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  cardContainer: {
    height: 450,
    marginVertical: Spacing.xl,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.cardDeep,
  },
  cardBack: {
    padding: 0,
    overflow: 'hidden',
  },
  cardBackGradient: {
    width: '100%',
    height: '100%',
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.cardLarge,
  },
  cardText: {
    ...Typography.display,
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardTextBack: {
    color: '#FFFFFF',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.xl,
  },
  cardHint: {
    ...Typography.caption,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
