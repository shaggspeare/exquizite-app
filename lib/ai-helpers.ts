// Mock AI helper functions for word suggestions and hints
import { WordPair } from './types';

// Mock word suggestions by theme
const mockSuggestions: Record<string, WordPair[]> = {
  animals: [
    { id: '1', word: 'cat', translation: 'кіт' },
    { id: '2', word: 'dog', translation: 'собака' },
    { id: '3', word: 'bird', translation: 'птах' },
    { id: '4', word: 'fish', translation: 'риба' },
    { id: '5', word: 'horse', translation: 'кінь' },
  ],
  colors: [
    { id: '1', word: 'red', translation: 'червоний' },
    { id: '2', word: 'blue', translation: 'синій' },
    { id: '3', word: 'green', translation: 'зелений' },
    { id: '4', word: 'yellow', translation: 'жовтий' },
    { id: '5', word: 'white', translation: 'білий' },
  ],
  food: [
    { id: '1', word: 'bread', translation: 'хліб' },
    { id: '2', word: 'milk', translation: 'молоко' },
    { id: '3', word: 'apple', translation: 'яблуко' },
    { id: '4', word: 'water', translation: 'вода' },
    { id: '5', word: 'cheese', translation: 'сир' },
  ],
};

export function generateWordSuggestions(theme: string): WordPair[] {
  // Simulate AI processing delay
  const normalizedTheme = theme.toLowerCase();
  return mockSuggestions[normalizedTheme] || [];
}

export function generateHint(word: string, translation: string): string {
  // Mock hint generation
  const hints = [
    `Think about the first letter: "${word[0].toUpperCase()}"`,
    `The word has ${word.length} letters`,
    `It translates to: ${translation.slice(0, 2)}...`,
    `Remember: ${word.toUpperCase()} → ${translation}`,
  ];

  return hints[Math.floor(Math.random() * hints.length)];
}

export function generateQuizOptions(
  correctAnswer: string,
  allTranslations: string[]
): string[] {
  // Filter out the correct answer from all translations
  const wrongOptions = allTranslations.filter(t => t !== correctAnswer);

  // Shuffle and take 3 random wrong answers
  const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // Combine with correct answer and shuffle again
  const allOptions = [...selected, correctAnswer];
  return allOptions.sort(() => Math.random() - 0.5);
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
