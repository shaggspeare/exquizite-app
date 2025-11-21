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

// Modern, vibrant dark theme colors
export const DarkColors = {
  background: '#0A0A0A',
  backgroundSecondary: '#121212',
  card: '#1A1A1A',
  cardSecondary: '#252525',
  primary: '#5B9EFF',
  primaryDark: '#4A90E2',
  secondary: '#E066FF',
  secondaryDark: '#B537F2',
  success: '#00E5A0',
  successDark: '#00C78A',
  error: '#FF6B6B',
  errorDark: '#FF5252',
  ai: '#00D4FF',
  aiDark: '#00B4DD',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
  // Gradient colors
  gradientBlue: ['#4A90E2', '#5B9EFF'],
  gradientPurple: ['#B537F2', '#E066FF'],
  gradientCyan: ['#00D4FF', '#00E5A0'],
  gradientOrange: ['#FF6B35', '#FFBB00'],
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
  display: {
    fontSize: 48,
    fontWeight: '700' as const,
  },
  h1: {
    fontSize: 32,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const BorderRadius = {
  card: 20,
  cardLarge: 24,
  button: 12,
  input: 12,
  round: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  cardDeep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const MAX_WORDS_PER_SET = 20;
