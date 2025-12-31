// OpenAI API service for AI-powered features
// All calls go through Supabase Edge Function to keep API key secure
import { supabase } from './supabase';
import { config } from './config';
import { WordPair } from './types';

const EDGE_FUNCTION_URL = `${config.supabase.url}/functions/v1/openai`;

async function callEdgeFunction(body: Record<string, any>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: config.supabase.anonKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[OpenAI] Edge function error:', error);
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Check if OpenAI is properly configured (via Edge Function)
 */
export function isConfigured(): boolean {
  // OpenAI is configured server-side, so we just check if Supabase is configured
  return !!config.supabase.url && !!config.supabase.anonKey;
}

/**
 * Generate word suggestions based on a theme using ChatGPT
 */
export async function generateWordSuggestions(
  theme: string,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English',
  count: number = 5
): Promise<WordPair[]> {
  try {
    console.log('[OpenAI] Generating word suggestions:', {
      theme,
      targetLanguage,
      nativeLanguage,
      count,
    });

    const result = await callEdgeFunction({
      action: 'generateWords',
      theme,
      targetLanguage,
      nativeLanguage,
      count,
    });

    console.log(
      '[OpenAI] Successfully generated',
      result.length,
      'words (requested:',
      count,
      ')'
    );
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating word suggestions:', {
      message: error?.message,
    });
    return [];
  }
}

/**
 * Generate additional word suggestions based on existing word pairs
 */
export async function generateWordSuggestionsFromContext(
  existingPairs: WordPair[],
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English',
  count: number = 5
): Promise<WordPair[]> {
  try {
    console.log('[OpenAI] Generating word suggestions from context:', {
      existingPairs: existingPairs.length,
      targetLanguage,
      nativeLanguage,
      count,
    });

    const result = await callEdgeFunction({
      action: 'generateWordsFromContext',
      existingPairs,
      targetLanguage,
      nativeLanguage,
      count,
    });

    console.log(
      '[OpenAI] Successfully generated',
      result.length,
      'words from context (requested:',
      count,
      ')'
    );
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating word suggestions from context:', {
      message: error?.message,
    });
    return [];
  }
}

/**
 * Generate a helpful hint for learning a word using ChatGPT
 */
export async function generateHint(
  word: string,
  translation: string,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English',
  context?: string
): Promise<string> {
  try {
    const result = await callEdgeFunction({
      action: 'generateHint',
      word,
      translation,
      targetLanguage,
      nativeLanguage,
      context,
    });

    return result || 'Think about the meaning and practice!';
  } catch (error) {
    console.error('Error generating hint:', error);
    return 'Think about the meaning and practice!';
  }
}

/**
 * Generate plausible wrong answers for quiz questions using ChatGPT
 */
export async function generateQuizDistractors(params: {
  word: string;
  correctAnswer: string;
  allTranslations: string[];
  targetLanguage?: string;
  nativeLanguage?: string;
  count?: number;
}): Promise<string[]> {
  const {
    word,
    correctAnswer,
    allTranslations,
    targetLanguage = 'Ukrainian',
    nativeLanguage = 'English',
    count = 3,
  } = params;

  try {
    console.log('[OpenAI] Generating quiz distractors:', {
      word,
      correctAnswer,
      targetLanguage,
      nativeLanguage,
      count,
    });

    const result = await callEdgeFunction({
      action: 'generateDistractors',
      word,
      correctAnswer,
      allTranslations,
      targetLanguage,
      nativeLanguage,
      count,
    });

    console.log(
      '[OpenAI] Successfully generated',
      result.length,
      'distractors'
    );
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating quiz distractors:', {
      message: error?.message,
    });
    const fallback = allTranslations.filter(t => t !== correctAnswer);
    return fallback.slice(0, count);
  }
}

/**
 * Generate a sentence with a gap where the word should be filled in
 */
export async function generateSentenceWithGap(
  word: string,
  translation: string,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English'
): Promise<{ sentence: string; correctAnswer: string }> {
  try {
    console.log('[OpenAI] Generating sentence with gap:', {
      word,
      translation,
      targetLanguage,
    });

    const result = await callEdgeFunction({
      action: 'generateSentence',
      word,
      translation,
      targetLanguage,
      nativeLanguage,
    });

    console.log('[OpenAI] Successfully generated sentence with gap');
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating sentence with gap:', {
      message: error?.message,
    });
    return {
      sentence: `___ means ${translation}`,
      correctAnswer: word,
    };
  }
}

/**
 * Generate multiple sentences with gaps in a single API call
 */
export async function generateMultipleSentencesWithGaps(
  words: Array<{ word: string; translation: string }>,
  targetLanguage: string = 'Ukrainian',
  nativeLanguage: string = 'English'
): Promise<
  Array<{ sentence: string; correctAnswer: string; options: string[] }>
> {
  try {
    console.log('[OpenAI] Generating multiple sentences with gaps:', {
      count: words.length,
      targetLanguage,
    });

    const result = await callEdgeFunction({
      action: 'generateMultipleSentences',
      words,
      targetLanguage,
      nativeLanguage,
    });

    console.log(
      '[OpenAI] Successfully generated',
      result.length,
      'sentences with options'
    );
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating multiple sentences with gaps:', {
      message: error?.message,
    });
    // Fallback
    return words.map((w, index) => {
      const otherWords = words
        .filter((_, i) => i !== index)
        .map(word => word.word);
      const distractors = otherWords.slice(0, 3);
      while (distractors.length < 3) {
        distractors.push(`option${distractors.length + 1}`);
      }
      const allOptions = [w.word, ...distractors];
      return {
        sentence: `___ means ${w.translation}`,
        correctAnswer: w.word,
        options: allOptions.sort(() => Math.random() - 0.5),
      };
    });
  }
}
