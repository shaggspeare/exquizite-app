import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { WordPair } from '@/lib/types';
import { Spacing, Typography, BorderRadius } from '@/lib/constants';
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
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.inputs}>
        <TextInput
          style={[
            styles.input,
            styles.wordInput,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Word"
          placeholderTextColor={colors.textSecondary}
          value={pair.word}
          onChangeText={onChangeWord}
        />
        <TextInput
          style={[
            styles.input,
            styles.translationInput,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Translation"
          placeholderTextColor={colors.textSecondary}
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
          <Ionicons name="close-circle" size={24} color={colors.error} />
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
    ...Platform.select({
      web: {
        maxWidth: '100%',
      },
    }),
  },
  inputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Platform.select({
      web: {
        maxWidth: '100%',
        width: '100%',
      },
    }),
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    minHeight: 44,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        maxWidth: '50%',
      },
    }),
  },
  wordInput: {
    flex: 1,
    ...Platform.select({
      web: {
        minWidth: 0,
      },
    }),
  },
  translationInput: {
    flex: 1,
    ...Platform.select({
      web: {
        minWidth: 0,
      },
    }),
  },
  deleteButton: {
    padding: Spacing.xs,
    ...Platform.select({
      web: {
        flexShrink: 0,
      },
    }),
  },
});
