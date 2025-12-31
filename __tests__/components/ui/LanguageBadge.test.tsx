import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LanguageBadge } from '../../../components/ui/LanguageBadge';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      text: '#000000',
      textSecondary: '#666666',
    },
    isDark: false,
  }),
}));

// Mock LanguageContext
jest.mock('@/contexts/LanguageContext', () => ({
  getLanguageName: (code: string) => {
    const names: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
    };
    return names[code] || code;
  },
  AVAILABLE_LANGUAGES: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
  ],
}));

describe('LanguageBadge', () => {
  it('renders with valid languages', () => {
    render(
      <LanguageBadge targetLanguage="es" nativeLanguage="en" />
    );
    expect(screen.getByText('Spanish')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('renders arrow between languages', () => {
    render(
      <LanguageBadge targetLanguage="fr" nativeLanguage="de" />
    );
    expect(screen.getAllByText('→')).toHaveLength(1);
  });

  it('returns null for invalid target language', () => {
    const { toJSON } = render(
      <LanguageBadge targetLanguage="invalid" nativeLanguage="en" />
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for invalid native language', () => {
    const { toJSON } = render(
      <LanguageBadge targetLanguage="en" nativeLanguage="invalid" />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders with small size', () => {
    render(
      <LanguageBadge targetLanguage="es" nativeLanguage="en" size="small" />
    );
    expect(screen.getByText('Spanish')).toBeTruthy();
  });

  it('renders with medium size (default)', () => {
    render(
      <LanguageBadge targetLanguage="es" nativeLanguage="en" size="medium" />
    );
    expect(screen.getByText('Spanish')).toBeTruthy();
  });

  it('renders in compact mode without language names', () => {
    render(
      <LanguageBadge targetLanguage="es" nativeLanguage="en" compact />
    );
    // In compact mode, language names should not be rendered
    expect(screen.queryByText('Spanish')).toBeNull();
    expect(screen.queryByText('English')).toBeNull();
    // Arrow should still be present
    expect(screen.getByText('→')).toBeTruthy();
  });
});
