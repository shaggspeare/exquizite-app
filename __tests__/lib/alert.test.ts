import { Alert, Platform } from 'react-native';

// Mock react-native
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

// Mock platform-utils
jest.mock('../../lib/platform-utils', () => ({
  isDesktopWeb: jest.fn(() => false),
}));

// Import after mocks are set up
import { setCustomAlertFn, showAlert, confirm } from '../../lib/alert';

describe('alert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    // Reset custom alert function
    setCustomAlertFn(null);
  });

  describe('setCustomAlertFn', () => {
    it('sets custom alert function that is used on web', () => {
      (Platform as any).OS = 'web';
      const customFn = jest.fn();

      setCustomAlertFn(customFn);
      showAlert('Test Title', 'Test Message');

      expect(customFn).toHaveBeenCalledWith({
        title: 'Test Title',
        message: 'Test Message',
        buttons: undefined,
      });
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('can clear custom alert function', () => {
      (Platform as any).OS = 'web';

      setCustomAlertFn(null);
      showAlert('Test Title', 'Test Message');

      // Falls back to native Alert when custom fn is null
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('showAlert', () => {
    it('uses native Alert on iOS', () => {
      (Platform as any).OS = 'ios';

      showAlert('Title', 'Message');

      expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message', undefined);
    });

    it('uses native Alert on Android', () => {
      (Platform as any).OS = 'android';

      showAlert('Title', 'Message');

      expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message', undefined);
    });

    it('uses custom alert on web when set', () => {
      (Platform as any).OS = 'web';
      const customFn = jest.fn();
      setCustomAlertFn(customFn);

      showAlert('Title', 'Message');

      expect(customFn).toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('passes buttons to custom alert', () => {
      (Platform as any).OS = 'web';
      const customFn = jest.fn();
      setCustomAlertFn(customFn);

      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        { text: 'OK', onPress: jest.fn() },
      ];

      showAlert('Title', 'Message', buttons);

      expect(customFn).toHaveBeenCalledWith({
        title: 'Title',
        message: 'Message',
        buttons,
      });
    });

    it('passes buttons to native Alert', () => {
      (Platform as any).OS = 'ios';

      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        { text: 'OK', onPress: jest.fn() },
      ];

      showAlert('Title', 'Message', buttons);

      expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message', buttons);
    });

    it('handles undefined message', () => {
      (Platform as any).OS = 'ios';

      showAlert('Title Only');

      expect(Alert.alert).toHaveBeenCalledWith('Title Only', undefined, undefined);
    });
  });

  describe('confirm', () => {
    it('returns true when OK is pressed', async () => {
      (Platform as any).OS = 'ios';

      // Mock Alert.alert to simulate OK button press
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const okButton = buttons?.find((b: any) => b.text === 'OK');
        okButton?.onPress?.();
      });

      const result = await confirm('Are you sure?');

      expect(result).toBe(true);
    });

    it('returns false when Cancel is pressed', async () => {
      (Platform as any).OS = 'ios';

      // Mock Alert.alert to simulate Cancel button press
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const cancelButton = buttons?.find((b: any) => b.text === 'Cancel');
        cancelButton?.onPress?.();
      });

      const result = await confirm('Are you sure?');

      expect(result).toBe(false);
    });

    it('shows confirm dialog with correct title and message', async () => {
      (Platform as any).OS = 'ios';

      // Mock to capture the call and resolve
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        buttons?.[1]?.onPress?.(); // Press OK
      });

      await confirm('Delete this item?');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm',
        'Delete this item?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'OK' }),
        ])
      );
    });

    it('works with custom alert on web', async () => {
      (Platform as any).OS = 'web';
      const customFn = jest.fn().mockImplementation(({ buttons }) => {
        const okButton = buttons?.find((b: any) => b.text === 'OK');
        okButton?.onPress?.();
      });
      setCustomAlertFn(customFn);

      const result = await confirm('Are you sure?');

      expect(result).toBe(true);
      expect(customFn).toHaveBeenCalled();
    });
  });
});
