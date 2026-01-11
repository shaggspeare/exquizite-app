import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { WordPair } from '@/lib/types';

interface BulkImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (words: WordPair[]) => void;
  maxWords: number;
}

export function BulkImportModal({
  visible,
  onClose,
  onImport,
  maxWords,
}: BulkImportModalProps) {
  const { t } = useTranslation('create');
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const [inputText, setInputText] = useState('');
  const [separator, setSeparator] = useState('tab');
  const [previewWords, setPreviewWords] = useState<WordPair[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const previewRef = useRef<View>(null);

  const handlePreview = () => {
    if (!inputText.trim()) {
      setPreviewWords([]);
      return;
    }

    const lines = inputText.split('\n').filter(line => line.trim());

    const parsedWords: WordPair[] = lines
      .map((line, index) => {
        let parts: string[];

        if (separator === 'tab') {
          // Try tab first
          if (line.includes('\t')) {
            parts = line.split('\t').map(p => p.trim());
          } else {
            // Fallback strategies for iOS:
            // 1. Try splitting on 2+ consecutive spaces
            const multiSpaceParts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p);

            // 2. If that doesn't work, try splitting on any whitespace and take first and last
            if (multiSpaceParts.length < 2) {
              const words = line.split(/\s+/).filter(p => p.trim());
              if (words.length >= 2) {
                // Take first word and rest as translation
                parts = [words[0], words.slice(1).join(' ')];
              } else {
                parts = multiSpaceParts;
              }
            } else {
              parts = multiSpaceParts;
            }
          }
        } else {
          const separatorChar = separator === 'comma' ? ',' : '-';
          parts = line.split(separatorChar).map(p => p.trim());
        }

        if (parts.length >= 2 && parts[0] && parts[1]) {
          return {
            id: `bulk-${Date.now()}-${index}`,
            word: parts[0],
            translation: parts[1],
          };
        }
        return null;
      })
      .filter((pair): pair is WordPair => pair !== null)
      .slice(0, maxWords);

    setPreviewWords(parsedWords);

    // Auto-scroll to preview section after a short delay to ensure rendering is complete
    setTimeout(() => {
      if (parsedWords.length > 0 && previewRef.current) {
        previewRef.current.measureLayout(
          scrollViewRef.current as any,
          (_x, y) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => {
            // Fallback: scroll to end if measurement fails
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }
    }, 100);
  };

  const handleImport = () => {
    if (previewWords.length > 0) {
      onImport(previewWords);
      handleClose();
    }
  };

  const handleClose = () => {
    setInputText('');
    setPreviewWords([]);
    setSeparator('tab');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      presentationStyle={isDesktop ? undefined : 'pageSheet'}
      transparent={isDesktop}
      onRequestClose={handleClose}
    >
      <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
        {isDesktop && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            ]}
          />
        )}
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background },
            isDesktop && styles.containerDesktop,
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.card, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('bulkImport.title')}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions */}
          <Card style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.instructionsTitle, { color: colors.text }]}>
                {t('bulkImport.howTo')}
              </Text>
            </View>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              {t('bulkImport.instructions')}
            </Text>
            <View style={styles.exampleContainer}>
              <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>
                {t('bulkImport.example')}
              </Text>
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  hello{'\t'}hola
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  goodbye{'\t'}adiós
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  thank you{'\t'}gracias
                </Text>
              </View>
            </View>
          </Card>

          {/* Separator Selection */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('bulkImport.separator')}
            </Text>
            <View style={styles.separatorOptions}>
              {['tab', 'comma', 'dash'].map(sep => (
                <TouchableOpacity
                  key={sep}
                  style={[
                    styles.separatorOption,
                    {
                      backgroundColor:
                        separator === sep ? `${colors.primary}20` : colors.card,
                      borderColor:
                        separator === sep ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSeparator(sep)}
                >
                  <Text
                    style={[
                      styles.separatorText,
                      {
                        color: separator === sep ? colors.primary : colors.text,
                        fontWeight: separator === sep ? '600' : '400',
                      },
                    ]}
                  >
                    {t(`bulkImport.separators.${sep}`)}
                  </Text>
                  {separator === sep && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Input Area */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('bulkImport.pasteWords')}
            </Text>
            <View
              style={[
                styles.textInputContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={t('bulkImport.placeholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                style={[
                  styles.textInput,
                  { color: colors.text },
                  Platform.OS === 'web' && ({ outline: 'none' } as any),
                ]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </Card>

          {/* Preview */}
          {previewWords.length > 0 && (
            <View ref={previewRef}>
              <Card style={styles.section}>
                <View style={styles.previewHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('bulkImport.previewTitle')}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <Text style={[styles.countText, { color: colors.primary }]}>
                      {previewWords.length}
                    </Text>
                  </View>
                </View>
                <ScrollView
                  style={styles.previewList}
                  contentContainerStyle={styles.previewListContent}
                  nestedScrollEnabled
                >
                  {previewWords.map((pair, index) => (
                    <View
                      key={pair.id}
                      style={[
                        styles.previewItem,
                        { borderBottomColor: colors.border },
                        index === previewWords.length - 1 && styles.previewItemLast,
                      ]}
                    >
                      <Text style={[styles.previewIndex, { color: colors.textSecondary }]}>
                        {index + 1}.
                      </Text>
                      <Text style={[styles.previewWord, { color: colors.text }]}>
                        {pair.word}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.previewTranslation, { color: colors.text }]}>
                        {pair.translation}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </Card>
            </View>
          )}
        </ScrollView>

        {/* Sticky Preview Button */}
        <View
          style={[
            styles.stickyButtonContainer,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Button
            title={t('bulkImport.previewPairs')}
            onPress={handlePreview}
            variant="outline"
            style={styles.stickyPreviewButton}
            textStyle={styles.stickyPreviewButtonText}
          />
        </View>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <Button
            title={t('common:buttons.cancel')}
            onPress={handleClose}
            variant="outline"
            style={styles.footerButton}
            textStyle={styles.footerButtonText}
          />
          <Button
            title={t('bulkImport.import', { count: previewWords.length })}
            onPress={handleImport}
            disabled={previewWords.length === 0}
            style={styles.footerButton}
            textStyle={styles.footerButtonText}
          />
        </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    flex: 1,
  },
  containerDesktop: {
    maxWidth: 700,
    maxHeight: '85%',
    width: '100%',
    height: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
    }),
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
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  instructionsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  instructionsTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsText: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  exampleContainer: {
    gap: Spacing.xs,
  },
  exampleLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleBox: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  exampleText: {
    ...Typography.body,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  section: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  separatorOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  separatorOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  separatorText: {
    ...Typography.body,
    fontSize: 14,
  },
  textInputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  textInput: {
    ...Typography.body,
    fontSize: 14,
    padding: Spacing.md,
    minHeight: 150,
    maxHeight: 250,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewButton: {
    marginTop: 0,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '700',
  },
  previewList: {
    maxHeight: 200,
  },
  previewListContent: {
    gap: 0,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  previewItemLast: {
    borderBottomWidth: 0,
  },
  previewIndex: {
    ...Typography.caption,
    fontSize: 12,
    width: 24,
  },
  previewWord: {
    ...Typography.body,
    fontSize: 14,
    flex: 1,
  },
  previewTranslation: {
    ...Typography.body,
    fontSize: 14,
    flex: 1,
  },
  stickyButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  stickyPreviewButton: {
    marginTop: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  stickyPreviewButtonText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  footerButtonText: {
    fontSize: 14,
  },
});
