import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef , useCallback, useEffect } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { WordPairInput, WordPairInputRef } from '@/components/set/WordPairInput';
import { AISuggestionModal } from '@/components/ai/AISuggestionModal';
import { BulkImportModal } from '@/components/create/BulkImportModal';
import { DuplicateWordModal } from '@/components/create/DuplicateWordModal';
import { LanguageOverrideSelector } from '@/components/create/LanguageOverrideSelector';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
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
import { LinearGradient } from 'expo-linear-gradient';
import { showAlert } from '@/lib/alert';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopCreateView } from '@/components/create/DesktopCreateView';

export default function CreateSetScreen() {
  const { t } = useTranslation('create');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sets, createSet, updateSet, getSetById } = useSets();
  const { colors } = useTheme();
  const { preferences } = useLanguage();
  const { isDesktop } = useResponsive();

  // All hooks must be called before any conditional returns
  const editingSetId = params.editId as string | undefined;
  const isEditing = !!editingSetId;
  const previousEditId = useRef<string | undefined>(undefined);

  const [setName, setSetName] = useState('');
  const [wordPairs, setWordPairs] = useState<WordPair[]>([
    { id: '1', word: '', translation: '' },
  ]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Language override state - null means use defaults
  const [overrideTargetLanguage, setOverrideTargetLanguage] = useState<string | null>(null);
  const [overrideNativeLanguage, setOverrideNativeLanguage] = useState<string | null>(null);

  // Duplicate detection state
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [duplicateCandidate, setDuplicateCandidate] = useState<{
    pairId: string;
    word: string;
    translation: string;
  } | null>(null);
  // Track which duplicate pairs the user has chosen to keep
  const [allowedDuplicates, setAllowedDuplicates] = useState<Set<string>>(new Set());

  // Refs for word pair inputs to manage focus
  const wordPairRefs = useRef<{ [key: string]: WordPairInputRef | null }>({});
  const [lastAddedPairId, setLastAddedPairId] = useState<string | null>(null);

  // Focus on newly added pair
  useEffect(() => {
    if (lastAddedPairId && wordPairRefs.current[lastAddedPairId]) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        wordPairRefs.current[lastAddedPairId]?.focusWord();
        setLastAddedPairId(null);
      }, 100);
    }
  }, [lastAddedPairId, wordPairs]);

  // Load data when editing, preserve state when creating
  useFocusEffect(
    useCallback(() => {
      if (isEditing && editingSetId) {
        // Always load fresh data when editing
        const setToEdit = getSetById(editingSetId);
        if (setToEdit) {
          setSetName(setToEdit.name);
          setWordPairs(
            setToEdit.words.length > 0
              ? setToEdit.words
              : [{ id: '1', word: '', translation: '' }]
          );
          // Load language override if different from defaults
          if (
            setToEdit.targetLanguage !== preferences.targetLanguage ||
            setToEdit.nativeLanguage !== preferences.nativeLanguage
          ) {
            setOverrideTargetLanguage(setToEdit.targetLanguage);
            setOverrideNativeLanguage(setToEdit.nativeLanguage);
          } else {
            setOverrideTargetLanguage(null);
            setOverrideNativeLanguage(null);
          }
        }
        previousEditId.current = editingSetId;
      } else if (previousEditId.current) {
        // Just switched from editing to creating - clear the form
        setSetName('');
        setWordPairs([{ id: '1', word: '', translation: '' }]);
        setShowAIModal(false);
        setOverrideTargetLanguage(null);
        setOverrideNativeLanguage(null);
        previousEditId.current = undefined;
      }
      // When creating new set (not editing), preserve the current state
    }, [editingSetId, isEditing, preferences.targetLanguage, preferences.nativeLanguage])
  );

  const addWordPair = () => {
    if (wordPairs.length >= MAX_WORDS_PER_SET) {
      showAlert(t('limitReached'), t('limitMessage', { max: MAX_WORDS_PER_SET }));
      return;
    }

    const newId = Date.now().toString();
    setWordPairs([
      ...wordPairs,
      { id: newId, word: '', translation: '' },
    ]);
    setLastAddedPairId(newId);
  };

  const handleTranslationSubmit = (pairId: string) => {
    // Find the current pair
    const currentPair = wordPairs.find(p => p.id === pairId);

    // Only add a new pair if both word and translation are filled
    if (currentPair && currentPair.word.trim() && currentPair.translation.trim()) {
      addWordPair();
    }
  };

  const updateWordPair = (
    id: string,
    field: 'word' | 'translation',
    value: string
  ) => {
    // First, update the word pair
    setWordPairs(pairs => {
      const updatedPairs = pairs.map(pair =>
        pair.id === id ? { ...pair, [field]: value } : pair
      );

      // Check for duplicates only when BOTH fields are filled
      const currentPair = updatedPairs.find(p => p.id === id);
      if (currentPair) {
        const normalizedWord = currentPair.word.trim().toLowerCase();
        const normalizedTranslation = currentPair.translation.trim().toLowerCase();

        // Only check for duplicates when both word and translation are filled
        if (normalizedWord && normalizedTranslation) {
          const duplicateKey = `${normalizedWord}:${normalizedTranslation}`;

          // Check if this pair already has been allowed as duplicate
          if (allowedDuplicates.has(duplicateKey)) {
            return updatedPairs;
          }

          // Check if there's another pair with same word AND translation
          const hasDuplicate = updatedPairs.some(
            pair =>
              pair.id !== id &&
              pair.word.trim().toLowerCase() === normalizedWord &&
              pair.translation.trim().toLowerCase() === normalizedTranslation
          );

          if (hasDuplicate) {
            // Show modal to ask user
            setDuplicateCandidate({
              pairId: id,
              word: currentPair.word.trim(),
              translation: currentPair.translation.trim(),
            });
            setDuplicateModalVisible(true);
          }
        }
      }

      return updatedPairs;
    });
  };

  const deleteWordPair = (id: string) => {
    setWordPairs(pairs => pairs.filter(pair => pair.id !== id));
  };

  const handleKeepDuplicate = () => {
    if (duplicateCandidate) {
      const normalizedWord = duplicateCandidate.word.toLowerCase();
      const normalizedTranslation = duplicateCandidate.translation.toLowerCase();
      const duplicateKey = `${normalizedWord}:${normalizedTranslation}`;

      // Add to allowed duplicates so we don't show modal again for this pair
      setAllowedDuplicates(prev => new Set(prev).add(duplicateKey));
    }
    setDuplicateModalVisible(false);
    setDuplicateCandidate(null);
  };

  const handleRemoveDuplicate = () => {
    if (duplicateCandidate) {
      // Remove the duplicate pair
      setWordPairs(pairs => pairs.filter(pair => pair.id !== duplicateCandidate.pairId));
    }
    setDuplicateModalVisible(false);
    setDuplicateCandidate(null);
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
        t('limitReached'),
        t('limitMessage', { max: MAX_WORDS_PER_SET })
      );
    }

    // Regenerate IDs to ensure uniqueness
    const wordsWithNewIds = wordsToAdd.map((word, index) => ({
      ...word,
      id: `${Date.now()}-${index}`,
    }));

    // Replace all pairs with non-empty existing pairs + new AI words
    setWordPairs([...nonEmptyPairs, ...wordsWithNewIds]);
  };

  const handleBulkImport = (importedWords: WordPair[]) => {
    // Filter out empty word pairs
    const nonEmptyPairs = wordPairs.filter(
      pair => pair.word.trim() || pair.translation.trim()
    );

    const availableSlots = MAX_WORDS_PER_SET - nonEmptyPairs.length;
    const wordsToAdd = importedWords.slice(0, availableSlots);

    if (wordsToAdd.length < importedWords.length) {
      showAlert(
        t('limitReached'),
        t('limitMessage', { max: MAX_WORDS_PER_SET })
      );
    }

    // Add imported words to existing non-empty pairs
    setWordPairs([...nonEmptyPairs, ...wordsToAdd]);
  };

  const clearForm = () => {
    setSetName('');
    setWordPairs([{ id: '1', word: '', translation: '' }]);
    setOverrideTargetLanguage(null);
    setOverrideNativeLanguage(null);
  };

  const hasUnsavedChanges = () => {
    // Check if set name has content
    if (setName.trim()) return true;

    // Check if any word pairs have content
    const hasContent = wordPairs.some(
      pair => pair.word.trim() || pair.translation.trim()
    );

    return hasContent;
  };

  // Navigate to appropriate destination based on context
  const navigateBack = () => {
    if (isEditing && editingSetId) {
      // If editing, go back to the set detail page
      router.replace(`/(tabs)/sets/${editingSetId}`);
    } else {
      // If creating new, go to home
      router.replace('/(tabs)');
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      showAlert(
        t('unsavedChanges.title'),
        t('unsavedChanges.message'),
        [
          { text: t('unsavedChanges.discard'), onPress: navigateBack, style: 'destructive' },
          { text: t('unsavedChanges.cancel'), style: 'cancel' },
        ]
      );
    } else {
      navigateBack();
    }
  };

  const handleUseDefaultLanguages = () => {
    setOverrideTargetLanguage(null);
    setOverrideNativeLanguage(null);
  };

  const handleSave = async () => {
    if (saving) return; // Prevent multiple clicks

    // Generate default set name if empty
    let finalSetName = setName.trim();
    if (!finalSetName) {
      // Find the next available set number
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

    // Filter out empty pairs and trim whitespace from values
    const validPairs = wordPairs
      .filter(pair => pair.word.trim() && pair.translation.trim())
      .map(pair => ({
        ...pair,
        word: pair.word.trim(),
        translation: pair.translation.trim(),
      }));

    if (validPairs.length === 0) {
      showAlert(t('common:status.error'), t('errors.atLeastOneWord'));
      return;
    }

    setSaving(true);
    try {
      // Use override languages if set, otherwise use preferences
      const finalTargetLanguage = overrideTargetLanguage || preferences.targetLanguage;
      const finalNativeLanguage = overrideNativeLanguage || preferences.nativeLanguage;

      if (isEditing && editingSetId) {
        // Update existing set
        await updateSet(
          editingSetId,
          finalSetName,
          validPairs,
          finalTargetLanguage,
          finalNativeLanguage
        );
        showAlert(t('common:status.success'), t('success.updated'), [
          {
            text: 'OK',
            onPress: () => router.push(`/(tabs)/sets/${editingSetId}`),
          },
        ]);
      } else {
        // Create new set
        const newSet = await createSet(
          finalSetName,
          validPairs,
          finalTargetLanguage,
          finalNativeLanguage
        );
        if (newSet) {
          clearForm(); // Clear the form after successful creation
          showAlert(t('common:status.success'), t('success.created'), [
            {
              text: 'OK',
              onPress: () => router.push(`/(tabs)/sets/${newSet.id}`),
            },
          ]);
        } else {
          showAlert(t('common:status.error'), t('errors.createFailed'));
        }
      }
    } catch (error: any) {
      console.error('Error saving set:', error);

      // Extract more detailed error message
      let errorMessage = isEditing ? t('errors.createFailed') : t('errors.createFailed');

      if (error?.message) {
        if (error.message.includes('Network request failed')) {
          errorMessage = t('errors.networkError');
        } else {
          errorMessage = error.message;
        }
      }

      showAlert(t('common:status.error'), errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Use desktop layout for desktop screens
  if (isDesktop) {
    return (
      <DesktopLayout>
        <DesktopCreateView />
      </DesktopLayout>
    );
  }

  // Mobile layout below
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <LinearGradient
        colors={['#5B9EFF', '#E066FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEditing ? t('editTitle') : t('title')}
          </Text>
          {preferences.targetLanguage && preferences.nativeLanguage && (
            <View style={styles.headerBadge}>
              <LanguageBadge
                targetLanguage={preferences.targetLanguage}
                nativeLanguage={preferences.nativeLanguage}
                size="small"
                compact={true}
              />
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.saveButtonText}>
            {saving ? t('common:buttons.saving') : t('common:buttons.save')}
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
            label={t('setName')}
            value={setName}
            onChangeText={setSetName}
            placeholder={t('setNamePlaceholder')}
          />

          <LanguageOverrideSelector
            targetLanguage={overrideTargetLanguage || preferences.targetLanguage}
            nativeLanguage={overrideNativeLanguage || preferences.nativeLanguage}
            onTargetLanguageChange={setOverrideTargetLanguage}
            onNativeLanguageChange={setOverrideNativeLanguage}
            onUseDefaults={handleUseDefaultLanguages}
          />

          <View style={styles.wordsSection}>
            <View style={styles.wordsSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('words')}
              </Text>
              <Text style={[styles.wordCount, { color: colors.textSecondary }]}>
                {wordPairs.length}/{MAX_WORDS_PER_SET}
              </Text>
            </View>

            {wordPairs.map(pair => (
              <WordPairInput
                key={pair.id}
                ref={el => {
                  wordPairRefs.current[pair.id] = el;
                }}
                pair={pair}
                onChangeWord={text => updateWordPair(pair.id, 'word', text)}
                onChangeTranslation={text =>
                  updateWordPair(pair.id, 'translation', text)
                }
                onDelete={() => deleteWordPair(pair.id)}
                canDelete={wordPairs.length > 1}
                onTranslationSubmit={() => handleTranslationSubmit(pair.id)}
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
                {t('addWord')}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.bulkImportButton,
                  {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setShowBulkImportModal(true)}
                disabled={wordPairs.length >= MAX_WORDS_PER_SET}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={
                    wordPairs.length >= MAX_WORDS_PER_SET
                      ? colors.textSecondary
                      : colors.primary
                  }
                />
                <Text
                  style={[
                    styles.bulkImportButtonText,
                    {
                      color:
                        wordPairs.length >= MAX_WORDS_PER_SET
                          ? colors.textSecondary
                          : colors.primary,
                    },
                  ]}
                >
                  {t('bulkImport.button')}
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
                  size={20}
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
                  {t('aiSuggestions')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AISuggestionModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSelectWords={handleAIWordsSelected}
        existingPairs={wordPairs}
      />

      <BulkImportModal
        visible={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={handleBulkImport}
        maxWords={MAX_WORDS_PER_SET}
      />

      <DuplicateWordModal
        visible={duplicateModalVisible}
        word={duplicateCandidate?.word || ''}
        translation={duplicateCandidate?.translation || ''}
        onKeep={handleKeepDuplicate}
        onRemove={handleRemoveDuplicate}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerBadge: {
    opacity: 0.9,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  bulkImportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    borderWidth: 2,
  },
  bulkImportButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  aiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    borderWidth: 2,
  },
  aiButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
});
