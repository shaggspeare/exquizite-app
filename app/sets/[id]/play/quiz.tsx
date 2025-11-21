import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { QuizQuestion } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Generate quiz options from available translations
function generateQuizOptions(
  correctAnswer: string,
  allTranslations: string[]
): string[] {
  // Filter out the correct answer
  const wrongOptions = allTranslations.filter(t => t !== correctAnswer);

  // Shuffle and take first 3
  const shuffled = shuffleArray(wrongOptions);
  const selected = shuffled.slice(0, 3);

  // Combine with correct answer and shuffle
  const allOptions = [...selected, correctAnswer];
  return shuffleArray(allOptions);
}

export default function QuizScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById, updateLastPracticed } = useSets();
  const { colors } = useTheme();

  const set = getSetById(id!);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (set) {
      generateQuestions();
    }
  }, [set]);

  const generateQuestions = () => {
    if (!set) return;

    const allTranslations = set.words.map(w => w.translation);
    const shuffledWords = shuffleArray(set.words);

    // Generate questions
    const quizQuestions: QuizQuestion[] = shuffledWords.map((word) => ({
      word: word.word,
      correctAnswer: word.translation,
      options: generateQuizOptions(word.translation, allTranslations),
    }));

    setQuestions(quizQuestions);
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    updateLastPracticed(id!);
    const percentage = Math.round((score / questions.length) * 100);
    Alert.alert(
      'Quiz Complete!',
      `You scored ${score}/${questions.length} (${percentage}%)`,
      [
        { text: 'Try Again', onPress: () => resetQuiz() },
        { text: 'Done', onPress: () => router.back() },
      ]
    );
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    generateQuestions();
  };

  if (!set || set.words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No words in this set</Text>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];

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
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={[styles.scoreContainer, { backgroundColor: `${colors.success}20` }]}>
          <Ionicons name="trophy" size={20} color={colors.success} />
          <Text style={[styles.scoreText, { color: colors.success }]}>{score}</Text>
        </View>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={['#00D4FF', '#00E5A0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#00D4FF', '#00E5A0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.questionCard}
        >
          <Ionicons name="help-circle" size={48} color="#FFFFFF" style={{ marginBottom: Spacing.md }} />
          <Text style={styles.questionLabel}>Translate:</Text>
          <Text style={styles.questionText}>{currentQuestion.word}</Text>
        </LinearGradient>

        <View style={styles.options}>
          {currentQuestion.options.map((option, optionIndex) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === option;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <OptionCard
                key={optionIndex}
                option={option}
                index={optionIndex}
                isSelected={isSelected}
                showCorrect={showCorrect}
                showWrong={showWrong}
                isAnswered={isAnswered}
                onPress={() => handleSelectAnswer(option)}
                colors={colors}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {isAnswered ? (
          <Button
            title={
              currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'
            }
            onPress={handleNext}
          />
        ) : (
          <Button
            title="Skip"
            onPress={handleNext}
            variant="outline"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

interface OptionCardProps {
  option: string;
  index: number;
  isSelected: boolean;
  showCorrect: boolean;
  showWrong: boolean;
  isAnswered: boolean;
  onPress: () => void;
  colors: any;
}

function OptionCard({ option, index, isSelected, showCorrect, showWrong, isAnswered, onPress, colors }: OptionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!isAnswered) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getBorderColor = () => {
    if (showCorrect) return colors.success;
    if (showWrong) return colors.error;
    if (isSelected) return colors.primary;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (showCorrect) return `${colors.success}20`;
    if (showWrong) return `${colors.error}20`;
    if (isSelected) return `${colors.primary}10`;
    return colors.card;
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isAnswered}
        style={[
          styles.option,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}
        activeOpacity={1}
      >
        <View style={[styles.optionNumber, { backgroundColor: colors.border }]}>
          <Text style={[styles.optionNumberText, { color: colors.text }]}>{String.fromCharCode(65 + index)}</Text>
        </View>
        <Text style={[styles.optionText, { color: colors.text }]}>
          {option}
        </Text>
        {showCorrect && (
          <Ionicons name="checkmark-circle" size={28} color={colors.success} />
        )}
        {showWrong && (
          <Ionicons name="close-circle" size={28} color={colors.error} />
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
  progress: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  scoreText: {
    ...Typography.body,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  questionCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Shadow.cardDeep,
  },
  questionLabel: {
    ...Typography.caption,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  questionText: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    borderRadius: BorderRadius.button,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    minHeight: 72,
    ...Shadow.card,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionNumberText: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 16,
  },
  optionText: {
    ...Typography.body,
    fontSize: 17,
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
