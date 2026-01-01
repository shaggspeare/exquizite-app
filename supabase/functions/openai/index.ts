// Edge Function: openai
// Secure proxy for OpenAI API calls - keeps API key server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface WordPair {
  word: string;
  translation: string;
}

interface GenerateWordsRequest {
  action: 'generateWords';
  theme: string;
  targetLanguage: string;
  nativeLanguage: string;
  count: number;
}

interface GenerateWordsFromContextRequest {
  action: 'generateWordsFromContext';
  existingPairs: WordPair[];
  targetLanguage: string;
  nativeLanguage: string;
  count: number;
}

interface GenerateHintRequest {
  action: 'generateHint';
  word: string;
  translation: string;
  targetLanguage: string;
  nativeLanguage: string;
  context?: string;
}

interface GenerateDistractorsRequest {
  action: 'generateDistractors';
  word: string;
  correctAnswer: string;
  allTranslations: string[];
  targetLanguage: string;
  nativeLanguage: string;
  count: number;
}

interface GenerateSentenceRequest {
  action: 'generateSentence';
  word: string;
  translation: string;
  targetLanguage: string;
  nativeLanguage: string;
}

interface GenerateMultipleSentencesRequest {
  action: 'generateMultipleSentences';
  words: WordPair[];
  targetLanguage: string;
  nativeLanguage: string;
}

type RequestBody =
  | GenerateWordsRequest
  | GenerateWordsFromContextRequest
  | GenerateHintRequest
  | GenerateDistractorsRequest
  | GenerateSentenceRequest
  | GenerateMultipleSentencesRequest;

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  options: {
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
  } = {}
) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const { maxTokens = 500, temperature = 0.7, jsonMode = false } = options;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_completion_tokens: maxTokens,
      temperature,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content?.trim() || '';
}

async function generateWords(req: GenerateWordsRequest) {
  const { theme, targetLanguage, nativeLanguage, count } = req;

  const prompt = `Generate ${count} ${targetLanguage} words related to "${theme}" with their ${nativeLanguage} translations.
Format the response as a JSON object with a "words" property containing an array of word objects.
Each word object should have "word" (in ${targetLanguage}) and "translation" (in ${nativeLanguage}) fields.
Example format: {"words": [{"word": "кіт", "translation": "cat"}, {"word": "собака", "translation": "dog"}]}
Only return valid JSON, no additional text.`;

  const responseText = await callOpenAI(
    [
      {
        role: 'system',
        content:
          'You are a helpful language learning assistant that generates vocabulary words with accurate translations. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 500, temperature: 0.7, jsonMode: true }
  );

  const responseData = JSON.parse(responseText);
  const words = Array.isArray(responseData)
    ? responseData
    : responseData.words || [];

  return words.slice(0, count).map((word: any, index: number) => ({
    id: `${Date.now()}_${index}`,
    word: word.word || '',
    translation: word.translation || '',
  }));
}

async function generateWordsFromContext(
  req: GenerateWordsFromContextRequest
) {
  const { existingPairs, targetLanguage, nativeLanguage, count } = req;

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

  const responseText = await callOpenAI(
    [
      {
        role: 'system',
        content:
          'You are a helpful language learning assistant that generates vocabulary words with accurate translations based on context. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 500, temperature: 0.7, jsonMode: true }
  );

  const responseData = JSON.parse(responseText);
  const words = Array.isArray(responseData)
    ? responseData
    : responseData.words || [];

  return words.slice(0, count).map((word: any, index: number) => ({
    id: `${Date.now()}_${index}`,
    word: word.word || '',
    translation: word.translation || '',
  }));
}

async function generateHint(req: GenerateHintRequest) {
  const { word, translation, targetLanguage, nativeLanguage, context } = req;

  const prompt = `Generate a short, helpful memory tip or hint to help someone remember that the ${targetLanguage} word "${word}" translates to "${translation}" in ${nativeLanguage}.
The hint should be one sentence, creative, and easy to remember. It could use mnemonics, associations, or interesting facts.
${context ? `Context: ${context}` : ''}`;

  const responseText = await callOpenAI(
    [
      {
        role: 'system',
        content:
          'You are a creative language learning assistant that creates memorable hints and mnemonics.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 150, temperature: 0.8 }
  );

  return responseText || 'Think about the meaning and practice!';
}

async function generateDistractors(req: GenerateDistractorsRequest) {
  const {
    word,
    correctAnswer,
    allTranslations,
    targetLanguage,
    nativeLanguage,
    count,
  } = req;

  // First try existing translations
  const otherTranslations = allTranslations.filter(t => t !== correctAnswer);
  if (otherTranslations.length >= count) {
    const shuffled = otherTranslations.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  const prompt = `For the ${targetLanguage} word "${word}" which translates to "${correctAnswer}" in ${nativeLanguage}, generate ${count} plausible but incorrect ${nativeLanguage} translations that could trick someone learning the language.
These should be actual words in ${nativeLanguage}, not the correct translation.
Format as a JSON object with a "distractors" property containing an array of strings.
Example: {"distractors": ["wrong1", "wrong2", "wrong3"]}
Only return valid JSON, no additional text.`;

  const responseText = await callOpenAI(
    [
      {
        role: 'system',
        content:
          'You are a language learning assistant that creates challenging but fair quiz questions. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 200, temperature: 0.7, jsonMode: true }
  );

  const responseData = JSON.parse(responseText);
  const distractors = responseData.distractors || [];

  const combined = [...otherTranslations, ...distractors];
  const shuffled = combined.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function generateSentence(req: GenerateSentenceRequest) {
  const { word, translation, targetLanguage, nativeLanguage } = req;

  const prompt = `Generate a simple, natural sentence in ${targetLanguage} that uses the word "${word}" (which means "${translation}" in ${nativeLanguage}).
Replace the word "${word}" with "___" to create a fill-in-the-blank exercise.
The sentence should be appropriate for language learners and provide context clues.
Format as a JSON object with "sentence" (the sentence with ___) and "correctAnswer" (the word "${word}") fields.
Example format: {"sentence": "Я люблю ___ на сніданок", "correctAnswer": "яблука"}
Only return valid JSON, no additional text.`;

  const responseText = await callOpenAI(
    [
      {
        role: 'system',
        content:
          'You are a language learning assistant that creates educational fill-in-the-blank exercises. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 200, temperature: 0.7, jsonMode: true }
  );

  const responseData = JSON.parse(responseText);

  if (!responseData.sentence || !responseData.correctAnswer) {
    return { sentence: `___ means ${translation}`, correctAnswer: word };
  }

  return {
    sentence: responseData.sentence,
    correctAnswer: responseData.correctAnswer,
  };
}

async function generateMultipleSentences(
  req: GenerateMultipleSentencesRequest
) {
  const { words, targetLanguage, nativeLanguage } = req;

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

  const responseText = await callOpenAI(
    [
      {
        role: 'system',
        content:
          'You are a language learning assistant that creates educational fill-in-the-blank exercises with multiple choice options. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 2500, temperature: 0.7, jsonMode: true }
  );

  const responseData = JSON.parse(responseText);
  const sentences = responseData.sentences || [];

  if (!Array.isArray(sentences) || sentences.length === 0) {
    // Fallback
    return words.map((w, index) => {
      const otherWords = words.filter((_, i) => i !== index).map(word => word.word);
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

  return sentences.map((item: any) => {
    const distractors = item.distractors || [];
    const correctAnswer = item.correctAnswer;
    const allOptions = [correctAnswer, ...distractors.slice(0, 3)];
    return {
      sentence: item.sentence,
      correctAnswer: correctAnswer,
      options: allOptions.sort(() => Math.random() - 0.5),
    };
  });
}

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authorization - allow both authenticated users and guests
    const authHeader = req.headers.get('Authorization');

    // If there's an auth header, verify it's valid
    // If no auth header, allow the request (for guest users)
    if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

      if (userError || !user) {
        console.log('Auth header provided but invalid, treating as guest request');
        // Don't reject, just continue as guest
      }
    }

    // Parse request
    const body: RequestBody = await req.json();

    let result;

    switch (body.action) {
      case 'generateWords':
        result = await generateWords(body);
        break;
      case 'generateWordsFromContext':
        result = await generateWordsFromContext(body);
        break;
      case 'generateHint':
        result = await generateHint(body);
        break;
      case 'generateDistractors':
        result = await generateDistractors(body);
        break;
      case 'generateSentence':
        result = await generateSentence(body);
        break;
      case 'generateMultipleSentences':
        result = await generateMultipleSentences(body);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OpenAI Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
