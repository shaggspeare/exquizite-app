import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSets } from '@/contexts/SetsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { showAlert } from '@/lib/alert';
import { Button } from '@/components/ui/Button';
import { generateMultipleSentencesWithGaps } from '@/lib/ai-helpers';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';

interface FillBlankQuestion {
  word: string;
  translation: string;
  sentence: string;
  correctAnswer: string;
  options: string[];
}

export default function FillBlankScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSetById, updateLastPracticed } = useSets();
  const { preferences } = useLanguage();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  const set = getSetById(id!);
  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
        options: sentences[index]?.options || [word.word],
      }));

      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback: create simple questions with options from other words
      const fallbackQuestions: FillBlankQuestion[] = shuffledWords.map((word, index) => {
        const otherWords = shuffledWords.filter((_, i) => i !== index).map(w => w.word);
        const distractors = otherWords.slice(0, 3);
        while (distractors.length < 3) {
          distractors.push(`option${distractors.length + 1}`);
        }
        const allOptions = [word.word, ...distractors];
        const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

        return {
          word: word.word,
          translation: word.translation,
          sentence: `___ means ${word.translation}`,
          correctAnswer: word.word,
          options: shuffledOptions,
        };
      });
      setQuestions(fallbackQuestions);
    }

    setLoading(false);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    const currentQuestion = questions[currentIndex];
    const normalizedSelectedAnswer = selectedOption.trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuestion.correctAnswer.toLowerCase();

    const correct = normalizedSelectedAnswer === normalizedCorrectAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
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
    showAlert(
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
    setSelectedOption(null);
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
                  Fill in the Blank: {set.name}
                </Text>
                <View style={styles.desktopHeaderRight}>
                  <Text style={[styles.progress, { color: colors.text }]}>
                    Question {currentIndex + 1} / {questions.length}
                  </Text>
                  <View style={[styles.scoreContainer, { backgroundColor: `${colors.success}20` }]}>
                    <Ionicons name="trophy" size={20} color={colors.success} />
                    <Text style={[styles.scoreText, { color: colors.success }]}>{score}</Text>
                  </View>
                </View>
              </View>
            </DesktopContainer>
          </View>

          {/* Progress Bar */}
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

          {/* Content */}
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DesktopContainer>
              <View style={styles.desktopGameContent}>
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

                {showHint && (
                  <View style={[styles.hintCard, { backgroundColor: `${colors.ai}20`, borderColor: colors.ai }]}>
                    <Ionicons name="bulb" size={20} color={colors.ai} />
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
                  style={styles.desktopSentenceCard}
                >
                  <Text style={styles.sentenceLabel}>Fill in the blank:</Text>
                  <Text style={styles.desktopSentenceText}>{currentQuestion.sentence}</Text>
                </LinearGradient>

                <Text style={[styles.optionsLabel, { color: colors.textSecondary }]}>Choose the correct word:</Text>

                <View style={styles.desktopOptionsGrid}>
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrectOption = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
                    const showCorrect = isAnswered && isCorrectOption;
                    const showIncorrect = isAnswered && isSelected && !isCorrect;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.desktopOptionButton,
                          { backgroundColor: colors.card, borderColor: colors.border },
                          isSelected && !isAnswered && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
                          showCorrect && { borderColor: colors.success, backgroundColor: `${colors.success}15` },
                          showIncorrect && { borderColor: colors.error, backgroundColor: `${colors.error}15` },
                        ]}
                        onPress={() => !isAnswered && setSelectedOption(option)}
                        disabled={isAnswered}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            isSelected && !isAnswered && { color: colors.primary, fontWeight: '700' },
                            showCorrect && { color: colors.success, fontWeight: '700' },
                            showIncorrect && { color: colors.error, fontWeight: '700' },
                          ]}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {option}
                        </Text>
                        {showCorrect && (
                          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        )}
                        {showIncorrect && (
                          <Ionicons name="close-circle" size={24} color={colors.error} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {isAnswered && !isCorrect && (
                  <View style={[styles.correctAnswerContainer, { backgroundColor: colors.card, borderColor: colors.error }]}>
                    <Text style={[styles.correctAnswerLabel, { color: colors.textSecondary }]}>Correct answer:</Text>
                    <Text style={[styles.correctAnswerText, { color: colors.error }]}>
                      {currentQuestion.correctAnswer}
                    </Text>
                  </View>
                )}

                <View style={styles.desktopFooter}>
                  {isAnswered ? (
                    <Button
                      title={
                        currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'
                      }
                      onPress={handleNext}
                      style={styles.desktopButton}
                    />
                  ) : (
                    <Button
                      title="Check Answer"
                      onPress={handleCheckAnswer}
                      disabled={!selectedOption}
                      style={styles.desktopButton}
                    />
                  )}
                </View>
              </View>
            </DesktopContainer>
          </ScrollView>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {showHint && (
          <View style={[styles.hintCard, { backgroundColor: `${colors.ai}20`, borderColor: colors.ai }]}>
            <Ionicons name="bulb" size={20} color={colors.ai} />
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
          <Text style={styles.sentenceLabel}>Fill in the blank:</Text>
          <Text style={styles.sentenceText}>{currentQuestion.sentence}</Text>
        </LinearGradient>

        <Text style={[styles.optionsLabel, { color: colors.textSecondary }]}>Choose the correct word:</Text>

        <View style={styles.optionsGrid}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
            const showCorrect = isAnswered && isCorrectOption;
            const showIncorrect = isAnswered && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && !isAnswered && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
                  showCorrect && { borderColor: colors.success, backgroundColor: `${colors.success}15` },
                  showIncorrect && { borderColor: colors.error, backgroundColor: `${colors.error}15` },
                ]}
                onPress={() => !isAnswered && setSelectedOption(option)}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    isSelected && !isAnswered && { color: colors.primary, fontWeight: '700' },
                    showCorrect && { color: colors.success, fontWeight: '700' },
                    showIncorrect && { color: colors.error, fontWeight: '700' },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {option}
                </Text>
                {showCorrect && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
                {showIncorrect && (
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && !isCorrect && (
          <View style={[styles.correctAnswerContainer, { backgroundColor: colors.card, borderColor: colors.error }]}>
            <Text style={[styles.correctAnswerLabel, { color: colors.textSecondary }]}>Correct answer:</Text>
            <Text style={[styles.correctAnswerText, { color: colors.error }]}>
              {currentQuestion.correctAnswer}
            </Text>
          </View>
        )}
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
            title="Check Answer"
            onPress={handleCheckAnswer}
            disabled={!selectedOption}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  hintCard: {
    borderRadius: BorderRadius.button,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hintContent: {
    flex: 1,
  },
  hintLabel: {
    ...Typography.caption,
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '600',
  },
  hintText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
  },
  sentenceCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadow.cardDeep,
  },
  sentenceLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  sentenceText: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsLabel: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  optionButton: {
    borderRadius: BorderRadius.button,
    padding: Spacing.md,
    borderWidth: 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    width: '48.5%',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  optionText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.button,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  hintButtonText: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
  correctAnswerContainer: {
    borderRadius: BorderRadius.button,
    padding: Spacing.md,
    borderLeftWidth: 3,
    marginTop: Spacing.sm,
  },
  correctAnswerLabel: {
    ...Typography.caption,
    fontSize: 11,
    marginBottom: 2,
  },
  correctAnswerText: {
    ...Typography.body,
    fontSize: 15,
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
  desktopHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  desktopContent: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingVertical: Spacing.xxl * 2,
  },
  desktopGameContent: {
    maxWidth: 800,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  desktopSentenceCard: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Shadow.cardDeep,
  },
  desktopSentenceText: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  desktopOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  desktopOptionButton: {
    borderRadius: BorderRadius.button,
    padding: Spacing.lg,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    width: 'calc(50% - 8px)' as any,
    gap: Spacing.sm,
  },
  desktopFooter: {
    alignItems: 'center',
  },
  desktopButton: {
    minWidth: 300,
  },
});
