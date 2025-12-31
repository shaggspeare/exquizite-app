import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../../../components/ui/Card';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#FFFFFF',
    },
    isDark: false,
  }),
}));

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <Text>First child</Text>
        <Text>Second child</Text>
      </Card>
    );
    expect(screen.getByText('First child')).toBeTruthy();
    expect(screen.getByText('Second child')).toBeTruthy();
  });

  it('applies custom style', () => {
    render(
      <Card style={{ marginTop: 20 }}>
        <Text>Styled card</Text>
      </Card>
    );
    expect(screen.getByText('Styled card')).toBeTruthy();
  });

  it('renders with noPadding prop', () => {
    render(
      <Card noPadding>
        <Text>No padding card</Text>
      </Card>
    );
    expect(screen.getByText('No padding card')).toBeTruthy();
  });

  it('renders with default padding when noPadding is false', () => {
    render(
      <Card noPadding={false}>
        <Text>Default padding card</Text>
      </Card>
    );
    expect(screen.getByText('Default padding card')).toBeTruthy();
  });
});
