import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import i18n from '@/lib/i18n';
import { storage } from '@/lib/storage';
import { DEFAULT_UI_LANGUAGE, RTL_LANGUAGES } from '@/lib/i18n/languages';

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (languageCode: string) => Promise<void>;
  isRTL: boolean;
  isChangingLanguage: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const UI_LANGUAGE_STORAGE_KEY = 'app_ui_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await storage.getItem(UI_LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
        setCurrentLanguage(savedLanguage);
        const shouldBeRTL = RTL_LANGUAGES.includes(savedLanguage);
        setIsRTL(shouldBeRTL);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      setIsChangingLanguage(true);

      // Check if we need to change RTL direction
      const newIsRTL = RTL_LANGUAGES.includes(languageCode);
      const needsRTLChange = newIsRTL !== I18nManager.isRTL;

      // Change language
      await i18n.changeLanguage(languageCode);
      await storage.setItem(UI_LANGUAGE_STORAGE_KEY, languageCode);
      setCurrentLanguage(languageCode);
      setIsRTL(newIsRTL);

      // If RTL direction needs to change, we need to reload the app
      if (needsRTLChange) {
        I18nManager.allowRTL(newIsRTL);
        I18nManager.forceRTL(newIsRTL);

        // Reload the app to apply RTL changes
        if (__DEV__) {
          console.log('RTL direction changed. App reload required.');
          alert('The app will reload to apply the language direction change.');
        }

        // Reload the app
        if (Updates.reloadAsync) {
          await Updates.reloadAsync();
        } else {
          // Fallback for development
          console.warn(
            'Cannot reload app automatically. Please restart the app manually.'
          );
        }
      }

      console.log('Language changed to:', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    } finally {
      setIsChangingLanguage(false);
    }
  };

  return (
    <I18nContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        isRTL,
        isChangingLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
