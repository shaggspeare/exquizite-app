#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read English translations as base
const translationsDir = path.join(__dirname, '..', 'translations');
const enDir = path.join(translationsDir, 'en');

const enTranslations = {
  common: JSON.parse(fs.readFileSync(path.join(enDir, 'common.json'), 'utf8')),
  settings: JSON.parse(fs.readFileSync(path.join(enDir, 'settings.json'), 'utf8')),
  games: JSON.parse(fs.readFileSync(path.join(enDir, 'games.json'), 'utf8')),
  profile: JSON.parse(fs.readFileSync(path.join(enDir, 'profile.json'), 'utf8')),
  create: JSON.parse(fs.readFileSync(path.join(enDir, 'create.json'), 'utf8')),
  auth: JSON.parse(fs.readFileSync(path.join(enDir, 'auth.json'), 'utf8'))
};

// Remaining languages to generate (33 languages)
const remainingLanguages = [
  'ja', 'ko', 'zh', 'zh-Hant', 'ar', 'he', 'hi', 'th', 'tr', 'pl', 'nl',
  'sv', 'no', 'da', 'fi', 'cs', 'hr', 'id', 'ms', 'ro', 'sk', 'sl', 'sr',
  'lv', 'lt', 'et', 'hu', 'ca', 'ceb', 'tl', 'vi', 'uz', 'el', 'bg', 'kk', 'gu'
];

console.log(`Creating placeholder translations for ${remainingLanguages.length} languages...`);
console.log('These will use English as placeholders and should be replaced with actual translations.\n');

let totalFilesCreated = 0;

remainingLanguages.forEach(lang => {
  const langDir = path.join(translationsDir, lang);

  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  Object.keys(enTranslations).forEach(namespace => {
    const filePath = path.join(langDir, `${namespace}.json`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipped ${lang}/${namespace}.json (already exists)`);
      return;
    }

    // Write English content as placeholder
    const content = {
      _TODO: `TRANSLATE THIS FILE TO ${lang.toUpperCase()}`,
      _note: `This is a placeholder file with English content. Replace all values with ${lang} translations.`,
      ...enTranslations[namespace]
    };

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`✓ Created ${lang}/${namespace}.json (placeholder)`);
    totalFilesCreated++;
  });
});

console.log(`\n✅ Created ${totalFilesCreated} placeholder translation files!`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Use an AI translation service or tool to translate each file`);
console.log(`   2. Remove the "_TODO" and "_note" fields from each file after translating`);
console.log(`   3. Ensure all {{variable}} placeholders are preserved in translations`);
console.log(`\n💡 Tip: You can use Claude or other AI tools to translate these files in batches`);
