import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { WordPairInput } from '@/components/set/WordPairInput';
import { AISuggestionModal } from '@/components/ai/AISuggestionModal';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WordPair } from '@/lib/types';
import { Spacing, Typography, MAX_WORDS_PER_SET } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function CreateSetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createSet, updateSet, getSetById } = useSets();
  const { colors } = useTheme();
  const { preferences } = useLanguage();

  const editingSetId = params.editId as string | undefined;
  const isEditing = !!editingSetId;

  const [setName, setSetName] = useState('');
  const [wordPairs, setWordPairs] = useState<WordPair[]>([
    { id: '1', word: '', translation: '' },
  ]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Clear form or load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isEditing && editingSetId) {
        const setToEdit = getSetById(editingSetId);
        if (setToEdit) {
          setSetName(setToEdit.name);
          setWordPairs(setToEdit.words.length > 0 ? setToEdit.words : [{ id: '1', word: '', translation: '' }]);
        }
      } else {
        // Clear form when creating new set
        setSetName('');
        setWordPairs([{ id: '1', word: '', translation: '' }]);
        setShowAIModal(false);
      }
    }, [editingSetId, isEditing])
  );

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

  const handleAIWordsSelected = (aiWords: WordPair[]) => {
    const availableSlots = MAX_WORDS_PER_SET - wordPairs.length;
    const wordsToAdd = aiWords.slice(0, availableSlots);

    if (wordsToAdd.length < aiWords.length) {
      Alert.alert(
        'Limit Reached',
        `Only ${wordsToAdd.length} words were added to stay within the ${MAX_WORDS_PER_SET} word limit.`
      );
    }

    // Regenerate IDs to ensure uniqueness
    const wordsWithNewIds = wordsToAdd.map((word, index) => ({
      ...word,
      id: `${Date.now()}-${index}`,
    }));

    setWordPairs([...wordPairs, ...wordsWithNewIds]);
  };

  const clearForm = () => {
    setSetName('');
    setWordPairs([{ id: '1', word: '', translation: '' }]);
  };

  const handleSave = async () => {
    if (saving) return; // Prevent multiple clicks

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

    setSaving(true);
    try {
      if (isEditing && editingSetId) {
        // Update existing set
        await updateSet(
          editingSetId,
          setName,
          validPairs,
          preferences.targetLanguage,
          preferences.nativeLanguage
        );
        Alert.alert('Success', 'Set updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Create new set
        const newSet = await createSet(
          setName,
          validPairs,
          preferences.targetLanguage,
          preferences.nativeLanguage
        );
        if (newSet) {
          clearForm(); // Clear the form after successful creation
          Alert.alert('Success', 'Set created successfully!', [
            {
              text: 'OK',
              onPress: () => router.push(`/sets/${newSet.id}`),
            },
          ]);
        } else {
          Alert.alert('Error', 'Failed to create set. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error saving set:', error);

      // Extract more detailed error message
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} set.`;

      if (error?.message) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Set' : 'Create Set'}
        </Text>
        <Button
          title={saving ? "Saving..." : "Save"}
          onPress={handleSave}
          variant="primary"
          disabled={saving}
          style={styles.saveButton}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Set Name"
            value={setName}
            onChangeText={setSetName}
            placeholder="e.g., Spanish Vocabulary"
          />

          <View style={styles.wordsSection}>
            <View style={styles.wordsSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Words</Text>
              <Text style={[styles.wordCount, { color: colors.textSecondary }]}>
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
                    ? colors.textSecondary
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.addButtonText,
                  { color: wordPairs.length >= MAX_WORDS_PER_SET ? colors.textSecondary : colors.primary },
                ]}
              >
                Add Word
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.aiButton, {
                backgroundColor: `${colors.ai}10`,
                borderColor: colors.ai
              }]}
              onPress={() => setShowAIModal(true)}
              disabled={wordPairs.length >= MAX_WORDS_PER_SET}
            >
              <Ionicons
                name="sparkles"
                size={24}
                color={
                  wordPairs.length >= MAX_WORDS_PER_SET
                    ? colors.textSecondary
                    : colors.ai
                }
              />
              <Text
                style={[
                  styles.aiButtonText,
                  { color: wordPairs.length >= MAX_WORDS_PER_SET ? colors.textSecondary : colors.ai },
                ]}
              >
                AI Suggestions
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AISuggestionModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSelectWords={handleAIWordsSelected}
        existingPairs={wordPairs}
      />
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
  },
  saveButton: {
    minHeight: 36,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  keyboardAvoid: {
    flex: 1,
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
  },
  wordCount: {
    ...Typography.caption,
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
    fontWeight: '500',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  aiButtonText: {
    ...Typography.body,
    fontWeight: '500',
  },
});
