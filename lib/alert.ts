import { Alert, Platform } from 'react-native';
import { isDesktopWeb } from './platform-utils';

// Global reference to the custom alert function (set by AlertProvider)
let customAlertFn:
  | ((config: {
      title: string;
      message?: string;
      buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
      }>;
    }) => void)
  | null = null;

/**
 * Sets the custom alert function (called by AlertProvider)
 * @internal
 */
export function setCustomAlertFn(fn: typeof customAlertFn) {
  customAlertFn = fn;
}

/**
 * Cross-platform alert function
 * - Web (Desktop & Mobile): Uses custom AlertDialog component (UX-friendly)
 * - Native iOS/Android: Uses native Alert.alert
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
): void {
  // Use custom alert for all web platforms (desktop and mobile)
  if (Platform.OS === 'web' && customAlertFn) {
    customAlertFn({ title, message, buttons });
    return;
  }

  // Native implementation (iOS/Android) - use system Alert
  Alert.alert(title, message, buttons);
}

/**
 * Simple confirmation dialog
 * Returns true if user confirmed, false otherwise
 */
export async function confirm(message: string): Promise<boolean> {
  return new Promise(resolve => {
    showAlert('Confirm', message, [
      { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
      { text: 'OK', onPress: () => resolve(true) },
    ]);
  });
}
