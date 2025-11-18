// OpenAI API service for AI-powered features
import OpenAI from 'openai';
import { config } from './config';
import { WordPair } from './types';

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openai = new OpenAI({
      apiKey: config.openai.apiKey,
      dangerouslyAllowBrowser: true, // Required for React Native/Expo
    });
  }
  return openai;
}

/**
 * Generate word suggestions based on a theme using ChatGPT
 */
export async function generateWordSuggestions(
  theme: string,
  targetLanguage: string = 'Ukrainian',
  count: number = 5
): Promise<WordPair[]> {
  try {
    const client = getOpenAIClient();

    const prompt = `Generate ${count} English words related to "${theme}" with their ${targetLanguage} translations.
Format the response as a JSON array with objects containing "word" and "translation" fields.
Example format: [{"word": "cat", "translation": "кіт"}, {"word": "dog", "translation": "собака"}]
Only return the JSON array, no additional text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful language learning assistant that generates vocabulary words with accurate translations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim() || '[]';

    // Parse the JSON response
    const words = JSON.parse(responseText);

    // Add IDs to each word pair
    return words.map((word: any, index: number) => ({
      id: `${Date.now()}_${index}`,
      word: word.word,
      translation: word.translation,
    }));
  } catch (error) {
    console.error('Error generating word suggestions:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Generate a helpful hint for learning a word using ChatGPT
 */
export async function generateHint(
  word: string,
  translation: string,
  context?: string
): Promise<string> {
  try {
    const client = getOpenAIClient();

    const prompt = `Generate a short, helpful memory tip or hint to help someone remember that the English word "${word}" translates to "${translation}".
The hint should be one sentence, creative, and easy to remember. It could use mnemonics, associations, or interesting facts.
${context ? `Context: ${context}` : ''}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
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
      max_completion_tokens: 500,
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
export async function generateQuizDistractors(
  word: string,
  correctAnswer: string,
  allTranslations: string[],
  count: number = 3
): Promise<string[]> {
  try {
    const client = getOpenAIClient();

    // First, try to use existing translations from the set
    const otherTranslations = allTranslations.filter(t => t !== correctAnswer);

    if (otherTranslations.length >= count) {
      // Shuffle and return random selections
      const shuffled = otherTranslations.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // If not enough translations, generate plausible wrong answers with AI
    const prompt = `For the English word "${word}" which translates to "${correctAnswer}", generate ${count} plausible but incorrect translations that could trick someone learning the language.
These should be actual words in the same language, not the correct translation.
Format as a JSON array of strings.
Example: ["wrong1", "wrong2", "wrong3"]
Only return the JSON array, no additional text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content:
            'You are a language learning assistant that creates challenging but fair quiz questions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim() || '[]';
    const distractors = JSON.parse(responseText);

    // Combine with any existing translations we have
    const combined = [...otherTranslations, ...distractors];
    const shuffled = combined.sort(() => Math.random() - 0.5);

    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error generating quiz distractors:', error);
    // Fallback to existing translations or empty strings
    const fallback = allTranslations.filter(t => t !== correctAnswer);
    return fallback.slice(0, count);
  }
}
