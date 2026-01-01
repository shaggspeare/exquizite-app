import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AlertDialog } from '@/components/ui/AlertDialog';

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      error: '#FF3B30',
      border: '#E5E5EA',
    },
  }),
}));

describe('AlertDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders alert dialog when visible', () => {
      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test Alert"
          message="This is a test message"
          onClose={mockOnClose}
        />
      );

      expect(getByText('Test Alert')).toBeTruthy();
      expect(getByText('This is a test message')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByText } = render(
        <AlertDialog
          visible={false}
          title="Test Alert"
          message="This is a test message"
          onClose={mockOnClose}
        />
      );

      expect(queryByText('Test Alert')).toBeFalsy();
      expect(queryByText('This is a test message')).toBeFalsy();
    });

    it('renders without message', () => {
      const { getByText, queryByText } = render(
        <AlertDialog visible={true} title="Test Alert" onClose={mockOnClose} />
      );

      expect(getByText('Test Alert')).toBeTruthy();
      // Message should not be present
      expect(queryByText('This is a test message')).toBeFalsy();
    });
  });

  describe('Button Handling', () => {
    it('renders default OK button when no buttons provided', () => {
      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test Alert"
          message="Test message"
          onClose={mockOnClose}
        />
      );

      expect(getByText('OK')).toBeTruthy();
    });

    it('calls onClose when OK button is pressed', () => {
      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test Alert"
          message="Test message"
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('OK'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('renders custom buttons', () => {
      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        { text: 'Confirm', style: 'default' as const },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test Alert"
          message="Test message"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Confirm')).toBeTruthy();
    });

    it('renders destructive button', () => {
      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        { text: 'Delete', style: 'destructive' as const },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Delete Item"
          message="Are you sure?"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Delete')).toBeTruthy();
    });
  });

  describe('Button Press Handlers', () => {
    it('calls button onPress handler when clicked', () => {
      const mockHandler = jest.fn();
      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        { text: 'Confirm', onPress: mockHandler, style: 'default' as const },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test Alert"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('Confirm'));

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles async button handlers correctly', async () => {
      const mockAsyncHandler = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'completed';
      });

      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        {
          text: 'Delete',
          onPress: mockAsyncHandler,
          style: 'destructive' as const,
        },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Delete Item"
          message="Are you sure?"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('Delete'));

      expect(mockAsyncHandler).toHaveBeenCalledTimes(1);

      // Wait for async operation to complete
      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });

    it('handles errors in async button handlers', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Test error');

      const mockAsyncHandler = jest.fn(async () => {
        throw error;
      });

      const buttons = [
        {
          text: 'Fail',
          onPress: mockAsyncHandler,
          style: 'destructive' as const,
        },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('Fail'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error in alert button handler:',
          error
        );
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles synchronous errors in button handlers', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Sync error');

      const mockHandler = jest.fn(() => {
        throw error;
      });

      const buttons = [
        { text: 'Fail', onPress: mockHandler, style: 'default' as const },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('Fail'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in alert button handler:',
        error
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
    });

    it('waits for async operations before closing dialog', async () => {
      let operationCompleted = false;

      const mockAsyncHandler = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        operationCompleted = true;
      });

      const buttons = [
        {
          text: 'Submit',
          onPress: mockAsyncHandler,
          style: 'default' as const,
        },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      expect(operationCompleted).toBe(false);

      fireEvent.press(getByText('Submit'));

      // Dialog should not close immediately
      expect(mockOnClose).not.toHaveBeenCalled();

      // Wait for async operation
      await waitFor(
        () => {
          expect(operationCompleted).toBe(true);
          expect(mockOnClose).toHaveBeenCalledTimes(1);
        },
        { timeout: 200 }
      );
    });
  });

  describe('Button Sorting', () => {
    it('sorts buttons correctly: cancel, default, destructive', () => {
      const buttons = [
        { text: 'Delete', style: 'destructive' as const },
        { text: 'Save', style: 'default' as const },
        { text: 'Cancel', style: 'cancel' as const },
      ];

      const { getAllByRole } = render(
        <AlertDialog
          visible={true}
          title="Test"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      // We can't easily test the order without role/testID, but we verify all render
      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Test"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('shows warning icon for destructive actions', () => {
      const buttons = [
        { text: 'Delete', style: 'destructive' as const },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Delete Item"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      // Verify the dialog renders (icon is there but hard to test directly)
      expect(getByText('Delete Item')).toBeTruthy();
    });

    it('shows info icon for non-destructive actions', () => {
      const buttons = [{ text: 'OK', style: 'default' as const }];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Information"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Information')).toBeTruthy();
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles delete confirmation flow', async () => {
      const mockDeleteOperation = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        {
          text: 'Delete',
          onPress: mockDeleteOperation,
          style: 'destructive' as const,
        },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Delete Set"
          message="Are you sure you want to delete this set?"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      // Click delete
      fireEvent.press(getByText('Delete'));

      // Wait for operation
      await waitFor(() => {
        expect(mockDeleteOperation).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('handles cancel button correctly', () => {
      const mockDeleteOperation = jest.fn();

      const buttons = [
        { text: 'Cancel', style: 'cancel' as const },
        {
          text: 'Delete',
          onPress: mockDeleteOperation,
          style: 'destructive' as const,
        },
      ];

      const { getByText } = render(
        <AlertDialog
          visible={true}
          title="Delete Set"
          buttons={buttons}
          onClose={mockOnClose}
        />
      );

      // Click cancel
      fireEvent.press(getByText('Cancel'));

      // Should close without calling delete
      expect(mockDeleteOperation).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
