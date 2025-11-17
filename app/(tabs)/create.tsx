import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { WordPairInput } from '@/components/set/WordPairInput';
import { useSets } from '@/contexts/SetsContext';
import { WordPair } from '@/lib/types';
import { Colors, Spacing, Typography, MAX_WORDS_PER_SET } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function CreateSetScreen() {
  const router = useRouter();
  const { createSet } = useSets();
  const [setName, setSetName] = useState('');
  const [wordPairs, setWordPairs] = useState<WordPair[]>([
    { id: '1', word: '', translation: '' },
  ]);

  const addWordPair = () => {
    if (wordPairs.length >= MAX_WORDS_PER_SET) {
      Alert.alert(
        'Limit Reached',
        `Maximum ${MAX_WORDS_PER_SET} words per set`
      );
      return;
    }

    setWordPairs([
      ...wordPairs,
      { id: Date.now().toString(), word: '', translation: '' },
    ]);
  };

  const updateWordPair = (
    id: string,
    field: 'word' | 'translation',
    value: string
  ) => {
    setWordPairs(pairs =>
      pairs.map(pair =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  const deleteWordPair = (id: string) => {
    setWordPairs(pairs => pairs.filter(pair => pair.id !== id));
  };

  const handleSave = () => {
    if (!setName.trim()) {
      Alert.alert('Error', 'Please enter a set name');
      return;
    }

    const validPairs = wordPairs.filter(
      pair => pair.word.trim() && pair.translation.trim()
    );

    if (validPairs.length === 0) {
      Alert.alert('Error', 'Please add at least one word pair');
      return;
    }

    const newSet = createSet(setName, validPairs);
    Alert.alert('Success', 'Set created successfully!', [
      {
        text: 'OK',
        onPress: () => router.push(`/sets/${newSet.id}`),
      },
    ]);
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
        <Text style={styles.headerTitle}>Create Set</Text>
        <Button
          title="Save"
          onPress={handleSave}
          variant="text"
          textStyle={styles.saveButton}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Set Name"
          value={setName}
          onChangeText={setSetName}
          placeholder="e.g., Spanish Vocabulary"
        />

        <View style={styles.wordsSection}>
          <View style={styles.wordsSectionHeader}>
            <Text style={styles.sectionTitle}>Words</Text>
            <Text style={styles.wordCount}>
              {wordPairs.length}/{MAX_WORDS_PER_SET}
            </Text>
          </View>

          {wordPairs.map(pair => (
            <WordPairInput
              key={pair.id}
              pair={pair}
              onChangeWord={text => updateWordPair(pair.id, 'word', text)}
              onChangeTranslation={text =>
                updateWordPair(pair.id, 'translation', text)
              }
              onDelete={() => deleteWordPair(pair.id)}
              canDelete={wordPairs.length > 1}
            />
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addWordPair}
            disabled={wordPairs.length >= MAX_WORDS_PER_SET}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={
                wordPairs.length >= MAX_WORDS_PER_SET
                  ? Colors.textSecondary
                  : Colors.primary
              }
            />
            <Text
              style={[
                styles.addButtonText,
                wordPairs.length >= MAX_WORDS_PER_SET && styles.addButtonDisabled,
              ]}
            >
              Add Word
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.text,
  },
  saveButton: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  wordsSection: {
    marginTop: Spacing.lg,
  },
  wordsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.text,
  },
  wordCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  addButtonDisabled: {
    color: Colors.textSecondary,
  },
});
