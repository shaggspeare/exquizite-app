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
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { WordPairInput } from '@/components/set/WordPairInput';
import { AISuggestionModal } from '@/components/ai/AISuggestionModal';
import { BulkImportModal } from '@/components/create/BulkImportModal';
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
import { showAlert } from '@/lib/alert';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { Card } from '@/components/ui/Card';

export function DesktopCreateView() {
  const { t } = useTranslation('create');
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
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [overrideTargetLanguage, setOverrideTargetLanguage] = useState<string | null>(null);
  const [overrideNativeLanguage, setOverrideNativeLanguage] = useState<string | null>(null);

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
        setSetName('');
        setWordPairs([{ id: '1', word: '', translation: '' }]);
        setShowAIModal(false);
        setOverrideTargetLanguage(null);
        setOverrideNativeLanguage(null);
        previousEditId.current = undefined;
      }
    }, [editingSetId, isEditing, preferences.targetLanguage, preferences.nativeLanguage])
  );

  const addWordPair = () => {
    if (wordPairs.length >= MAX_WORDS_PER_SET) {
      showAlert(t('limitReached'), t('limitMessage', { max: MAX_WORDS_PER_SET }));
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
        t('limitReached'),
        t('limitMessage', { max: MAX_WORDS_PER_SET })
      );
    }

    const wordsWithNewIds = wordsToAdd.map((word, index) => ({
      ...word,
      id: `${Date.now()}-${index}`,
    }));

    // Replace all pairs with non-empty existing pairs + new AI words
    setWordPairs([...nonEmptyPairs, ...wordsWithNewIds]);
  };

  const handleBulkImport = (importedWords: WordPair[]) => {
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

    setWordPairs([...nonEmptyPairs, ...wordsToAdd]);
  };

  const clearForm = () => {
    setSetName('');
    setWordPairs([{ id: '1', word: '', translation: '' }]);
    setOverrideTargetLanguage(null);
    setOverrideNativeLanguage(null);
  };

  const handleUseDefaultLanguages = () => {
    setOverrideTargetLanguage(null);
    setOverrideNativeLanguage(null);
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
      showAlert(t('common:status.error'), t('errors.atLeastOneWord'));
      return;
    }

    setSaving(true);
    try {
      const finalTargetLanguage = overrideTargetLanguage || preferences.targetLanguage;
      const finalNativeLanguage = overrideNativeLanguage || preferences.nativeLanguage;

      if (isEditing && editingSetId) {
        await updateSet(
          editingSetId,
          finalSetName,
          validPairs,
          finalTargetLanguage,
          finalNativeLanguage
        );
        showAlert(t('common:status.success'), t('success.updated'), [
          { text: 'OK', onPress: () => router.push(`/sets/${editingSetId}`) },
        ]);
      } else {
        const newSet = await createSet(
          finalSetName,
          validPairs,
          finalTargetLanguage,
          finalNativeLanguage
        );
        if (newSet) {
          clearForm();
          showAlert(t('common:status.success'), t('success.created'), [
            { text: 'OK', onPress: () => router.push(`/sets/${newSet.id}`) },
          ]);
        } else {
          showAlert(t('common:status.error'), t('errors.createFailed'));
        }
      }
    } catch (error: any) {
      console.error('Error saving set:', error);
      let errorMessage = t('errors.createFailed');
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
              <View style={styles.headerTitleSection}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {isEditing ? t('editTitle') : t('title')}
                </Text>
                {preferences.targetLanguage && preferences.nativeLanguage && (
                  <LanguageBadge
                    targetLanguage={preferences.targetLanguage}
                    nativeLanguage={preferences.nativeLanguage}
                    size="small"
                    compact={true}
                  />
                )}
              </View>
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
                {saving ? t('common:buttons.saving') : t('common:buttons.save')}
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
            </View>

            {/* Right Column - Preview */}
            <View style={styles.rightColumn}>
              <Card style={styles.previewCard}>
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  {t('common:buttons.preview', { defaultValue: 'Preview' })}
                </Text>
                <View style={styles.previewContent}>
                  <View style={styles.previewHeader}>
                    <Text
                      style={[styles.previewSetName, { color: colors.text }]}
                    >
                      {setName.trim() || t('common:status.untitled', { defaultValue: 'Untitled Set' })}
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
                        {t('common:counts.wordCount', { count: filledPairs.length })}
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
                          +{t('common:counts.wordCount', { count: filledPairs.length - 5 })} {t('common:buttons.more', { defaultValue: 'more' })}
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
                        {t('common:status.addWordsPreview', { defaultValue: 'Add words to see preview' })}
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

      <BulkImportModal
        visible={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={handleBulkImport}
        maxWords={MAX_WORDS_PER_SET}
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
  headerTitleSection: {
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
