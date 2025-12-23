#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the complete translations data
const { ALL_TRANSLATIONS } = require('./all-translations-data.js');

const translationsDir = path.join(__dirname, '..', 'translations');

// Generate translation files for each language
Object.keys(ALL_TRANSLATIONS).forEach(lang => {
  const langDir = path.join(translationsDir, lang);

  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  Object.keys(ALL_TRANSLATIONS[lang]).forEach(namespace => {
    const filePath = path.join(langDir, `${namespace}.json`);
    fs.writeFileSync(
      filePath,
      JSON.stringify(ALL_TRANSLATIONS[lang][namespace], null, 2),
      'utf8'
    );
    console.log(`✓ Created ${lang}/${namespace}.json`);
  });
});

console.log('\n✅ All translations generated successfully!');
