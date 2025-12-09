#!/usr/bin/env node

/**
 * Script to generate placeholder translation files for all supported languages
 *
 * This creates the folder structure and copies English translations as placeholders
 * for all languages. You can then replace these with actual translations.
 *
 * Usage: node scripts/generate-translations.js
 */

const fs = require('fs');
const path = require('path');

const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'ja',
  'ko',
  'zh',
  'zh-Hant',
  'ar',
  'he',
  'hi',
  'th',
  'tr',
  'pl',
  'uk',
  'nl',
  'sv',
  'no',
  'da',
  'fi',
  'cs',
  'hr',
  'id',
  'ms',
  'ro',
  'sk',
  'sl',
  'sr',
  'lv',
  'lt',
  'et',
  'hu',
  'ca',
  'ceb',
  'tl',
  'vi',
  'uz',
  'el',
  'bg',
  'kk',
  'gu',
];

const TRANSLATION_FILES = [
  'common.json',
  'settings.json',
  'games.json',
  'profile.json',
  'create.json',
  'auth.json',
];

const translationsDir = path.join(__dirname, '..', 'translations');
const enDir = path.join(translationsDir, 'en');

console.log('🌍 Generating translation files for all languages...\n');

// Check if English translations exist
if (!fs.existsSync(enDir)) {
  console.error('❌ Error: English translations not found at', enDir);
  console.error('Please create English translations first.');
  process.exit(1);
}

let created = 0;
let skipped = 0;

SUPPORTED_LANGUAGES.forEach(lang => {
  if (lang === 'en') {
    console.log(`✓ en (base language, skipping)`);
    return;
  }

  const langDir = path.join(translationsDir, lang);

  // Create language directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  // Copy each translation file from English
  TRANSLATION_FILES.forEach(file => {
    const enFile = path.join(enDir, file);
    const targetFile = path.join(langDir, file);

    if (!fs.existsSync(enFile)) {
      console.warn(`⚠️  Warning: ${file} not found in English translations`);
      return;
    }

    if (fs.existsSync(targetFile)) {
      skipped++;
      return; // Don't overwrite existing translations
    }

    // Read English file and add a comment
    const enContent = JSON.parse(fs.readFileSync(enFile, 'utf8'));
    const contentWithNote = {
      _note: `This is a placeholder file. Please replace with ${lang} translations.`,
      ...enContent,
    };

    fs.writeFileSync(
      targetFile,
      JSON.stringify(contentWithNote, null, 2),
      'utf8'
    );
    created++;
  });

  console.log(`✓ ${lang} (${TRANSLATION_FILES.length} files)`);
});

console.log(`\n✅ Done!`);
console.log(`   Created: ${created} files`);
console.log(`   Skipped: ${skipped} files (already exist)`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Replace placeholder translations with actual translations`);
console.log(`   2. Remove the "_note" field from each file`);
console.log(`   3. Update lib/i18n/index.ts to import the new language files`);
console.log(
  `\n💡 Tip: Use translation services like Crowdin, Lokalise, or AI tools to translate efficiently`
);
