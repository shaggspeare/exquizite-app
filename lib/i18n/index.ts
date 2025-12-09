import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { DEFAULT_UI_LANGUAGE } from './languages';

// Import translation files
import enCommon from '@/translations/en/common.json';
import enSettings from '@/translations/en/settings.json';
import enGames from '@/translations/en/games.json';
import enProfile from '@/translations/en/profile.json';
import enCreate from '@/translations/en/create.json';
import enAuth from '@/translations/en/auth.json';

import esCommon from '@/translations/es/common.json';
import esSettings from '@/translations/es/settings.json';
import esGames from '@/translations/es/games.json';
import esProfile from '@/translations/es/profile.json';
import esCreate from '@/translations/es/create.json';
import esAuth from '@/translations/es/auth.json';

import deCommon from '@/translations/de/common.json';
import deSettings from '@/translations/de/settings.json';
import deGames from '@/translations/de/games.json';
import deProfile from '@/translations/de/profile.json';
import deCreate from '@/translations/de/create.json';
import deAuth from '@/translations/de/auth.json';

import ukCommon from '@/translations/uk/common.json';
import ukSettings from '@/translations/uk/settings.json';
import ukGames from '@/translations/uk/games.json';
import ukProfile from '@/translations/uk/profile.json';
import ukCreate from '@/translations/uk/create.json';
import ukAuth from '@/translations/uk/auth.json';

import ruCommon from '@/translations/ru/common.json';
import ruSettings from '@/translations/ru/settings.json';
import ruGames from '@/translations/ru/games.json';
import ruProfile from '@/translations/ru/profile.json';
import ruCreate from '@/translations/ru/create.json';
import ruAuth from '@/translations/ru/auth.json';

// Translation resources
const resources = {
  en: {
    common: enCommon,
    settings: enSettings,
    games: enGames,
    profile: enProfile,
    create: enCreate,
    auth: enAuth,
  },
  es: {
    common: esCommon,
    settings: esSettings,
    games: esGames,
    profile: esProfile,
    create: esCreate,
    auth: esAuth,
  },
  de: {
    common: deCommon,
    settings: deSettings,
    games: deGames,
    profile: deProfile,
    create: deCreate,
    auth: deAuth,
  },
  uk: {
    common: ukCommon,
    settings: ukSettings,
    games: ukGames,
    profile: ukProfile,
    create: ukCreate,
    auth: ukAuth,
  },
  ru: {
    common: ruCommon,
    settings: ruSettings,
    games: ruGames,
    profile: ruProfile,
    create: ruCreate,
    auth: ruAuth,
  },
};

// Get device language
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const languageCode = locales[0].languageCode || DEFAULT_UI_LANGUAGE;
    // Check if we have translations for this language
    if (resources[languageCode as keyof typeof resources]) {
      return languageCode;
    }
  }
  return DEFAULT_UI_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: DEFAULT_UI_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'settings', 'games', 'profile', 'create', 'auth'],

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  react: {
    useSuspense: false, // Important for React Native
  },

  compatibilityJSON: 'v3', // For better compatibility
});

export default i18n;
