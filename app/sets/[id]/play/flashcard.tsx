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
import { Button } from '@/components/ui/Button';
import { WordPair } from '@/lib/types';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} of {shuffledWords.length}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.content}>
        <Pressable onPress={flipCard} style={styles.cardContainer}>
          <Animated.View style={[styles.card, frontAnimatedStyle]}>
            <Text style={styles.cardText}>{currentWord.word}</Text>
            <Text style={styles.cardHint}>Tap to flip</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardText}>{currentWord.translation}</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progress: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerPlaceholder: {
    width: 28,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  cardContainer: {
    height: 400,
    marginVertical: Spacing.xl,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardBack: {
    backgroundColor: Colors.primary,
  },
  cardText: {
    ...Typography.h1,
    fontSize: 36,
    color: Colors.text,
    textAlign: 'center',
  },
  cardHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
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
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
