import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { Button } from '@/components/ui/Button';
import { QuizQuestion } from '@/lib/types';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.progress}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="trophy" size={20} color={Colors.primary} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
              index < currentIndex && styles.progressDotComplete,
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Translate:</Text>
          <Text style={styles.questionText}>{currentQuestion.word}</Text>
        </View>

        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === option;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.optionTextAnswered,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.success}
                  />
                )}
                {showWrong && (
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
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
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scoreText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  progressDotComplete: {
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  questionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  questionText: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 56,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}10`,
  },
  optionWrong: {
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}10`,
  },
  optionText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  optionTextAnswered: {
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
