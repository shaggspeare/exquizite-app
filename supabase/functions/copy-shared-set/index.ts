// Edge Function: copy-shared-set
// Creates a copy of a shared set for the current user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  shareCode: string;
  customName?: string;
}

interface CopyResponse {
  setId: string;
  name: string;
  wordCount: number;
  success: boolean;
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'Missing authorization header. Please sign in to copy sets.',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user - extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({
          error: 'Unauthorized. Please sign in to copy sets.',
          details: userError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { shareCode, customName }: RequestBody = await req.json();

    if (!shareCode) {
      return new Response(JSON.stringify({ error: 'shareCode is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch share information
    const { data: share, error: shareError } = await supabaseClient
      .from('shared_sets')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (shareError || !share) {
      return new Response(JSON.stringify({ error: 'Share not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Fetch the original word set
    const { data: originalSet, error: setError } = await supabaseClient
      .from('word_sets')
      .select('*')
      .eq('id', share.set_id)
      .single();

    if (setError || !originalSet) {
      return new Response(
        JSON.stringify({ error: 'Original word set not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is trying to copy their own set
    if (originalSet.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'You already own this set' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch word pairs from original set using service role to bypass RLS
    // (This is safe because we've already verified the share is active and not expired)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: originalPairs, error: pairsError } = await serviceClient
      .from('word_pairs')
      .select('word, translation, position')
      .eq('set_id', share.set_id)
      .order('position', { ascending: true });

    if (pairsError || !originalPairs) {
      console.error('Error fetching word pairs:', pairsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch word pairs' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch language info from shared_sets_with_details view using service role
    const { data: setDetails } = await serviceClient
      .from('shared_sets_with_details')
      .select('target_language, native_language')
      .eq('share_code', shareCode)
      .single();

    // Create new set for current user
    const newSetName = customName || `${originalSet.name} (Copy)`;
    const { data: newSet, error: createError } = await supabaseClient
      .from('word_sets')
      .insert({
        user_id: user.id,
        name: newSetName,
        target_language:
          setDetails?.target_language || originalSet.target_language,
        native_language:
          setDetails?.native_language || originalSet.native_language,
        is_copy: true,
        original_author_id: originalSet.user_id,
      })
      .select()
      .single();

    if (createError || !newSet) {
      console.error('Error creating new set:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create new set' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Copy word pairs to new set
    const newPairs = originalPairs.map(pair => ({
      set_id: newSet.id,
      word: pair.word,
      translation: pair.translation,
      position: pair.position,
    }));

    const { error: insertError } = await supabaseClient
      .from('word_pairs')
      .insert(newPairs);

    if (insertError) {
      console.error('Error copying word pairs:', insertError);
      // Rollback - delete the set we just created
      await supabaseClient.from('word_sets').delete().eq('id', newSet.id);
      return new Response(
        JSON.stringify({ error: 'Failed to copy word pairs' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Record the copy in set_copies table
    await supabaseClient.from('set_copies').insert({
      original_set_id: originalSet.id,
      copied_set_id: newSet.id,
      copied_by: user.id,
      shared_via_code: shareCode,
    });

    // Increment copy count on share
    await supabaseClient.rpc('increment_share_copy_count', {
      p_share_code: shareCode,
    });

    const response: CopyResponse = {
      setId: newSet.id,
      name: newSet.name,
      wordCount: originalPairs.length,
      success: true,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
