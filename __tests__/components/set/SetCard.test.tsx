import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SetCard } from '../../../components/set/SetCard';
import { WordSet } from '../../../lib/types';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E0E0E0',
      success: '#00C853',
      error: '#FF0000',
    },
    isDark: false,
  }),
}));

// Mock SetsContext
const mockDeleteSet = jest.fn();
jest.mock('@/contexts/SetsContext', () => ({
  useSets: () => ({
    deleteSet: mockDeleteSet,
  }),
}));

// Mock alert
jest.mock('@/lib/alert', () => ({
  showAlert: jest.fn(),
}));

// Create a mock set for testing
const createMockSet = (overrides: Partial<WordSet> = {}): WordSet => ({
  id: 'test-set-1',
  name: 'Test Set',
  targetLanguage: 'es',
  nativeLanguage: 'en',
  words: [
    { id: '1', word: 'hola', translation: 'hello' },
    { id: '2', word: 'adiós', translation: 'goodbye' },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userId: 'user-1',
  isFeatured: false,
  ...overrides,
});

describe('SetCard', () => {
  beforeEach(() => {
    mockDeleteSet.mockClear();
  });

  it('renders set name', () => {
    const set = createMockSet({ name: 'Spanish Basics' });
    render(<SetCard set={set} />);
    expect(screen.getByText('Spanish Basics')).toBeTruthy();
  });

  it('renders word count', () => {
    const set = createMockSet({
      words: [
        { id: '1', word: 'uno', translation: 'one' },
        { id: '2', word: 'dos', translation: 'two' },
        { id: '3', word: 'tres', translation: 'three' },
      ],
    });
    render(<SetCard set={set} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders featured badge for featured sets', () => {
    const set = createMockSet({ isFeatured: true });
    render(<SetCard set={set} />);
    expect(screen.getByText('setCard.featured')).toBeTruthy();
  });

  it('does not render featured badge for non-featured sets', () => {
    const set = createMockSet({ isFeatured: false });
    render(<SetCard set={set} />);
    expect(screen.queryByText('setCard.featured')).toBeNull();
  });

  it('calls onPress callback when provided', () => {
    const onPress = jest.fn();
    const set = createMockSet();
    render(<SetCard set={set} onPress={onPress} />);

    fireEvent.press(screen.getByText('Test Set'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('toggles expanded state when no onPress provided', () => {
    const set = createMockSet();
    render(<SetCard set={set} />);

    // Initially, expanded content should not be visible
    expect(screen.queryByText('hola, adiós')).toBeNull();

    // Press to expand
    fireEvent.press(screen.getByText('Test Set'));

    // Now expanded content should be visible
    expect(screen.getByText('hola, adiós')).toBeTruthy();
  });

  it('displays last practiced date when available', () => {
    const set = createMockSet({
      lastPracticed: new Date().toISOString(),
    });
    render(<SetCard set={set} />);
    // The lastPracticed text should be rendered
    expect(screen.getByText(/setCard.lastPracticed/)).toBeTruthy();
  });

  it('renders with empty words array', () => {
    const set = createMockSet({ words: [] });
    render(<SetCard set={set} />);
    expect(screen.getByText('Test Set')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('renders progress bar', () => {
    const set = createMockSet({
      words: Array(10).fill(null).map((_, i) => ({
        id: String(i),
        word: `word${i}`,
        translation: `trans${i}`,
      })),
    });
    render(<SetCard set={set} />);
    // Progress text should show completion percentage
    expect(screen.getByText('setCard.complete')).toBeTruthy();
  });
});
