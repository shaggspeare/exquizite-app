import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Typography, BorderRadius } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface DuplicateWordModalProps {
  visible: boolean;
  word: string;
  translation: string;
  onKeep: () => void;
  onRemove: () => void;
}

export function DuplicateWordModal({
  visible,
  word,
  translation,
  onKeep,
  onRemove,
}: DuplicateWordModalProps) {
  const { t } = useTranslation('create');
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRemove}
    >
      <TouchableWithoutFeedback onPress={onRemove}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, { backgroundColor: colors.card }]}>
              <View style={styles.header}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${colors.warning}20` },
                  ]}
                >
                  <Ionicons
                    name="warning-outline"
                    size={32}
                    color={colors.warning}
                  />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {t('duplicateWord.title')}
                </Text>
              </View>

              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {t('duplicateWord.message', { word, translation })}
              </Text>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.removeButton,
                    {
                      backgroundColor: `${colors.error}10`,
                      borderColor: colors.error,
                    },
                  ]}
                  onPress={onRemove}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.buttonText, { color: colors.error }]}>
                    {t('duplicateWord.remove')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.keepButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={onKeep}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    {t('duplicateWord.keep')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  removeButton: {
    borderWidth: 2,
  },
  keepButton: {
    // No additional styles needed
  },
  buttonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
  },
});
