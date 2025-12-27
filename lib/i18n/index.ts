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

import plCommon from '@/translations/pl/common.json';
import plSettings from '@/translations/pl/settings.json';
import plGames from '@/translations/pl/games.json';
import plProfile from '@/translations/pl/profile.json';
import plCreate from '@/translations/pl/create.json';
import plAuth from '@/translations/pl/auth.json';

import nlCommon from '@/translations/nl/common.json';
import nlSettings from '@/translations/nl/settings.json';
import nlGames from '@/translations/nl/games.json';
import nlProfile from '@/translations/nl/profile.json';
import nlCreate from '@/translations/nl/create.json';
import nlAuth from '@/translations/nl/auth.json';

import svCommon from '@/translations/sv/common.json';
import svSettings from '@/translations/sv/settings.json';
import svGames from '@/translations/sv/games.json';
import svProfile from '@/translations/sv/profile.json';
import svCreate from '@/translations/sv/create.json';
import svAuth from '@/translations/sv/auth.json';

import noCommon from '@/translations/no/common.json';
import noSettings from '@/translations/no/settings.json';
import noGames from '@/translations/no/games.json';
import noProfile from '@/translations/no/profile.json';
import noCreate from '@/translations/no/create.json';
import noAuth from '@/translations/no/auth.json';

import daCommon from '@/translations/da/common.json';
import daSettings from '@/translations/da/settings.json';
import daGames from '@/translations/da/games.json';
import daProfile from '@/translations/da/profile.json';
import daCreate from '@/translations/da/create.json';
import daAuth from '@/translations/da/auth.json';

import fiCommon from '@/translations/fi/common.json';
import fiSettings from '@/translations/fi/settings.json';
import fiGames from '@/translations/fi/games.json';
import fiProfile from '@/translations/fi/profile.json';
import fiCreate from '@/translations/fi/create.json';
import fiAuth from '@/translations/fi/auth.json';

import idCommon from '@/translations/id/common.json';
import idSettings from '@/translations/id/settings.json';
import idGames from '@/translations/id/games.json';
import idProfile from '@/translations/id/profile.json';
import idCreate from '@/translations/id/create.json';
import idAuth from '@/translations/id/auth.json';

import msCommon from '@/translations/ms/common.json';
import msSettings from '@/translations/ms/settings.json';
import msGames from '@/translations/ms/games.json';
import msProfile from '@/translations/ms/profile.json';
import msCreate from '@/translations/ms/create.json';
import msAuth from '@/translations/ms/auth.json';

import cebCommon from '@/translations/ceb/common.json';
import cebSettings from '@/translations/ceb/settings.json';
import cebGames from '@/translations/ceb/games.json';
import cebProfile from '@/translations/ceb/profile.json';
import cebCreate from '@/translations/ceb/create.json';
import cebAuth from '@/translations/ceb/auth.json';

import tlCommon from '@/translations/tl/common.json';
import tlSettings from '@/translations/tl/settings.json';
import tlGames from '@/translations/tl/games.json';
import tlProfile from '@/translations/tl/profile.json';
import tlCreate from '@/translations/tl/create.json';
import tlAuth from '@/translations/tl/auth.json';

import viCommon from '@/translations/vi/common.json';
import viSettings from '@/translations/vi/settings.json';
import viGames from '@/translations/vi/games.json';
import viProfile from '@/translations/vi/profile.json';
import viCreate from '@/translations/vi/create.json';
import viAuth from '@/translations/vi/auth.json';

import uzCommon from '@/translations/uz/common.json';
import uzSettings from '@/translations/uz/settings.json';
import uzGames from '@/translations/uz/games.json';
import uzProfile from '@/translations/uz/profile.json';
import uzCreate from '@/translations/uz/create.json';
import uzAuth from '@/translations/uz/auth.json';

import kkCommon from '@/translations/kk/common.json';
import kkSettings from '@/translations/kk/settings.json';
import kkGames from '@/translations/kk/games.json';
import kkProfile from '@/translations/kk/profile.json';
import kkCreate from '@/translations/kk/create.json';
import kkAuth from '@/translations/kk/auth.json';

import guCommon from '@/translations/gu/common.json';
import guSettings from '@/translations/gu/settings.json';
import guGames from '@/translations/gu/games.json';
import guProfile from '@/translations/gu/profile.json';
import guCreate from '@/translations/gu/create.json';
import guAuth from '@/translations/gu/auth.json';

import csCommon from '@/translations/cs/common.json';
import csSettings from '@/translations/cs/settings.json';
import csGames from '@/translations/cs/games.json';
import csProfile from '@/translations/cs/profile.json';
import csCreate from '@/translations/cs/create.json';
import csAuth from '@/translations/cs/auth.json';

import hrCommon from '@/translations/hr/common.json';
import hrSettings from '@/translations/hr/settings.json';
import hrGames from '@/translations/hr/games.json';
import hrProfile from '@/translations/hr/profile.json';
import hrCreate from '@/translations/hr/create.json';
import hrAuth from '@/translations/hr/auth.json';

import skCommon from '@/translations/sk/common.json';
import skSettings from '@/translations/sk/settings.json';
import skGames from '@/translations/sk/games.json';
import skProfile from '@/translations/sk/profile.json';
import skCreate from '@/translations/sk/create.json';
import skAuth from '@/translations/sk/auth.json';

import slCommon from '@/translations/sl/common.json';
import slSettings from '@/translations/sl/settings.json';
import slGames from '@/translations/sl/games.json';
import slProfile from '@/translations/sl/profile.json';
import slCreate from '@/translations/sl/create.json';
import slAuth from '@/translations/sl/auth.json';

import srCommon from '@/translations/sr/common.json';
import srSettings from '@/translations/sr/settings.json';
import srGames from '@/translations/sr/games.json';
import srProfile from '@/translations/sr/profile.json';
import srCreate from '@/translations/sr/create.json';
import srAuth from '@/translations/sr/auth.json';

import lvCommon from '@/translations/lv/common.json';
import lvSettings from '@/translations/lv/settings.json';
import lvGames from '@/translations/lv/games.json';
import lvProfile from '@/translations/lv/profile.json';
import lvCreate from '@/translations/lv/create.json';
import lvAuth from '@/translations/lv/auth.json';

import ltCommon from '@/translations/lt/common.json';
import ltSettings from '@/translations/lt/settings.json';
import ltGames from '@/translations/lt/games.json';
import ltProfile from '@/translations/lt/profile.json';
import ltCreate from '@/translations/lt/create.json';
import ltAuth from '@/translations/lt/auth.json';

import etCommon from '@/translations/et/common.json';
import etSettings from '@/translations/et/settings.json';
import etGames from '@/translations/et/games.json';
import etProfile from '@/translations/et/profile.json';
import etCreate from '@/translations/et/create.json';
import etAuth from '@/translations/et/auth.json';

import huCommon from '@/translations/hu/common.json';
import huSettings from '@/translations/hu/settings.json';
import huGames from '@/translations/hu/games.json';
import huProfile from '@/translations/hu/profile.json';
import huCreate from '@/translations/hu/create.json';
import huAuth from '@/translations/hu/auth.json';

import elCommon from '@/translations/el/common.json';
import elSettings from '@/translations/el/settings.json';
import elGames from '@/translations/el/games.json';
import elProfile from '@/translations/el/profile.json';
import elCreate from '@/translations/el/create.json';
import elAuth from '@/translations/el/auth.json';

import bgCommon from '@/translations/bg/common.json';
import bgSettings from '@/translations/bg/settings.json';
import bgGames from '@/translations/bg/games.json';
import bgProfile from '@/translations/bg/profile.json';
import bgCreate from '@/translations/bg/create.json';
import bgAuth from '@/translations/bg/auth.json';

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
  pl: {
    common: plCommon,
    settings: plSettings,
    games: plGames,
    profile: plProfile,
    create: plCreate,
    auth: plAuth,
  },
  nl: {
    common: nlCommon,
    settings: nlSettings,
    games: nlGames,
    profile: nlProfile,
    create: nlCreate,
    auth: nlAuth,
  },
  sv: {
    common: svCommon,
    settings: svSettings,
    games: svGames,
    profile: svProfile,
    create: svCreate,
    auth: svAuth,
  },
  no: {
    common: noCommon,
    settings: noSettings,
    games: noGames,
    profile: noProfile,
    create: noCreate,
    auth: noAuth,
  },
  da: {
    common: daCommon,
    settings: daSettings,
    games: daGames,
    profile: daProfile,
    create: daCreate,
    auth: daAuth,
  },
  fi: {
    common: fiCommon,
    settings: fiSettings,
    games: fiGames,
    profile: fiProfile,
    create: fiCreate,
    auth: fiAuth,
  },
  id: {
    common: idCommon,
    settings: idSettings,
    games: idGames,
    profile: idProfile,
    create: idCreate,
    auth: idAuth,
  },
  ms: {
    common: msCommon,
    settings: msSettings,
    games: msGames,
    profile: msProfile,
    create: msCreate,
    auth: msAuth,
  },
  ceb: {
    common: cebCommon,
    settings: cebSettings,
    games: cebGames,
    profile: cebProfile,
    create: cebCreate,
    auth: cebAuth,
  },
  tl: {
    common: tlCommon,
    settings: tlSettings,
    games: tlGames,
    profile: tlProfile,
    create: tlCreate,
    auth: tlAuth,
  },
  vi: {
    common: viCommon,
    settings: viSettings,
    games: viGames,
    profile: viProfile,
    create: viCreate,
    auth: viAuth,
  },
  uz: {
    common: uzCommon,
    settings: uzSettings,
    games: uzGames,
    profile: uzProfile,
    create: uzCreate,
    auth: uzAuth,
  },
  kk: {
    common: kkCommon,
    settings: kkSettings,
    games: kkGames,
    profile: kkProfile,
    create: kkCreate,
    auth: kkAuth,
  },
  gu: {
    common: guCommon,
    settings: guSettings,
    games: guGames,
    profile: guProfile,
    create: guCreate,
    auth: guAuth,
  },
  cs: {
    common: csCommon,
    settings: csSettings,
    games: csGames,
    profile: csProfile,
    create: csCreate,
    auth: csAuth,
  },
  hr: {
    common: hrCommon,
    settings: hrSettings,
    games: hrGames,
    profile: hrProfile,
    create: hrCreate,
    auth: hrAuth,
  },
  sk: {
    common: skCommon,
    settings: skSettings,
    games: skGames,
    profile: skProfile,
    create: skCreate,
    auth: skAuth,
  },
  sl: {
    common: slCommon,
    settings: slSettings,
    games: slGames,
    profile: slProfile,
    create: slCreate,
    auth: slAuth,
  },
  sr: {
    common: srCommon,
    settings: srSettings,
    games: srGames,
    profile: srProfile,
    create: srCreate,
    auth: srAuth,
  },
  lv: {
    common: lvCommon,
    settings: lvSettings,
    games: lvGames,
    profile: lvProfile,
    create: lvCreate,
    auth: lvAuth,
  },
  lt: {
    common: ltCommon,
    settings: ltSettings,
    games: ltGames,
    profile: ltProfile,
    create: ltCreate,
    auth: ltAuth,
  },
  et: {
    common: etCommon,
    settings: etSettings,
    games: etGames,
    profile: etProfile,
    create: etCreate,
    auth: etAuth,
  },
  hu: {
    common: huCommon,
    settings: huSettings,
    games: huGames,
    profile: huProfile,
    create: huCreate,
    auth: huAuth,
  },
  el: {
    common: elCommon,
    settings: elSettings,
    games: elGames,
    profile: elProfile,
    create: elCreate,
    auth: elAuth,
  },
  bg: {
    common: bgCommon,
    settings: bgSettings,
    games: bgGames,
    profile: bgProfile,
    create: bgCreate,
    auth: bgAuth,
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

  compatibilityJSON: 'v4', // For better compatibility
});

export default i18n;
