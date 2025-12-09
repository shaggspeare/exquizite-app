// OpenAI API service for AI-powered features
import OpenAI from 'openai';
import { config } from './config';
import { WordPair } from './types';

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!config.openai.apiKey) {
      console.error(
        '[OpenAI] API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file'
      );
      throw new Error(
        'OpenAI API key not configured. Check your environment variables.'
      );
    }
    console.log(
      '[OpenAI] Initializing client with API key:',
      config.openai.apiKey.substring(0, 10) + '...'
    );
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
    console.log('[OpenAI] Generating word suggestions:', {
      theme,
      targetLanguage,
      nativeLanguage,
      count,
    });
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
    const words = Array.isArray(responseData)
      ? responseData
      : responseData.words || [];

    if (!Array.isArray(words) || words.length === 0) {
      console.error('[OpenAI] Invalid response format:', responseData);
      throw new Error('Invalid response format from OpenAI');
    }

    // Add IDs to each word pair and limit to requested count
    const result = words.slice(0, count).map((word: any, index: number) => ({
      id: `${Date.now()}_${index}`,
      word: word.word || '',
      translation: word.translation || '',
    }));

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
      status: error?.status,
      type: error?.type,
    });
    // Return empty array on error to trigger fallback
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
    const client = getOpenAIClient();

    // Create a context string from existing pairs
    const contextWords = existingPairs
      .map(pair => `${pair.word} (${pair.translation})`)
      .join(', ');

    const prompt = `Based on these existing ${targetLanguage}-${nativeLanguage} word pairs: ${contextWords}

Generate ${count} additional ${targetLanguage} words that fit the same theme or topic, with their ${nativeLanguage} translations.
The new words should be related to or complement the existing words.

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
            'You are a helpful language learning assistant that generates vocabulary words with accurate translations based on context. Always respond with valid JSON only.',
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
    const words = Array.isArray(responseData)
      ? responseData
      : responseData.words || [];

    if (!Array.isArray(words) || words.length === 0) {
      console.error('[OpenAI] Invalid response format:', responseData);
      throw new Error('Invalid response format from OpenAI');
    }

    // Add IDs to each word pair and limit to requested count
    const result = words.slice(0, count).map((word: any, index: number) => ({
      id: `${Date.now()}_${index}`,
      word: word.word || '',
      translation: word.translation || '',
    }));

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
    console.log('[OpenAI] Generating quiz distractors:', {
      word,
      correctAnswer,
      targetLanguage,
      nativeLanguage,
      count,
    });
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
    console.log(
      '[OpenAI] Successfully generated',
      result.length,
      'distractors'
    );
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
    const client = getOpenAIClient();

    const prompt = `Generate a simple, natural sentence in ${targetLanguage} that uses the word "${word}" (which means "${translation}" in ${nativeLanguage}).
Replace the word "${word}" with "___" to create a fill-in-the-blank exercise.
The sentence should be appropriate for language learners and provide context clues.
Format as a JSON object with "sentence" (the sentence with ___) and "correctAnswer" (the word "${word}") fields.
Example format: {"sentence": "Я люблю ___ на сніданок", "correctAnswer": "яблука"}
Only return valid JSON, no additional text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a language learning assistant that creates educational fill-in-the-blank exercises. Always respond with valid JSON only.',
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
    console.log('[OpenAI] Sentence response received');

    const responseData = JSON.parse(responseText);

    if (!responseData.sentence || !responseData.correctAnswer) {
      throw new Error('Invalid response format');
    }

    console.log('[OpenAI] Successfully generated sentence with gap');
    return {
      sentence: responseData.sentence,
      correctAnswer: responseData.correctAnswer,
    };
  } catch (error: any) {
    console.error('[OpenAI] Error generating sentence with gap:', {
      message: error?.message,
      status: error?.status,
    });
    // Fallback sentence
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
    const client = getOpenAIClient();

    const wordsList = words
      .map((w, i) => `${i + 1}. "${w.word}" (means "${w.translation}")`)
      .join('\n');

    const prompt = `Generate simple, natural sentences in ${targetLanguage} for the following words. Each sentence should use the word and then have it replaced with "___" to create fill-in-the-blank exercises.
For each word, also generate 3 plausible but incorrect ${targetLanguage} words that could trick a language learner. These distractors should be different words that could grammatically fit in the sentence but doesnt fit to it in term of sense. If user understands the word correctly he should have no doubt to select right word.

Words:
${wordsList}

Format the response as a JSON object with a "sentences" property containing an array of objects.
Each object should have:
- "sentence": the sentence with ___
- "correctAnswer": the original word
- "distractors": array of 3 incorrect ${targetLanguage} words

Example format: {
  "sentences": [
    {
      "sentence": "Я люблю ___ на сніданок",
      "correctAnswer": "яблука",
      "distractors": ["банани", "молоко", "хліб"]
    }
  ]
}
Only return valid JSON, no additional text.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a language learning assistant that creates educational fill-in-the-blank exercises with multiple choice options. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 2500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content?.trim() || '{}';
    console.log('[OpenAI] Multiple sentences response received');

    const responseData = JSON.parse(responseText);
    const sentences = responseData.sentences || [];

    if (!Array.isArray(sentences) || sentences.length === 0) {
      throw new Error('Invalid response format');
    }

    // Process each sentence to create shuffled options array
    const processedSentences = sentences.map((item: any) => {
      const distractors = item.distractors || [];
      const correctAnswer = item.correctAnswer;

      // Combine correct answer with distractors and shuffle
      const allOptions = [correctAnswer, ...distractors.slice(0, 3)];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      return {
        sentence: item.sentence,
        correctAnswer: correctAnswer,
        options: shuffledOptions,
      };
    });

    console.log(
      '[OpenAI] Successfully generated',
      processedSentences.length,
      'sentences with options'
    );
    return processedSentences;
  } catch (error: any) {
    console.error('[OpenAI] Error generating multiple sentences with gaps:', {
      message: error?.message,
      status: error?.status,
    });
    // Fallback: return simple sentences for each word with basic distractors
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
