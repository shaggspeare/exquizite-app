import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WordPair } from '@/lib/types';
import { generateWordSuggestions } from '@/lib/ai-helpers';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface AISuggestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectWords: (words: WordPair[]) => void;
}

export function AISuggestionModal({
  visible,
  onClose,
  onSelectWords,
}: AISuggestionModalProps) {
  const [theme, setTheme] = useState('');
  const [suggestions, setSuggestions] = useState<WordPair[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      return;
    }

    setLoading(true);
    try {
      const words = await generateWordSuggestions(theme, 'Ukrainian');
      setSuggestions(words);
      setSelectedIds(new Set(words.map(w => w.id)));
    } catch (error) {
      console.error('Error generating suggestions:', error);
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
    setSuggestions([]);
    setSelectedIds(new Set());
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Word Suggestions</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Input
              placeholder="Enter a theme (e.g., animals, colors, food)"
              value={theme}
              onChangeText={setTheme}
              style={styles.input}
            />
            <Button
              title="Generate"
              onPress={handleGenerate}
              disabled={loading || !theme.trim()}
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.ai} />
              <Text style={styles.loadingText}>
                Generating suggestions with AI...
              </Text>
            </View>
          )}

          {!loading && suggestions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                Select words to add ({selectedIds.size} selected)
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
                        selectedIds.has(item.id) && styles.selectedCard,
                      ]}
                    >
                      <View style={styles.suggestionContent}>
                        <View style={styles.wordInfo}>
                          <Text style={styles.word}>{item.word}</Text>
                          <Text style={styles.translation}>
                            {item.translation}
                          </Text>
                        </View>
                        {selectedIds.has(item.id) && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={Colors.success}
                          />
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.footer}>
                <Button
                  title={`Add ${selectedIds.size} ${
                    selectedIds.size === 1 ? 'word' : 'words'
                  }`}
                  onPress={handleAdd}
                  disabled={selectedIds.size === 0}
                />
              </View>
            </>
          )}

          {!loading && suggestions.length === 0 && theme && (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                No suggestions yet. Click Generate to get AI-powered word
                suggestions!
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  suggestionCard: {
    marginBottom: Spacing.sm,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}10`,
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
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  translation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.md,
  },
});
