// OpenAI API service for AI-powered features
import OpenAI from 'openai';
import { config } from './config';
import { WordPair } from './types';

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!config.openai.apiKey) {
      console.error('[OpenAI] API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file');
      throw new Error('OpenAI API key not configured. Check your environment variables.');
    }
    console.log('[OpenAI] Initializing client with API key:', config.openai.apiKey.substring(0, 10) + '...');
    openai = new OpenAI({
      apiKey: config.openai.apiKey,
      dangerouslyAllowBrowser: true, // Required for React Native/Expo
    });
  }
  return openai;
}

/**
 * Check if OpenAI is properly configured
 */
export function isConfigured(): boolean {
  return !!config.openai.apiKey && config.openai.apiKey.length > 0;
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
    console.log('[OpenAI] Generating word suggestions:', { theme, targetLanguage, nativeLanguage, count });
    const client = getOpenAIClient();

    const prompt = `Generate ${count} ${targetLanguage} words related to "${theme}" with their ${nativeLanguage} translations.
Format the response as a JSON object with a "words" property containing an array of word objects.
Each word object should have "word" (in ${targetLanguage}) and "translation" (in ${nativeLanguage}) fields.
Example format: {"words": [{"word": "кіт", "translation": "cat"}, {"word": "собака", "translation": "dog"}]}
Only return valid JSON, no additional text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful language learning assistant that generates vocabulary words with accurate translations. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content?.trim() || '{}';
    console.log('[OpenAI] Response received:', responseText.substring(0, 200));

    // Parse the JSON response
    const responseData = JSON.parse(responseText);

    // Handle both direct array and object with array property
    const words = Array.isArray(responseData) ? responseData : (responseData.words || []);

    if (!Array.isArray(words) || words.length === 0) {
      console.error('[OpenAI] Invalid response format:', responseData);
      throw new Error('Invalid response format from OpenAI');
    }

    // Add IDs to each word pair
    const result = words.map((word: any, index: number) => ({
      id: `${Date.now()}_${index}`,
      word: word.word || '',
      translation: word.translation || '',
    }));

    console.log('[OpenAI] Successfully generated', result.length, 'words');
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating word suggestions:', {
      message: error?.message,
      status: error?.status,
      type: error?.type,
    });
    // Return empty array on error to trigger fallback
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
    const client = getOpenAIClient();

    const prompt = `Generate a short, helpful memory tip or hint to help someone remember that the ${targetLanguage} word "${word}" translates to "${translation}" in ${nativeLanguage}.
The hint should be one sentence, creative, and easy to remember. It could use mnemonics, associations, or interesting facts.
${context ? `Context: ${context}` : ''}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a creative language learning assistant that creates memorable hints and mnemonics.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 150,
      temperature: 0.8,
    });

    return (
      completion.choices[0].message.content?.trim() ||
      'Think about the meaning and practice!'
    );
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
    console.log('[OpenAI] Generating quiz distractors:', { word, correctAnswer, targetLanguage, nativeLanguage, count });
    const client = getOpenAIClient();

    // First, try to use existing translations from the set
    const otherTranslations = allTranslations.filter(t => t !== correctAnswer);

    if (otherTranslations.length >= count) {
      // Shuffle and return random selections
      console.log('[OpenAI] Using existing translations for distractors');
      const shuffled = otherTranslations.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // If not enough translations, generate plausible wrong answers with AI
    const prompt = `For the ${targetLanguage} word "${word}" which translates to "${correctAnswer}" in ${nativeLanguage}, generate ${count} plausible but incorrect ${nativeLanguage} translations that could trick someone learning the language.
These should be actual words in ${nativeLanguage}, not the correct translation.
Format as a JSON object with a "distractors" property containing an array of strings.
Example: {"distractors": ["wrong1", "wrong2", "wrong3"]}
Only return valid JSON, no additional text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a language learning assistant that creates challenging but fair quiz questions. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 200,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content?.trim() || '{}';
    console.log('[OpenAI] Distractors response received');

    const responseData = JSON.parse(responseText);
    const distractors = responseData.distractors || [];

    // Combine with any existing translations we have
    const combined = [...otherTranslations, ...distractors];
    const shuffled = combined.sort(() => Math.random() - 0.5);

    const result = shuffled.slice(0, count);
    console.log('[OpenAI] Successfully generated', result.length, 'distractors');
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error generating quiz distractors:', {
      message: error?.message,
      status: error?.status,
    });
    // Fallback to existing translations or empty strings
    const fallback = allTranslations.filter(t => t !== correctAnswer);
    return fallback.slice(0, count);
  }
}
