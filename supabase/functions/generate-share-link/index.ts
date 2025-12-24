// Edge Function: generate-share-link
// Generates a unique share code and creates a shareable link for a word set

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  setId: string;
  isPublic?: boolean;
  expiresInDays?: number;
}

interface ShareResponse {
  shareId: string;
  shareCode: string;
  shareUrl: string;
  isNew: boolean;
  viewCount: number;
  copyCount: number;
  createdAt: string;
  expiresAt?: string;
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
        JSON.stringify({ error: 'Missing authorization header' }),
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
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const {
      setId,
      isPublic = true,
      expiresInDays,
    }: RequestBody = await req.json();

    if (!setId) {
      return new Response(JSON.stringify({ error: 'setId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call the database function to get or create share
    const { data, error } = await supabaseClient.rpc('get_or_create_share', {
      p_set_id: setId,
      p_user_id: user.id,
      p_is_public: isPublic,
      p_expires_in_days: expiresInDays || null,
    });

    if (error) {
      console.error('Error creating share:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // data is an array with one result
    const shareData = data[0];

    if (!shareData) {
      return new Response(JSON.stringify({ error: 'Failed to create share' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch full share details
    const { data: fullShare, error: fetchError } = await supabaseClient
      .from('shared_sets')
      .select('*')
      .eq('share_code', shareData.share_code)
      .single();

    if (fetchError || !fullShare) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch share details' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response: ShareResponse = {
      shareId: fullShare.id,
      shareCode: fullShare.share_code,
      shareUrl: shareData.share_url,
      isNew: shareData.is_new,
      viewCount: fullShare.view_count,
      copyCount: fullShare.copy_count,
      createdAt: fullShare.created_at,
      expiresAt: fullShare.expires_at,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
