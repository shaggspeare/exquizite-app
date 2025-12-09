// AI helper functions using OpenAI API
import { WordPair } from './types';
import * as OpenAIService from './openai-service';

/**
 * Generate word suggestions based on theme using OpenAI API
 */
export async function generateWordSuggestions(
  theme: string,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English',
  count: number = 5
): Promise<WordPair[]> {
  try {
    console.log('[AI Helper] Requesting word suggestions:', {
      theme,
      targetLanguage,
      nativeLanguage,
      count,
    });

    const suggestions = await OpenAIService.generateWordSuggestions(
      theme,
      targetLanguage,
      nativeLanguage,
      count
    );

    if (suggestions.length === 0) {
      console.warn('[AI Helper] No suggestions returned from OpenAI');
      throw new Error('No suggestions generated');
    }

    console.log(
      '[AI Helper] Successfully received',
      suggestions.length,
      'suggestions'
    );
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
    console.log('[AI Helper] Requesting sentence with gap:', {
      word,
      translation,
    });

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

/**
 * Generate multiple sentences with gaps in a single request
 */
export async function generateMultipleSentencesWithGaps(
  words: Array<{ word: string; translation: string }>,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English'
): Promise<
  Array<{ sentence: string; correctAnswer: string; options: string[] }>
> {
  try {
    console.log('[AI Helper] Requesting multiple sentences with gaps:', {
      count: words.length,
    });

    const results = await OpenAIService.generateMultipleSentencesWithGaps(
      words,
      targetLanguage,
      nativeLanguage
    );

    console.log(
      '[AI Helper] Successfully generated',
      results.length,
      'sentences with gaps'
    );
    return results;
  } catch (error) {
    console.error(
      '[AI Helper] Error generating multiple sentences with gaps:',
      error
    );
    // Fallback to simple sentences with basic options
    return words.map((w, index) => {
      // Create simple distractors from other words in the list
      const otherWords = words
        .filter((_, i) => i !== index)
        .map(word => word.word);
      const distractors = otherWords.slice(0, 3);

      // If not enough words, use placeholder distractors
      while (distractors.length < 3) {
        distractors.push(`option${distractors.length + 1}`);
      }

      const allOptions = [w.word, ...distractors];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      return {
        sentence: `___ means ${w.translation}`,
        correctAnswer: w.word,
        options: shuffledOptions,
      };
    });
  }
}
