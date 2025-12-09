// Desktop create set screen with two-column layout
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { WordPairInput } from '@/components/set/WordPairInput';
import { AISuggestionModal } from '@/components/ai/AISuggestionModal';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WordPair } from '@/lib/types';
import {
  Spacing,
  Typography,
  MAX_WORDS_PER_SET,
  BorderRadius,
} from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '@/lib/alert';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { Card } from '@/components/ui/Card';

export function DesktopCreateView() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sets, createSet, updateSet, getSetById } = useSets();
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

  useFocusEffect(
    useCallback(() => {
      if (isEditing && editingSetId) {
        const setToEdit = getSetById(editingSetId);
        if (setToEdit) {
          setSetName(setToEdit.name);
          setWordPairs(
            setToEdit.words.length > 0
              ? setToEdit.words
              : [{ id: '1', word: '', translation: '' }]
          );
        }
        previousEditId.current = editingSetId;
      } else if (previousEditId.current) {
        setSetName('');
        setWordPairs([{ id: '1', word: '', translation: '' }]);
        setShowAIModal(false);
        previousEditId.current = undefined;
      }
    }, [editingSetId, isEditing])
  );

  const addWordPair = () => {
    if (wordPairs.length >= MAX_WORDS_PER_SET) {
      showAlert('Limit Reached', `Maximum ${MAX_WORDS_PER_SET} words per set`);
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
      pairs.map(pair => (pair.id === id ? { ...pair, [field]: value } : pair))
    );
  };

  const deleteWordPair = (id: string) => {
    setWordPairs(pairs => pairs.filter(pair => pair.id !== id));
  };

  const handleAIWordsSelected = (aiWords: WordPair[]) => {
    // Filter out empty word pairs to calculate actual available slots
    const nonEmptyPairs = wordPairs.filter(
      pair => pair.word.trim() || pair.translation.trim()
    );

    const availableSlots = MAX_WORDS_PER_SET - nonEmptyPairs.length;
    const wordsToAdd = aiWords.slice(0, availableSlots);

    if (wordsToAdd.length < aiWords.length) {
      showAlert(
        'Limit Reached',
        `Only ${wordsToAdd.length} words were added to stay within the ${MAX_WORDS_PER_SET} word limit.`
      );
    }

    const wordsWithNewIds = wordsToAdd.map((word, index) => ({
      ...word,
      id: `${Date.now()}-${index}`,
    }));

    // Replace all pairs with non-empty existing pairs + new AI words
    setWordPairs([...nonEmptyPairs, ...wordsWithNewIds]);
  };

  const clearForm = () => {
    setSetName('');
    setWordPairs([{ id: '1', word: '', translation: '' }]);
  };

  const handleSave = async () => {
    if (saving) return;

    let finalSetName = setName.trim();
    if (!finalSetName) {
      const setNumbers = sets
        .map(s => {
          const match = s.name.match(/^Set (\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);
      const nextNumber =
        setNumbers.length > 0 ? Math.max(...setNumbers) + 1 : 1;
      finalSetName = `Set ${nextNumber}`;
    }

    const validPairs = wordPairs
      .filter(pair => pair.word.trim() && pair.translation.trim())
      .map(pair => ({
        ...pair,
        word: pair.word.trim(),
        translation: pair.translation.trim(),
      }));

    if (validPairs.length === 0) {
      showAlert('Error', 'Please add at least one word pair');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingSetId) {
        await updateSet(
          editingSetId,
          finalSetName,
          validPairs,
          preferences.targetLanguage,
          preferences.nativeLanguage
        );
        showAlert('Success', 'Set updated successfully!', [
          { text: 'OK', onPress: () => router.push(`/sets/${editingSetId}`) },
        ]);
      } else {
        const newSet = await createSet(
          finalSetName,
          validPairs,
          preferences.targetLanguage,
          preferences.nativeLanguage
        );
        if (newSet) {
          clearForm();
          showAlert('Success', 'Set created successfully!', [
            { text: 'OK', onPress: () => router.push(`/sets/${newSet.id}`) },
          ]);
        } else {
          showAlert('Error', 'Failed to create set. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error saving set:', error);
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} set.`;
      if (error?.message) {
        if (error.message.includes('Network request failed')) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      showAlert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filledPairs = wordPairs.filter(
    p => p.word.trim() && p.translation.trim()
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <DesktopContainer>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {isEditing ? 'Edit Set' : 'Create New Set'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                saving && styles.saveButtonDisabled,
              ]}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Set'}
              </Text>
            </TouchableOpacity>
          </View>
        </DesktopContainer>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DesktopContainer>
          <View style={styles.twoColumnLayout}>
            {/* Left Column - Form */}
            <View style={styles.leftColumn}>
              <Input
                label="Set Name"
                value={setName}
                onChangeText={setSetName}
                placeholder="e.g., Spanish Vocabulary"
              />

              <View style={styles.wordsSection}>
                <View style={styles.wordsSectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Words
                  </Text>
                  <Text
                    style={[styles.wordCount, { color: colors.textSecondary }]}
                  >
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
                      {
                        color:
                          wordPairs.length >= MAX_WORDS_PER_SET
                            ? colors.textSecondary
                            : colors.primary,
                      },
                    ]}
                  >
                    Add Word
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.aiButton,
                    {
                      backgroundColor: `${colors.ai}10`,
                      borderColor: colors.ai,
                    },
                  ]}
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
                      {
                        color:
                          wordPairs.length >= MAX_WORDS_PER_SET
                            ? colors.textSecondary
                            : colors.ai,
                      },
                    ]}
                  >
                    AI Suggestions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Column - Preview */}
            <View style={styles.rightColumn}>
              <Card style={styles.previewCard}>
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  Preview
                </Text>
                <View style={styles.previewContent}>
                  <View style={styles.previewHeader}>
                    <Text
                      style={[styles.previewSetName, { color: colors.text }]}
                    >
                      {setName.trim() || 'Untitled Set'}
                    </Text>
                    <View style={styles.previewStats}>
                      <Ionicons
                        name="book-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.previewStatsText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {filledPairs.length}{' '}
                        {filledPairs.length === 1 ? 'word' : 'words'}
                      </Text>
                    </View>
                  </View>

                  {filledPairs.length > 0 ? (
                    <View style={styles.previewList}>
                      {filledPairs.slice(0, 5).map((pair, index) => (
                        <View
                          key={pair.id}
                          style={[
                            styles.previewItem,
                            { borderBottomColor: colors.border },
                          ]}
                        >
                          <Text
                            style={[styles.previewWord, { color: colors.text }]}
                          >
                            {pair.word}
                          </Text>
                          <Text
                            style={[
                              styles.previewTranslation,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {pair.translation}
                          </Text>
                        </View>
                      ))}
                      {filledPairs.length > 5 && (
                        <Text
                          style={[
                            styles.previewMore,
                            { color: colors.textSecondary },
                          ]}
                        >
                          +{filledPairs.length - 5} more{' '}
                          {filledPairs.length - 5 === 1 ? 'word' : 'words'}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.previewEmpty}>
                      <Ionicons
                        name="document-text-outline"
                        size={48}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.previewEmptyText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Add words to see preview
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </View>
          </View>
        </DesktopContainer>
      </ScrollView>

      <AISuggestionModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSelectWords={handleAIWordsSelected}
        existingPairs={wordPairs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xxl,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  leftColumn: {
    flex: 1,
    maxWidth: 600,
  },
  rightColumn: {
    width: 400,
  },
  wordsSection: {
    marginTop: Spacing.xl,
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
  previewCard: {
    position: 'sticky' as any,
    top: Spacing.lg,
  },
  previewTitle: {
    ...Typography.h3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  previewContent: {
    gap: Spacing.lg,
  },
  previewHeader: {
    gap: Spacing.sm,
  },
  previewSetName: {
    ...Typography.h2,
    fontSize: 22,
    fontWeight: '700',
  },
  previewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewStatsText: {
    ...Typography.caption,
    fontSize: 14,
  },
  previewList: {
    gap: Spacing.sm,
  },
  previewItem: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  previewWord: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  previewTranslation: {
    ...Typography.body,
    fontSize: 14,
  },
  previewMore: {
    ...Typography.caption,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  previewEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  previewEmptyText: {
    ...Typography.caption,
    fontSize: 14,
    marginTop: Spacing.md,
  },
});
