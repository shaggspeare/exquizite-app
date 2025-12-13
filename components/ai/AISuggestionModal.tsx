import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, getLanguageName } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { WordPair } from '@/lib/types';
import { generateWordSuggestions } from '@/lib/ai-helpers';
import * as OpenAIService from '@/lib/openai-service';
import {
  Spacing,
  Typography,
  MAX_WORDS_PER_SET,
  BorderRadius,
  Shadow,
} from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface AISuggestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectWords: (words: WordPair[]) => void;
  existingPairs?: WordPair[];
}

export function AISuggestionModal({
  visible,
  onClose,
  onSelectWords,
  existingPairs = [],
}: AISuggestionModalProps) {
  const { colors } = useTheme();
  const { preferences } = useLanguage();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation('create');
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState('5');
  const [suggestions, setSuggestions] = useState<WordPair[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Filter existing pairs to only include valid ones (both word and translation filled)
  const validExistingPairs = existingPairs.filter(
    pair => pair.word.trim() && pair.translation.trim()
  );
  const hasExistingPairs = validExistingPairs.length > 0;

  // Calculate max count based on available slots (only count valid filled pairs)
  const maxCount = MAX_WORDS_PER_SET - validExistingPairs.length;
  const countNum = Math.min(Math.max(1, parseInt(count) || 5), maxCount);

  // Auto-generate when modal opens if there are existing pairs
  useEffect(() => {
    if (visible && hasExistingPairs) {
      handleGenerateFromContext();
    }
  }, [visible, hasExistingPairs]);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();

    setLoading(true);
    setSuggestions([]); // Clear previous suggestions
    try {
      const targetLangName = getLanguageName(preferences.targetLanguage);
      const nativeLangName = getLanguageName(preferences.nativeLanguage);

      const words = await generateWordSuggestions(
        theme,
        targetLangName,
        nativeLangName,
        countNum
      );
      setSuggestions(words);
      setSelectedIds(new Set(words.map(w => w.id)));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromContext = async () => {
    setLoading(true);
    setSuggestions([]); // Clear previous suggestions
    try {
      const targetLangName = getLanguageName(preferences.targetLanguage);
      const nativeLangName = getLanguageName(preferences.nativeLanguage);

      const words = await OpenAIService.generateWordSuggestionsFromContext(
        validExistingPairs,
        targetLangName,
        nativeLangName,
        countNum
      );
      setSuggestions(words);
      setSelectedIds(new Set(words.map(w => w.id)));
    } catch (error) {
      console.error('Error generating suggestions from context:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAdd = () => {
    const selectedWords = suggestions.filter(w => selectedIds.has(w.id));
    onSelectWords(selectedWords);
    handleClose();
  };

  const handleClose = () => {
    setTheme('');
    setCount('5');
    setSuggestions([]);
    setSelectedIds(new Set());
    setLoading(false);
    onClose();
  };

  const renderSkeletonCard = () => (
    <Card style={styles.suggestionCard}>
      <View style={styles.suggestionContent}>
        <View style={styles.wordInfo}>
          <View
            style={[
              styles.skeleton,
              styles.skeletonWord,
              { backgroundColor: colors.border },
            ]}
          />
          <View
            style={[
              styles.skeleton,
              styles.skeletonTranslation,
              { backgroundColor: colors.border },
            ]}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={isDesktop ? 'overFullScreen' : 'pageSheet'}
      onRequestClose={handleClose}
      transparent={isDesktop}
    >
      {isDesktop ? (
        // Desktop centered modal
        <View style={styles.desktopOverlay}>
          <View
            style={[
              styles.desktopModal,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.header,
                {
                  backgroundColor: colors.card,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t('ai.modalTitle')}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.desktopContent}
              showsVerticalScrollIndicator={false}
            >
              {!hasExistingPairs && (
                <View style={styles.inputSection}>
                  <View style={styles.inputRow}>
                    <View style={styles.themeInputWrapper}>
                      <Input
                        placeholder={t('ai.themePlaceholder')}
                        value={theme}
                        onChangeText={setTheme}
                        editable={!loading}
                      />
                    </View>
                    <View style={styles.countInputWrapper}>
                      <Input
                        placeholder={t('ai.countPlaceholder')}
                        value={count}
                        onChangeText={setCount}
                        keyboardType="number-pad"
                        editable={!loading}
                        maxLength={2}
                      />
                    </View>
                  </View>
                  <Text
                    style={[styles.helperText, { color: colors.textSecondary }]}
                  >
                    {t('ai.countHint', { max: maxCount })}
                  </Text>
                  <Button
                    title={loading ? t('common:buttons.generating') : t('common:buttons.generate')}
                    onPress={handleGenerate}
                    disabled={loading || !theme.trim()}
                  />
                </View>
              )}

              {hasExistingPairs && (
                <View style={styles.contextInfo}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.contextText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t('ai.generatingWithContext', {
                      count: validExistingPairs.length,
                      word: validExistingPairs.length === 1 ? t('common:counts.word') : t('common:counts.words')
                    })}
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingSection}>
                  <View style={styles.loadingHeader}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text
                      style={[
                        styles.loadingHeaderText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('ai.generatingGeneric')}
                    </Text>
                  </View>
                  {Array.from({ length: countNum }).map((_, index) => (
                    <View key={index}>{renderSkeletonCard()}</View>
                  ))}
                </View>
              )}

              {!loading && suggestions.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('ai.selectPrompt', { count: selectedIds.size })}
                  </Text>
                  {isDesktop ? (
                    // Desktop grid layout
                    <View style={styles.desktopGrid}>
                      {suggestions.map(item => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => toggleSelection(item.id)}
                          activeOpacity={0.7}
                          style={styles.desktopGridItem}
                        >
                          <Card
                            style={[
                              styles.suggestionCard,
                              selectedIds.has(item.id) && {
                                borderWidth: 2,
                                borderColor: colors.success,
                                backgroundColor: `${colors.success}10`,
                              },
                            ]}
                          >
                            <View style={styles.suggestionContent}>
                              <View style={styles.wordInfo}>
                                <Text
                                  style={[styles.word, { color: colors.text }]}
                                >
                                  {item.word}
                                </Text>
                                <Text
                                  style={[
                                    styles.translation,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  {item.translation}
                                </Text>
                              </View>
                              {selectedIds.has(item.id) && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color={colors.success}
                                />
                              )}
                            </View>
                          </Card>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    // Mobile list layout
                    <FlatList
                      data={suggestions}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => toggleSelection(item.id)}
                          activeOpacity={0.7}
                        >
                          <Card
                            style={[
                              styles.suggestionCard,
                              selectedIds.has(item.id) && {
                                borderWidth: 2,
                                borderColor: colors.success,
                                backgroundColor: `${colors.success}10`,
                              },
                            ]}
                          >
                            <View style={styles.suggestionContent}>
                              <View style={styles.wordInfo}>
                                <Text
                                  style={[styles.word, { color: colors.text }]}
                                >
                                  {item.word}
                                </Text>
                                <Text
                                  style={[
                                    styles.translation,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  {item.translation}
                                </Text>
                              </View>
                              {selectedIds.has(item.id) && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color={colors.success}
                                />
                              )}
                            </View>
                          </Card>
                        </TouchableOpacity>
                      )}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </>
              )}

              {!loading && suggestions.length === 0 && theme && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="sparkles"
                    size={64}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    {t('ai.noSuggestions')}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Sticky footer for desktop */}
            {!loading && suggestions.length > 0 && (
              <View
                style={[
                  styles.desktopFooter,
                  {
                    borderTopColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Button
                  title={t('ai.addSelected', {
                    count: selectedIds.size,
                    word: selectedIds.size === 1 ? t('common:counts.word') : t('common:counts.words')
                  })}
                  onPress={handleAdd}
                  disabled={selectedIds.size === 0}
                />
              </View>
            )}
          </View>
        </View>
      ) : (
        // Mobile full-screen modal
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              AI Word Suggestions
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!hasExistingPairs && (
              <View style={styles.inputSection}>
                <View style={styles.inputRow}>
                  <View style={styles.themeInputWrapper}>
                    <Input
                      placeholder={t('ai.themePlaceholder')}
                      value={theme}
                      onChangeText={setTheme}
                      editable={!loading}
                    />
                  </View>
                  <View style={styles.countInputWrapper}>
                    <Input
                      placeholder={t('ai.countPlaceholder')}
                      value={count}
                      onChangeText={setCount}
                      keyboardType="number-pad"
                      editable={!loading}
                      maxLength={2}
                    />
                  </View>
                </View>
                <Text
                  style={[styles.helperText, { color: colors.textSecondary }]}
                >
                  {t('ai.countHint', { max: maxCount })}
                </Text>
                <Button
                  title={loading ? t('common:buttons.generating') : t('common:buttons.generate')}
                  onPress={handleGenerate}
                  disabled={loading || !theme.trim()}
                />
              </View>
            )}

            {hasExistingPairs && (
              <View style={styles.contextInfo}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[styles.contextText, { color: colors.textSecondary }]}
                >
                  {t('ai.generatingWithContext', {
                    count: validExistingPairs.length,
                    word: validExistingPairs.length === 1 ? t('common:counts.word') : t('common:counts.words')
                  })}
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.loadingSection}>
                <View style={styles.loadingHeader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text
                    style={[
                      styles.loadingHeaderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t('ai.generatingGeneric')}
                  </Text>
                </View>
                {Array.from({ length: countNum }).map((_, index) => (
                  <View key={index}>{renderSkeletonCard()}</View>
                ))}
              </View>
            )}

            {!loading && suggestions.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('ai.selectPrompt', { count: selectedIds.size })}
                </Text>
                <FlatList
                  data={suggestions}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => toggleSelection(item.id)}
                      activeOpacity={0.7}
                    >
                      <Card
                        style={[
                          styles.suggestionCard,
                          selectedIds.has(item.id) && {
                            borderWidth: 2,
                            borderColor: colors.success,
                            backgroundColor: `${colors.success}10`,
                          },
                        ]}
                      >
                        <View style={styles.suggestionContent}>
                          <View style={styles.wordInfo}>
                            <Text style={[styles.word, { color: colors.text }]}>
                              {item.word}
                            </Text>
                            <Text
                              style={[
                                styles.translation,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {item.translation}
                            </Text>
                          </View>
                          {selectedIds.has(item.id) && (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color={colors.success}
                            />
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />

                <View
                  style={[styles.footer, { borderTopColor: colors.border }]}
                >
                  <Button
                    title={t('ai.addSelected', {
                      count: selectedIds.size,
                      word: selectedIds.size === 1 ? t('common:counts.word') : t('common:counts.words')
                    })}
                    onPress={handleAdd}
                    disabled={selectedIds.size === 0}
                  />
                </View>
              </>
            )}

            {!loading && suggestions.length === 0 && theme && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="sparkles"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  {t('ai.noSuggestions')}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Desktop modal styles
  desktopOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  desktopModal: {
    width: '100%',
    maxWidth: 900,
    maxHeight: '90%',
    borderRadius: BorderRadius.cardLarge,
    overflow: 'hidden',
    ...Shadow.cardDeep,
  },
  desktopContent: {
    padding: Spacing.xxl,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  desktopGridItem: {
    width: 'calc(50% - 8px)' as any,
    minWidth: 280,
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  themeInputWrapper: {
    flex: 1,
    minWidth: 0,
    marginRight: Spacing.sm,
  },
  countInputWrapper: {
    width: 50,
    flexShrink: 0,
  },
  helperText: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  loadingSection: {
    flex: 1,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  loadingHeaderText: {
    ...Typography.body,
    fontSize: 16,
  },
  skeleton: {
    borderRadius: 6,
  },
  skeletonWord: {
    height: 20,
    width: '60%',
    marginBottom: Spacing.xs,
  },
  skeletonTranslation: {
    height: 16,
    width: '40%',
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  suggestionCard: {
    marginBottom: Spacing.sm,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordInfo: {
    flex: 1,
  },
  word: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  translation: {
    ...Typography.caption,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.md,
  },
  desktopFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  contextInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: 8,
    backgroundColor: `rgba(0, 122, 255, 0.1)`,
  },
  contextText: {
    ...Typography.body,
    flex: 1,
  },
});
