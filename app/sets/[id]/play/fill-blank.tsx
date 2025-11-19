import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { generateSentenceWithGap } from '@/lib/ai-helpers';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface FillBlankQuestion {
  word: string;
  translation: string;
  sentence: string;
  correctAnswer: string;
}

export default function FillBlankScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById, updateLastPracticed } = useSets();
  const { preferences } = useLanguage();

  const set = getSetById(id!);
  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (set) {
      generateQuestions();
    }
  }, [set]);

  const generateQuestions = async () => {
    if (!set) return;

    setLoading(true);
    const generatedQuestions: FillBlankQuestion[] = [];

    // Shuffle words for random order
    const shuffleArray = <T,>(array: T[]): T[] => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const shuffledWords = shuffleArray(set.words);

    for (const word of shuffledWords) {
      try {
        const { sentence, correctAnswer } = await generateSentenceWithGap(
          word.word,
          word.translation,
          preferences.targetLanguage,
          preferences.nativeLanguage
        );

        generatedQuestions.push({
          word: word.word,
          translation: word.translation,
          sentence,
          correctAnswer,
        });
      } catch (error) {
        console.error('Error generating question for word:', word.word, error);
        // Add fallback question
        generatedQuestions.push({
          word: word.word,
          translation: word.translation,
          sentence: `___ means ${word.translation}`,
          correctAnswer: word.word,
        });
      }
    }

    setQuestions(generatedQuestions);
    setLoading(false);
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentIndex];
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuestion.correctAnswer.toLowerCase();

    const correct = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    updateLastPracticed(id!);
    const percentage = Math.round((score / questions.length) * 100);
    Alert.alert(
      'Exercise Complete!',
      `You scored ${score}/${questions.length} (${percentage}%)`,
      [
        { text: 'Try Again', onPress: () => resetGame() },
        { text: 'Done', onPress: () => router.back() },
      ]
    );
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setShowHint(false);
    generateQuestions();
  };

  if (!set || set.words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No words in this set</Text>
      </SafeAreaView>
    );
  }

  if (loading || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating sentences...</Text>
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showHint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintLabel}>Translation:</Text>
              <Text style={styles.hintText}>{currentQuestion.translation}</Text>
            </View>
          )}

          <View style={styles.sentenceCard}>
            <Text style={styles.sentenceLabel}>Fill in the blank:</Text>
            <Text style={styles.sentenceText}>{currentQuestion.sentence}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isAnswered && (isCorrect ? styles.inputCorrect : styles.inputWrong),
              ]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer here..."
              placeholderTextColor={Colors.textSecondary}
              editable={!isAnswered}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isAnswered && (
              <View style={styles.feedbackIcon}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={isCorrect ? Colors.success : Colors.error}
                />
              </View>
            )}
          </View>

          {!showHint && !isAnswered && (
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => setShowHint(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
              <Text style={styles.hintButtonText}>Show Hint</Text>
            </TouchableOpacity>
          )}

          {isAnswered && !isCorrect && (
            <View style={styles.correctAnswerContainer}>
              <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
              <Text style={styles.correctAnswerText}>
                {currentQuestion.correctAnswer}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
            title="Check Answer"
            onPress={handleCheckAnswer}
            disabled={!userAnswer.trim()}
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  hintCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  hintLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  hintText: {
    ...Typography.body,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
  },
  sentenceCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  sentenceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  sentenceText: {
    ...Typography.h2,
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  inputCorrect: {
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}10`,
  },
  inputWrong: {
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}10`,
  },
  feedbackIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -16,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  hintButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  correctAnswerContainer: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  correctAnswerLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  correctAnswerText: {
    ...Typography.body,
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
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
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
