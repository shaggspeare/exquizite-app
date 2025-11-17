import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { WordPair } from '@/lib/types';
import { Colors, Spacing, Typography, BorderRadius } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface WordPairInputProps {
  pair: WordPair;
  onChangeWord: (text: string) => void;
  onChangeTranslation: (text: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function WordPairInput({
  pair,
  onChangeWord,
  onChangeTranslation,
  onDelete,
  canDelete,
}: WordPairInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputs}>
        <TextInput
          style={[styles.input, styles.wordInput]}
          placeholder="Word"
          placeholderTextColor={Colors.textSecondary}
          value={pair.word}
          onChangeText={onChangeWord}
        />
        <TextInput
          style={[styles.input, styles.translationInput]}
          placeholder="Translation"
          placeholderTextColor={Colors.textSecondary}
          value={pair.translation}
          onChangeText={onChangeTranslation}
        />
      </View>
      {canDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={24} color={Colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  inputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.card,
    minHeight: 44,
  },
  wordInput: {
    flex: 1,
  },
  translationInput: {
    flex: 1,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
});
