export interface UILanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_UI_LANGUAGES: UILanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体字',
    flag: '🇨🇳',
  },
  {
    code: 'zh-Hant',
    name: 'Chinese (Traditional)',
    nativeName: '繁體字',
    flag: '🇹🇼',
  },
  { code: 'ar', name: 'Arabic', nativeName: 'عربى', flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עִברִית', flag: '🇮🇱', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'id', name: 'Indonesian', nativeName: 'Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Melayu', flag: '🇲🇾' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti keel', flag: '🇪🇪' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano', flag: '🇵🇭' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Vietnamese', flag: '🇻🇳' },
  { code: 'uz', name: 'Uzbek', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'el', name: 'Greek', nativeName: 'ελληνικά', flag: '🇬🇷' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'български', flag: '🇧🇬' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ', flag: '🇰🇿' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
];

export const DEFAULT_UI_LANGUAGE = 'en';

// Languages with complete translations (all 6 namespaces: common, settings, games, profile, create, auth)
export const FULLY_TRANSLATED_LANGUAGES = [
  'en', // English - base language
  'es', // Spanish
  'de', // German
  'uk', // Ukrainian
  'ru', // Russian
  'fr', // French
  'it', // Italian
  'pt', // Portuguese
  'tr', // Turkish
  'ja', // Japanese
  'ko', // Korean
  'zh', // Chinese (Simplified)
  'zh-Hant', // Chinese (Traditional)
  'ar', // Arabic
  'he', // Hebrew
  'hi', // Hindi
  'th', // Thai
  'ro', // Romanian
  'ca', // Catalan
] as const;

export const RTL_LANGUAGES = SUPPORTED_UI_LANGUAGES.filter(
  lang => lang.rtl
).map(lang => lang.code);
