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
import { useState, useRef } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { WordPairInput } from '@/components/set/WordPairInput';
import { AISuggestionModal } from '@/components/ai/AISuggestionModal';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WordPair } from '@/lib/types';
import { Spacing, Typography, MAX_WORDS_PER_SET, BorderRadius } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateSetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createSet, updateSet, getSetById } = useSets();
  const { colors } = useTheme();
  const { preferences } = useLanguage();

  const editingSetId = params.editId as string | undefined;
  const isEditing = !!editingSetId;
  const previousEditId = useRef<string | undefined>(undefined);

  const [setName, setSetName] = useState('');
  const [wordPairs, setWordPairs] = useState<WordPair[]>([
    { id: '1', word: '', translation: '' },
  ]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load data when editing, preserve state when creating
  useFocusEffect(
    useCallback(() => {
      if (isEditing && editingSetId) {
        // Always load fresh data when editing
        const setToEdit = getSetById(editingSetId);
        if (setToEdit) {
          setSetName(setToEdit.name);
          setWordPairs(setToEdit.words.length > 0 ? setToEdit.words : [{ id: '1', word: '', translation: '' }]);
        }
        previousEditId.current = editingSetId;
      } else if (previousEditId.current) {
        // Just switched from editing to creating - clear the form
        setSetName('');
        setWordPairs([{ id: '1', word: '', translation: '' }]);
        setShowAIModal(false);
        previousEditId.current = undefined;
      }
      // When creating new set (not editing), preserve the current state
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
            onPress: () => router.push(`/sets/${editingSetId}`),
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
      <LinearGradient
        colors={['#5B9EFF', '#E066FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Set' : 'Create Set'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

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
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.button,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontSize: 20,
    fontWeight: '700',
  },
  wordCount: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.button,
    borderWidth: 2,
  },
  aiButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
