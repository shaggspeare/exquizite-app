// Edge Function: get-shared-set
// Retrieves a shared set by share code, with word pairs and metadata

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordPair {
  id: string;
  word: string;
  translation: string;
  position: number;
}

interface SharedSetResponse {
  setId: string;
  name: string;
  targetLanguage: string;
  nativeLanguage: string;
  wordCount: number;
  words: WordPair[];
  shareInfo: {
    shareCode: string;
    viewCount: number;
    copyCount: number;
    createdAt: string;
    expiresAt?: string;
  };
  author: {
    name: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client (using anon key for public access)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get share code from query parameter or body
    const url = new URL(req.url);
    let shareCode = url.searchParams.get('shareCode');

    if (!shareCode && req.method === 'POST') {
      const body = await req.json();
      shareCode = body.shareCode;
    }

    if (!shareCode) {
      return new Response(
        JSON.stringify({ error: 'shareCode is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch share information
    const { data: share, error: shareError } = await supabaseClient
      .from('shared_sets')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (shareError || !share) {
      return new Response(
        JSON.stringify({ error: 'Share not found or inactive' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if share is active and not expired
    if (!share.is_active) {
      return new Response(
        JSON.stringify({ error: 'This share link is no longer active' }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This share link has expired' }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Increment view count (using the helper function)
    await supabaseClient.rpc('increment_share_view_count', {
      p_share_code: shareCode,
    });

    // Fetch the word set
    const { data: wordSet, error: setError } = await supabaseClient
      .from('word_sets')
      .select('id, name, user_id, created_at, updated_at, last_practiced')
      .eq('id', share.set_id)
      .single();

    if (setError || !wordSet) {
      return new Response(
        JSON.stringify({ error: 'Word set not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch word pairs
    const { data: wordPairs, error: pairsError } = await supabaseClient
      .from('word_pairs')
      .select('id, word, translation, position')
      .eq('set_id', share.set_id)
      .order('position', { ascending: true });

    if (pairsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch word pairs' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch author information (anonymized)
    const { data: author, error: authorError } = await supabaseClient
      .from('profiles')
      .select('name')
      .eq('id', wordSet.user_id)
      .single();

    // Note: We need to get target_language and native_language from somewhere
    // Since they're not in the current word_sets schema in supabase.ts,
    // we'll use placeholders for now. You should add these columns to the database.

    // For now, we'll fetch from shared_sets_with_details view which includes language info
    const { data: setDetails, error: detailsError } = await supabaseClient
      .from('shared_sets_with_details')
      .select('target_language, native_language')
      .eq('share_code', shareCode)
      .single();

    const response: SharedSetResponse = {
      setId: wordSet.id,
      name: wordSet.name,
      targetLanguage: setDetails?.target_language || 'Unknown',
      nativeLanguage: setDetails?.native_language || 'Unknown',
      wordCount: wordPairs?.length || 0,
      words: wordPairs || [],
      shareInfo: {
        shareCode: share.share_code,
        viewCount: share.view_count + 1, // Include the increment we just made
        copyCount: share.copy_count,
        createdAt: share.created_at,
        expiresAt: share.expires_at,
      },
      author: {
        name: author?.name || 'Anonymous User',
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
