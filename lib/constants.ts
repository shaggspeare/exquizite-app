// Design system constants for Exquizite app
// To use theme-aware colors, import useTheme from @/contexts/ThemeContext
// and use colors from the hook instead of importing Colors directly

export const LightColors = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  primary: '#5B67E5',
  primaryDark: '#4B57D5',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  success: '#10B981',
  error: '#EF4444',
  ai: '#8B5CF6',
  border: '#E5E5E5',
};

export const DarkColors = {
  background: '#121212',
  card: '#1E1E1E',
  primary: '#6B7AFF',
  primaryDark: '#5B6AEF',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#10B981',
  error: '#EF4444',
  ai: '#A78BFA',
  border: '#2C2C2C',
};

// Default export for backwards compatibility
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const BorderRadius = {
  card: 12,
  button: 8,
  input: 8,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const MAX_WORDS_PER_SET = 20;
