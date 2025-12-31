import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '../../../components/ui/Input';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
      textSecondary: '#666666',
      card: '#FFFFFF',
      border: '#E0E0E0',
      error: '#FF0000',
    },
    isDark: false,
  }),
}));

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" placeholder="Enter text" />);
    expect(screen.getByText('This field is required')).toBeTruthy();
  });

  it('renders with both label and error', () => {
    render(
      <Input
        label="Password"
        error="Password is too short"
        placeholder="Enter password"
      />
    );
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByText('Password is too short')).toBeTruthy();
  });

  it('handles text input', () => {
    const onChangeText = jest.fn();
    render(
      <Input
        placeholder="Type here"
        onChangeText={onChangeText}
      />
    );

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.changeText(input, 'Hello World');
    expect(onChangeText).toHaveBeenCalledWith('Hello World');
  });

  it('handles value prop', () => {
    render(<Input value="Initial value" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input.props.value).toBe('Initial value');
  });

  it('passes through TextInput props', () => {
    render(
      <Input
        placeholder="Search"
        keyboardType="email-address"
        autoCapitalize="none"
        secureTextEntry
      />
    );
    const input = screen.getByPlaceholderText('Search');
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('applies custom style', () => {
    render(
      <Input
        placeholder="Styled input"
        style={{ marginTop: 20 }}
      />
    );
    expect(screen.getByPlaceholderText('Styled input')).toBeTruthy();
  });
});
