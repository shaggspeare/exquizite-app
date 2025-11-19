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
    Alert.alert(
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            <Ionicons name="timer" size={16} /> {formatTime(timer)}
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="checkmark-circle" size={16} /> {score}/{set.words.length}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Words</Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {words.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleWordPress(item)}
                  disabled={item.matched}
                  style={[
                    styles.matchCard,
                    selectedWord === item.id && styles.matchCardSelected,
                    item.matched && styles.matchCardMatched,
                  ]}
                >
                  <Text
                    style={[
                      styles.matchCardText,
                      item.matched && styles.matchCardTextMatched,
                    ]}
                  >
                    {item.text}
                  </Text>
                  {item.matched && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnTitle}>Translations</Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {translations.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleTranslationPress(item)}
                  disabled={item.matched}
                  style={[
                    styles.matchCard,
                    selectedTranslation === item.id && styles.matchCardSelected,
                    item.matched && styles.matchCardMatched,
                  ]}
                >
                  <Text
                    style={[
                      styles.matchCardText,
                      item.matched && styles.matchCardTextMatched,
                    ]}
                  >
                    {item.text}
                  </Text>
                  {item.matched && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.md,
    flex: 1,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  matchCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  matchCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  matchCardMatched: {
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}10`,
    opacity: 0.6,
  },
  matchCardText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  matchCardTextMatched: {
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
