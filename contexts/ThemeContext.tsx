import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '@/lib/constants';
import { storage } from '@/lib/storage';

type ThemeMode = 'light' | 'dark' | 'auto';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  colorScheme: ColorScheme;
  colors: typeof LightColors;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await storage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine the actual color scheme to use
  const colorScheme: ColorScheme =
    theme === 'auto'
      ? (systemColorScheme ?? 'light')
      : theme;

  const isDark = colorScheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        colors,
        setTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
