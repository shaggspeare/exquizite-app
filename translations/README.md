# Internationalization (i18n) Guide

This app supports 44 languages for the user interface using **i18next** and **react-i18next**.

## Supported Languages

The app supports the following UI languages:

- **European**: English, Español, Français, Deutsch, Italiano, Português, Nederlands, Svenska, Norsk, Dansk, Suomi, Čeština, Hrvatski, Română, Slovenčina, Slovenščina, Srpski, Eesti keel, Latvian, Lietuvių, Magyar, Polski, Català
- **Asian**: 日本語, 한국어, 简体字, 繁體字, ภาษาไทย, Vietnamese, Indonesia, Melayu, Tagalog, Cebuano
- **Middle Eastern**: عربى, עִברִית, Türkçe
- **Eastern European/Central Asian**: Русский, Українська, български, Қазақ, O'zbek, ελληνικά
- **South Asian**: हिंदी, ગુજરાતી

## File Structure

```
translations/
├── en/                 # English (base language)
│   ├── common.json    # Common UI elements (buttons, status messages)
│   ├── settings.json  # Settings screen
│   ├── games.json     # Game screens and templates
│   ├── profile.json   # Profile screen
│   ├── create.json    # Create/Edit set screen
│   └── auth.json      # Authentication screens
├── es/                # Spanish
├── fr/                # French
├── de/                # German
... (and 40 more languages)
```

## How to Use Translations in Components

### 1. Import the hook

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Use the translation function

```typescript
function MyComponent() {
  const { t } = useTranslation('settings'); // Specify namespace

  return (
    <View>
      <Text>{t('title')}</Text>
      <Text>{t('languages.description')}</Text>
    </View>
  );
}
```

### 3. With interpolation (variables)

```typescript
<Text>{t('common:counts.wordCount', { count: 5 })}</Text>
// Output: "5 words"

<Text>{t('games:quiz.question', { current: 3, total: 10 })}</Text>
// Output: "Question 3 / 10"
```

### 4. Pluralization

i18next automatically handles plurals:

```typescript
// In translation file:
{
  "wordCount": "{{count}} word",
  "wordCount_other": "{{count}} words"
}

// Usage:
t('wordCount', { count: 1 })  // "1 word"
t('wordCount', { count: 5 })  // "5 words"
```

## Available Namespaces

- `common` - Buttons, status messages, time formats, counts
- `settings` - Settings screen text
- `games` - Game modes, templates, and game UI
- `profile` - Profile screen
- `create` - Create/Edit set screen
- `auth` - Login, signup, language setup

## Changing UI Language

Users can change the app language in **Settings → App Language**

The language preference is:

1. Stored in local storage
2. Persists across app restarts
3. Separate from learning language preferences
4. Auto-detects device language on first launch

## RTL (Right-to-Left) Support

Arabic and Hebrew are RTL languages. The app automatically:

- Flips the layout direction
- Reloads the app when switching to/from RTL languages
- Applies RTL-safe styling

## Adding Translations

### For a New String

1. **Add to English first** (`translations/en/*.json`)

   ```json
   {
     "myNewKey": "My new text"
   }
   ```

2. **Update all other language files** with the same key structure

3. **Use in your component**

   ```typescript
   const { t } = useTranslation('namespace');
   <Text>{t('myNewKey')}</Text>
   ```

### For a New Language File

1. Create directory: `translations/[language-code]/`
2. Copy structure from English
3. Translate all strings
4. Update `lib/i18n/index.ts` to import the new language
5. Add language to `lib/i18n/languages.ts` if not already there

## Translation Tools & Services

### Recommended Services

- **Crowdin** - Collaborative translation platform
- **Lokalise** - Developer-friendly translation management
- **POEditor** - Simple translation tool
- **AI Translation** - Use GPT-4, Claude, or DeepL for initial translations

### Using AI for Translation

You can use the following prompt with AI tools:

```
Translate the following JSON file to [LANGUAGE].
Keep the same JSON structure and keys.
Only translate the string values, not the keys.
Preserve any {{variables}} in the text exactly as they are.

[Paste your JSON here]
```

## Testing Translations

### 1. Test in the app

```typescript
// Change language programmatically (for testing)
import i18n from '@/lib/i18n';

i18n.changeLanguage('es'); // Spanish
i18n.changeLanguage('ja'); // Japanese
```

### 2. Test pluralization

```typescript
// Test different counts
t('wordCount', { count: 0 });
t('wordCount', { count: 1 });
t('wordCount', { count: 2 });
t('wordCount', { count: 100 });
```

### 3. Test variables

```typescript
// Ensure all variables are replaced
t('greeting', { name: 'Test User' });
t('progress', { current: 5, total: 10 });
```

## Best Practices

### ✅ DO

- Use descriptive keys: `auth.login.emailPlaceholder` not `placeholder1`
- Keep strings short and concise for mobile
- Use namespaces to organize translations
- Test RTL languages (Arabic, Hebrew)
- Include context in key names when needed

### ❌ DON'T

- Hardcode text in components
- Concatenate translated strings (breaks grammar in some languages)
- Use gender-specific pronouns without alternatives
- Assume word order is the same across languages
- Include HTML/markup in translation strings (use React components instead)

## Translation Priority

If you can't translate all languages immediately, prioritize by user base:

**Tier 1** (Highest priority):

- English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese

**Tier 2** (Medium priority):

- Arabic, Turkish, Polish, Ukrainian, Dutch, Swedish, Thai, Vietnamese, Indonesian

**Tier 3** (Lower priority):

- All other supported languages

## Fallback Behavior

If a translation is missing:

1. Falls back to English
2. Shows the translation key (in development)
3. Logs a warning (in development)

## Performance

- Translations are loaded on app start
- Minimal performance impact (<50ms)
- Lazy loading available if needed for large apps

## Maintenance

### Regular Tasks

- [ ] Check for missing keys across languages
- [ ] Update translations when adding new features
- [ ] Review user feedback on translation quality
- [ ] Test RTL layouts regularly
- [ ] Update language list when adding new languages

### Scripts

```bash
# Generate placeholder files for all languages
node scripts/generate-translations.js

# Check for missing translation keys (TODO: create this script)
# node scripts/check-translations.js
```

## Troubleshooting

### Translation not showing

1. Check if key exists in translation file
2. Verify namespace is correct
3. Check for typos in key path
4. Ensure language file is imported in `lib/i18n/index.ts`

### RTL not working

1. Ensure language is marked as RTL in `lib/i18n/languages.ts`
2. Check if app reloaded after language change
3. Verify `I18nManager.isRTL` is set correctly

### Language not available in selector

1. Add language to `SUPPORTED_UI_LANGUAGES` in `lib/i18n/languages.ts`
2. Create translation files in `translations/[code]/`
3. Import in `lib/i18n/index.ts`

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Language Codes (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

**Questions?** Check the main README or contact the development team.
