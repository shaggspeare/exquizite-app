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
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { generateMultipleSentencesWithGaps } from '@/lib/ai-helpers';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { colors } = useTheme();

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

    try {
      // Generate all sentences in a single API call
      const sentences = await generateMultipleSentencesWithGaps(
        shuffledWords.map(w => ({ word: w.word, translation: w.translation })),
        preferences.targetLanguage,
        preferences.nativeLanguage
      );

      // Map the results to questions
      const generatedQuestions: FillBlankQuestion[] = shuffledWords.map((word, index) => ({
        word: word.word,
        translation: word.translation,
        sentence: sentences[index]?.sentence || `___ means ${word.translation}`,
        correctAnswer: sentences[index]?.correctAnswer || word.word,
      }));

      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback: create simple questions
      const fallbackQuestions: FillBlankQuestion[] = shuffledWords.map(word => ({
        word: word.word,
        translation: word.translation,
        sentence: `___ means ${word.translation}`,
        correctAnswer: word.word,
      }));
      setQuestions(fallbackQuestions);
    }

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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Generating sentences...</Text>
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
          colors={['#FF6B35', '#FFBB00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
          ]}
        />
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
            <View style={[styles.hintCard, { backgroundColor: `${colors.ai}20`, borderColor: colors.ai }]}>
              <Ionicons name="bulb" size={24} color={colors.ai} />
              <View style={styles.hintContent}>
                <Text style={[styles.hintLabel, { color: colors.ai }]}>Translation:</Text>
                <Text style={[styles.hintText, { color: colors.text }]}>{currentQuestion.translation}</Text>
              </View>
            </View>
          )}

          <LinearGradient
            colors={['#FF6B35', '#FFBB00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sentenceCard}
          >
            <Ionicons name="create" size={48} color="#FFFFFF" style={{ marginBottom: Spacing.md }} />
            <Text style={styles.sentenceLabel}>Fill in the blank:</Text>
            <Text style={styles.sentenceText}>{currentQuestion.sentence}</Text>
          </LinearGradient>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                isAnswered && isCorrect && { borderColor: colors.success, backgroundColor: `${colors.success}15` },
                isAnswered && !isCorrect && { borderColor: colors.error, backgroundColor: `${colors.error}15` },
              ]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer here..."
              placeholderTextColor={colors.textSecondary}
              editable={!isAnswered}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isAnswered && (
              <View style={styles.feedbackIcon}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={isCorrect ? colors.success : colors.error}
                />
              </View>
            )}
          </View>

          {!showHint && !isAnswered && (
            <TouchableOpacity
              style={[styles.hintButton, { backgroundColor: `${colors.ai}15`, borderColor: colors.ai }]}
              onPress={() => setShowHint(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="bulb-outline" size={20} color={colors.ai} />
              <Text style={[styles.hintButtonText, { color: colors.ai }]}>Show Hint</Text>
            </TouchableOpacity>
          )}

          {isAnswered && !isCorrect && (
            <View style={[styles.correctAnswerContainer, { backgroundColor: colors.card, borderColor: colors.error }]}>
              <Text style={[styles.correctAnswerLabel, { color: colors.textSecondary }]}>Correct answer:</Text>
              <Text style={[styles.correctAnswerText, { color: colors.error }]}>
                {currentQuestion.correctAnswer}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hintContent: {
    flex: 1,
  },
  hintLabel: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  hintText: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '500',
  },
  sentenceCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Shadow.cardDeep,
  },
  sentenceLabel: {
    ...Typography.caption,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  sentenceText: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  input: {
    borderRadius: BorderRadius.button,
    padding: Spacing.lg,
    fontSize: 18,
    borderWidth: 2,
    minHeight: 56,
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
    borderRadius: BorderRadius.button,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  hintButtonText: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 16,
  },
  correctAnswerContainer: {
    borderRadius: BorderRadius.button,
    padding: Spacing.lg,
    borderLeftWidth: 4,
  },
  correctAnswerLabel: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  correctAnswerText: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
