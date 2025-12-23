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

import frCommon from '@/translations/fr/common.json';
import frSettings from '@/translations/fr/settings.json';
import frGames from '@/translations/fr/games.json';
import frProfile from '@/translations/fr/profile.json';
import frCreate from '@/translations/fr/create.json';
import frAuth from '@/translations/fr/auth.json';

import itCommon from '@/translations/it/common.json';
import itSettings from '@/translations/it/settings.json';
import itGames from '@/translations/it/games.json';
import itProfile from '@/translations/it/profile.json';
import itCreate from '@/translations/it/create.json';
import itAuth from '@/translations/it/auth.json';

import ptCommon from '@/translations/pt/common.json';
import ptSettings from '@/translations/pt/settings.json';
import ptGames from '@/translations/pt/games.json';
import ptProfile from '@/translations/pt/profile.json';
import ptCreate from '@/translations/pt/create.json';
import ptAuth from '@/translations/pt/auth.json';

import trCommon from '@/translations/tr/common.json';
import trSettings from '@/translations/tr/settings.json';
import trGames from '@/translations/tr/games.json';
import trProfile from '@/translations/tr/profile.json';
import trCreate from '@/translations/tr/create.json';
import trAuth from '@/translations/tr/auth.json';

import jaCommon from '@/translations/ja/common.json';
import jaSettings from '@/translations/ja/settings.json';
import jaGames from '@/translations/ja/games.json';
import jaProfile from '@/translations/ja/profile.json';
import jaCreate from '@/translations/ja/create.json';
import jaAuth from '@/translations/ja/auth.json';

import koCommon from '@/translations/ko/common.json';
import koSettings from '@/translations/ko/settings.json';
import koGames from '@/translations/ko/games.json';
import koProfile from '@/translations/ko/profile.json';
import koCreate from '@/translations/ko/create.json';
import koAuth from '@/translations/ko/auth.json';

import zhCommon from '@/translations/zh/common.json';
import zhSettings from '@/translations/zh/settings.json';
import zhGames from '@/translations/zh/games.json';
import zhProfile from '@/translations/zh/profile.json';
import zhCreate from '@/translations/zh/create.json';
import zhAuth from '@/translations/zh/auth.json';

import zhHantCommon from '@/translations/zh-Hant/common.json';
import zhHantSettings from '@/translations/zh-Hant/settings.json';
import zhHantGames from '@/translations/zh-Hant/games.json';
import zhHantProfile from '@/translations/zh-Hant/profile.json';
import zhHantCreate from '@/translations/zh-Hant/create.json';
import zhHantAuth from '@/translations/zh-Hant/auth.json';

import arCommon from '@/translations/ar/common.json';
import arSettings from '@/translations/ar/settings.json';
import arGames from '@/translations/ar/games.json';
import arProfile from '@/translations/ar/profile.json';
import arCreate from '@/translations/ar/create.json';
import arAuth from '@/translations/ar/auth.json';

import heCommon from '@/translations/he/common.json';
import heSettings from '@/translations/he/settings.json';
import heGames from '@/translations/he/games.json';
import heProfile from '@/translations/he/profile.json';
import heCreate from '@/translations/he/create.json';
import heAuth from '@/translations/he/auth.json';

import hiCommon from '@/translations/hi/common.json';
import hiSettings from '@/translations/hi/settings.json';
import hiGames from '@/translations/hi/games.json';
import hiProfile from '@/translations/hi/profile.json';
import hiCreate from '@/translations/hi/create.json';
import hiAuth from '@/translations/hi/auth.json';

import thCommon from '@/translations/th/common.json';
import thSettings from '@/translations/th/settings.json';
import thGames from '@/translations/th/games.json';
import thProfile from '@/translations/th/profile.json';
import thCreate from '@/translations/th/create.json';
import thAuth from '@/translations/th/auth.json';

import roCommon from '@/translations/ro/common.json';
import roSettings from '@/translations/ro/settings.json';
import roGames from '@/translations/ro/games.json';
import roProfile from '@/translations/ro/profile.json';
import roCreate from '@/translations/ro/create.json';
import roAuth from '@/translations/ro/auth.json';

import caCommon from '@/translations/ca/common.json';
import caSettings from '@/translations/ca/settings.json';
import caGames from '@/translations/ca/games.json';
import caProfile from '@/translations/ca/profile.json';
import caCreate from '@/translations/ca/create.json';
import caAuth from '@/translations/ca/auth.json';

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
  fr: {
    common: frCommon,
    settings: frSettings,
    games: frGames,
    profile: frProfile,
    create: frCreate,
    auth: frAuth,
  },
  it: {
    common: itCommon,
    settings: itSettings,
    games: itGames,
    profile: itProfile,
    create: itCreate,
    auth: itAuth,
  },
  pt: {
    common: ptCommon,
    settings: ptSettings,
    games: ptGames,
    profile: ptProfile,
    create: ptCreate,
    auth: ptAuth,
  },
  tr: {
    common: trCommon,
    settings: trSettings,
    games: trGames,
    profile: trProfile,
    create: trCreate,
    auth: trAuth,
  },
  ja: {
    common: jaCommon,
    settings: jaSettings,
    games: jaGames,
    profile: jaProfile,
    create: jaCreate,
    auth: jaAuth,
  },
  ko: {
    common: koCommon,
    settings: koSettings,
    games: koGames,
    profile: koProfile,
    create: koCreate,
    auth: koAuth,
  },
  zh: {
    common: zhCommon,
    settings: zhSettings,
    games: zhGames,
    profile: zhProfile,
    create: zhCreate,
    auth: zhAuth,
  },
  'zh-Hant': {
    common: zhHantCommon,
    settings: zhHantSettings,
    games: zhHantGames,
    profile: zhHantProfile,
    create: zhHantCreate,
    auth: zhHantAuth,
  },
  ar: {
    common: arCommon,
    settings: arSettings,
    games: arGames,
    profile: arProfile,
    create: arCreate,
    auth: arAuth,
  },
  he: {
    common: heCommon,
    settings: heSettings,
    games: heGames,
    profile: heProfile,
    create: heCreate,
    auth: heAuth,
  },
  hi: {
    common: hiCommon,
    settings: hiSettings,
    games: hiGames,
    profile: hiProfile,
    create: hiCreate,
    auth: hiAuth,
  },
  th: {
    common: thCommon,
    settings: thSettings,
    games: thGames,
    profile: thProfile,
    create: thCreate,
    auth: thAuth,
  },
  ro: {
    common: roCommon,
    settings: roSettings,
    games: roGames,
    profile: roProfile,
    create: roCreate,
    auth: roAuth,
  },
  ca: {
    common: caCommon,
    settings: caSettings,
    games: caGames,
    profile: caProfile,
    create: caCreate,
    auth: caAuth,
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
