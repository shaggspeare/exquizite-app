// AI helper functions using OpenAI API with fallback to mock data
import { WordPair } from './types';
import * as OpenAIService from './openai-service';

// Mock word suggestions by theme (fallback)
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

/**
 * Generate word suggestions based on theme
 * Uses OpenAI API, falls back to mock data on error
 */
export async function generateWordSuggestions(
  theme: string,
  targetLanguage: string = 'Ukrainian'
): Promise<WordPair[]> {
  try {
    // Try to use OpenAI API
    const suggestions = await OpenAIService.generateWordSuggestions(
      theme,
      targetLanguage,
      5
    );

    if (suggestions.length > 0) {
      return suggestions;
    }

    // Fallback to mock data
    const normalizedTheme = theme.toLowerCase();
    return mockSuggestions[normalizedTheme] || [];
  } catch (error) {
    console.error('Error generating word suggestions:', error);
    // Fallback to mock data
    const normalizedTheme = theme.toLowerCase();
    return mockSuggestions[normalizedTheme] || [];
  }
}

/**
 * Generate a hint for learning a word
 * Uses OpenAI API, falls back to simple hint on error
 */
export async function generateHint(
  word: string,
  translation: string
): Promise<string> {
  try {
    // Try to use OpenAI API
    const hint = await OpenAIService.generateHint(word, translation);
    return hint;
  } catch (error) {
    console.error('Error generating hint:', error);
    // Fallback to simple hint
    const fallbackHints = [
      `Think about the first letter: "${word[0].toUpperCase()}"`,
      `The word has ${word.length} letters`,
      `It translates to: ${translation.slice(0, 2)}...`,
      `Remember: ${word.toUpperCase()} → ${translation}`,
    ];
    return fallbackHints[Math.floor(Math.random() * fallbackHints.length)];
  }
}

/**
 * Generate quiz options (3 wrong + 1 correct)
 * Uses OpenAI API for better distractors when possible
 */
export async function generateQuizOptions(
  word: string,
  correctAnswer: string,
  allTranslations: string[]
): Promise<string[]> {
  try {
    // Filter out the correct answer from all translations
    const wrongOptions = allTranslations.filter(t => t !== correctAnswer);

    let distractors: string[];

    if (wrongOptions.length >= 3) {
      // Use existing translations from the set
      const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
      distractors = shuffled.slice(0, 3);
    } else {
      // Try to generate with OpenAI
      distractors = await OpenAIService.generateQuizDistractors(
        word,
        correctAnswer,
        allTranslations,
        3
      );
    }

    // Combine with correct answer and shuffle
    const allOptions = [...distractors, correctAnswer];
    return allOptions.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error generating quiz options:', error);
    // Fallback: use available translations
    const wrongOptions = allTranslations.filter(t => t !== correctAnswer);
    const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    const allOptions = [...selected, correctAnswer];
    return allOptions.sort(() => Math.random() - 0.5);
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
