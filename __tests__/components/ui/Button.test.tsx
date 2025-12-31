import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../components/ui/Button';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E0E0E0',
    },
    isDark: false,
  }),
}));

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders with title', () => {
    render(<Button title="Click me" onPress={mockOnPress} />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<Button title="Click me" onPress={mockOnPress} />);
    fireEvent.press(screen.getByText('Click me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    render(<Button title="Click me" onPress={mockOnPress} disabled />);
    fireEvent.press(screen.getByText('Click me'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with primary variant by default', () => {
    render(<Button title="Primary" onPress={mockOnPress} />);
    expect(screen.getByText('Primary')).toBeTruthy();
  });

  it('renders with secondary variant', () => {
    render(<Button title="Secondary" onPress={mockOnPress} variant="secondary" />);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('renders with outline variant', () => {
    render(<Button title="Outline" onPress={mockOnPress} variant="outline" />);
    expect(screen.getByText('Outline')).toBeTruthy();
  });

  it('renders with text variant', () => {
    render(<Button title="Text" onPress={mockOnPress} variant="text" />);
    expect(screen.getByText('Text')).toBeTruthy();
  });

  it('applies custom style', () => {
    render(
      <Button
        title="Styled"
        onPress={mockOnPress}
        style={{ marginTop: 20 }}
      />
    );
    expect(screen.getByText('Styled')).toBeTruthy();
  });

  it('applies custom text style', () => {
    render(
      <Button
        title="Custom Text"
        onPress={mockOnPress}
        textStyle={{ fontSize: 20 }}
      />
    );
    expect(screen.getByText('Custom Text')).toBeTruthy();
  });
});
