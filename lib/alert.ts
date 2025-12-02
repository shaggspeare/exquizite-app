import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert function
 * - Native: Uses Alert.alert
 * - Web: Uses window.confirm for confirmations, window.alert for simple alerts
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
  if (Platform.OS === 'web') {
    // Web implementation
    if (!buttons || buttons.length === 0) {
      // Simple alert
      window.alert(message ? `${title}\n\n${message}` : title);
    } else if (buttons.length === 1) {
      // Single button alert
      window.alert(message ? `${title}\n\n${message}` : title);
      if (buttons[0].onPress) {
        try {
          const result = buttons[0].onPress();
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error('Error in alert button handler:', error);
              window.alert(`Error: ${error.message || 'An error occurred'}`);
            });
          }
        } catch (error: any) {
          console.error('Error in alert button handler:', error);
          window.alert(`Error: ${error.message || 'An error occurred'}`);
        }
      }
    } else {
      // Confirmation dialog (2+ buttons)
      const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);

      // Find the appropriate button to call
      const confirmButton = buttons.find(b => b.style === 'destructive' || b.style === 'default');
      const cancelButton = buttons.find(b => b.style === 'cancel');

      if (confirmed && confirmButton?.onPress) {
        // Wrap in try-catch and handle async operations
        try {
          const result = confirmButton.onPress();
          // If the onPress returns a promise, handle errors
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error('Error in alert button handler:', error);
              window.alert(`Error: ${error.message || 'An error occurred'}`);
            });
          }
        } catch (error: any) {
          console.error('Error in alert button handler:', error);
          window.alert(`Error: ${error.message || 'An error occurred'}`);
        }
      } else if (!confirmed && cancelButton?.onPress) {
        try {
          const result = cancelButton.onPress();
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error('Error in alert button handler:', error);
            });
          }
        } catch (error: any) {
          console.error('Error in alert button handler:', error);
        }
      }
    }
  } else {
    // Native implementation
    Alert.alert(title, message, buttons);
  }
}

/**
 * Simple confirmation dialog
 * Returns true if user confirmed, false otherwise
 */
export async function confirm(message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return window.confirm(message);
  } else {
    return new Promise((resolve) => {
      Alert.alert('Confirm', message, [
        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
        { text: 'OK', onPress: () => resolve(true) },
      ]);
    });
  }
}
