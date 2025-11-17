import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useSets } from '@/contexts/SetsContext';
import { Button } from '@/components/ui/Button';
import { generateHint } from '@/lib/ai-helpers';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function FlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById, updateLastPracticed } = useSets();

  const set = getSetById(id!);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const rotation = useSharedValue(0);

  if (!set || set.words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No words in this set</Text>
      </SafeAreaView>
    );
  }

  const currentWord = set.words[currentIndex];

  const flipCard = () => {
    rotation.value = withSpring(rotation.value === 0 ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });
    setShowHint(false);
  };

  const goToNext = () => {
    if (currentIndex < set.words.length - 1) {
      rotation.value = 0;
      setCurrentIndex(currentIndex + 1);
      setShowHint(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      rotation.value = 0;
      setCurrentIndex(currentIndex - 1);
      setShowHint(false);
    }
  };

  const handleComplete = () => {
    updateLastPracticed(id!);
    router.back();
  };

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
          {currentIndex + 1} of {set.words.length}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / set.words.length) * 100}%` },
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
            {showHint && (
              <Text style={styles.hint}>
                {generateHint(currentWord.word, currentWord.translation)}
              </Text>
            )}
          </Animated.View>
        </Pressable>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => setShowHint(!showHint)}
            style={styles.hintButton}
          >
            <Ionicons name="sparkles" size={20} color={Colors.ai} />
            <Text style={styles.hintButtonText}>
              {showHint ? 'Hide' : 'Show'} Hint
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigation}>
          <Button
            title="Previous"
            onPress={goToPrevious}
            variant="outline"
            disabled={currentIndex === 0}
            style={styles.navButton}
          />
          {currentIndex === set.words.length - 1 ? (
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
  hint: {
    ...Typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.lg,
    opacity: 0.9,
  },
  controls: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  hintButtonText: {
    ...Typography.body,
    color: Colors.ai,
    fontWeight: '500',
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
