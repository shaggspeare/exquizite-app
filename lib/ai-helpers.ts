// AI helper functions using OpenAI API
import { WordPair } from './types';
import * as OpenAIService from './openai-service';

/**
 * Generate word suggestions based on theme using OpenAI API
 */
export async function generateWordSuggestions(
  theme: string,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English'
): Promise<WordPair[]> {
  try {
    console.log('[AI Helper] Requesting word suggestions:', { theme, targetLanguage, nativeLanguage });

    const suggestions = await OpenAIService.generateWordSuggestions(
      theme,
      targetLanguage,
      nativeLanguage,
      5
    );

    if (suggestions.length === 0) {
      console.warn('[AI Helper] No suggestions returned from OpenAI');
      throw new Error('No suggestions generated');
    }

    console.log('[AI Helper] Successfully received', suggestions.length, 'suggestions');
    return suggestions;
  } catch (error) {
    console.error('[AI Helper] Error generating word suggestions:', error);
    // Return empty array - no mock fallback
    return [];
  }
}

/**
 * Generate a sentence with a gap for fill-in-the-blank exercise
 */
export async function generateSentenceWithGap(
  word: string,
  translation: string,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English'
): Promise<{ sentence: string; correctAnswer: string }> {
  try {
    console.log('[AI Helper] Requesting sentence with gap:', { word, translation });

    const result = await OpenAIService.generateSentenceWithGap(
      word,
      translation,
      targetLanguage,
      nativeLanguage
    );

    console.log('[AI Helper] Successfully generated sentence with gap');
    return result;
  } catch (error) {
    console.error('[AI Helper] Error generating sentence with gap:', error);
    // Fallback to simple sentence
    return {
      sentence: `___ means ${translation}`,
      correctAnswer: word,
    };
  }
}
