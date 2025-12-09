import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, BorderRadius, Typography, Shadow } from '@/lib/constants';
import { isDesktopWeb } from '@/lib/platform-utils';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

export function AlertDialog({
  visible,
  title,
  message,
  buttons = [],
  onClose,
}: AlertDialogProps) {
  const { colors } = useTheme();
  const isDesktop = Platform.OS === 'web' && isDesktopWeb();
  const isMobile = SCREEN_WIDTH < 768;

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      try {
        const result = button.onPress();
        if (result instanceof Promise) {
          result.catch(error => {
            console.error('Error in alert button handler:', error);
          });
        }
      } catch (error: any) {
        console.error('Error in alert button handler:', error);
      }
    }
    onClose();
  };

  // Get icon based on button styles
  const getIcon = () => {
    const hasDestructive = buttons.some(b => b.style === 'destructive');
    const iconSize = isMobile ? 48 : 56;
    if (hasDestructive) {
      return <Ionicons name="warning" size={iconSize} color={colors.error} />;
    }
    return (
      <Ionicons
        name="information-circle"
        size={iconSize}
        color={colors.primary}
      />
    );
  };

  // Sort buttons: cancel buttons first, then default, then destructive
  const sortedButtons = [...buttons].sort((a, b) => {
    const order = { cancel: 0, default: 1, destructive: 2 };
    const aOrder = order[a.style || 'default'];
    const bOrder = order[b.style || 'default'];
    return aOrder - bOrder;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.6)' },
            ]}
          />
        )}

        <View style={styles.dialogContainer}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: colors.card },
              isMobile && styles.dialogMobile,
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                isMobile && styles.iconContainerMobile,
              ]}
            >
              {getIcon()}
            </View>

            {/* Title */}
            <Text
              style={[
                styles.title,
                { color: colors.text },
                isMobile && styles.titleMobile,
              ]}
            >
              {title}
            </Text>

            {/* Message */}
            {message && (
              <Text
                style={[
                  styles.message,
                  { color: colors.textSecondary },
                  isMobile && styles.messageMobile,
                ]}
              >
                {message}
              </Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {sortedButtons.length === 0 ? (
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.primary },
                    isMobile && styles.buttonMobile,
                  ]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.buttonText, { color: '#FFFFFF' }]}
                    numberOfLines={1}
                  >
                    OK
                  </Text>
                </TouchableOpacity>
              ) : sortedButtons.length === 1 ? (
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        sortedButtons[0].style === 'destructive'
                          ? colors.error
                          : colors.primary,
                    },
                    isMobile && styles.buttonMobile,
                  ]}
                  onPress={() => handleButtonPress(sortedButtons[0])}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.buttonText, { color: '#FFFFFF' }]}
                    numberOfLines={1}
                  >
                    {sortedButtons[0].text}
                  </Text>
                </TouchableOpacity>
              ) : (
                sortedButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'destructive' && {
                        backgroundColor: colors.error,
                      },
                      button.style === 'default' && {
                        backgroundColor: colors.primary,
                      },
                      button.style === 'cancel' && {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                      isMobile && styles.buttonMobile,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'cancel'
                          ? { color: colors.text }
                          : { color: '#FFFFFF' },
                      ]}
                      numberOfLines={1}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 420,
  },
  dialog: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    ...Shadow.cardDeep,
    alignItems: 'center',
  },
  dialogMobile: {
    padding: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconContainerMobile: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  titleMobile: {
    fontSize: 20,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  messageMobile: {
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    ...Shadow.button,
  },
  buttonMobile: {
    paddingHorizontal: Spacing.sm,
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
