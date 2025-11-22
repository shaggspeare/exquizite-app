import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Localization from 'expo-localization';
import { useAuth } from './AuthContext';

export interface LanguagePreferences {
  targetLanguage: string; // Language user wants to learn
  nativeLanguage: string; // Language to translate to (user's native language)
  isConfigured: boolean; // Whether user has set up languages
}

interface LanguageContextType {
  preferences: LanguagePreferences;
  setLanguages: (targetLanguage: string, nativeLanguage: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language_preferences';

// Common languages for selection
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
];

// Detect device language
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const primaryLocale = locales[0];
    const languageCode = primaryLocale.languageCode || 'en';

    // Check if we support this language
    const supported = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
    if (supported) {
      return languageCode;
    }
  }
  return 'en'; // Default to English
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<LanguagePreferences>({
    targetLanguage: '',
    nativeLanguage: '',
    isConfigured: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      loadLanguagePreferences();
    }
  }, [user?.id, authLoading]);

  const loadLanguagePreferences = async () => {
    try {
      // If no user, set defaults and return
      if (!user) {
        console.log('📚 No user, using default preferences');
        const deviceLang = getDeviceLanguage();
        setPreferences({
          targetLanguage: '',
          nativeLanguage: deviceLang,
          isConfigured: false,
        });
        setIsLoading(false);
        return;
      }

      // Load preferences for this specific user
      const userStorageKey = `${LANGUAGE_STORAGE_KEY}_${user.id}`;
      const stored = await SecureStore.getItemAsync(userStorageKey);

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📚 Language preferences loaded for user', user.name, ':', parsed);
        setPreferences(parsed);
      } else {
        // Set default native language to device language
        const deviceLang = getDeviceLanguage();
        console.log('📚 No stored preferences for user', user.name, '. Device language:', deviceLang);
        setPreferences({
          targetLanguage: '',
          nativeLanguage: deviceLang,
          isConfigured: false,
        });
      }
    } catch (error) {
      console.error('Error loading language preferences:', error);
      // Set default on error
      const deviceLang = getDeviceLanguage();
      setPreferences({
        targetLanguage: '',
        nativeLanguage: deviceLang,
        isConfigured: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguages = async (targetLanguage: string, nativeLanguage: string) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const newPreferences: LanguagePreferences = {
        targetLanguage,
        nativeLanguage,
        isConfigured: true,
      };

      const userStorageKey = `${LANGUAGE_STORAGE_KEY}_${user.id}`;
      await SecureStore.setItemAsync(
        userStorageKey,
        JSON.stringify(newPreferences)
      );

      console.log('📚 Language preferences saved for user', user.name, ':', newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving language preferences:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        preferences,
        setLanguages,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper to get language name from code
export function getLanguageName(code: string): string {
  const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
}

// Helper to get language with flag
export function getLanguageDisplay(code: string): string {
  const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
  return lang ? `${lang.flag} ${lang.name}` : code;
}
