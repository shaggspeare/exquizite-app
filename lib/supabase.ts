// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { storage } from './storage';

// Create Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-client-info': 'exquizite-app',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      timeout: 20000, // 20 seconds timeout for realtime connections
    },
  }
);

// Helper function to retry operations on network failure
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isNetworkError = error?.message?.includes('Network request failed') ||
                            error?.message?.includes('Failed to fetch') ||
                            error?.code === 'NETWORK_ERROR';

      // Only retry on network errors
      if (isNetworkError && attempt < maxRetries) {
        console.log(`Network error on attempt ${attempt + 1}, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      // If it's not a network error or we've exhausted retries, throw
      throw error;
    }
  }

  throw lastError;
}

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          is_guest: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name: string;
          is_guest?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          is_guest?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      word_sets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
          last_practiced: string | null;
          is_shareable: boolean;
          original_author_id: string | null;
          is_copy: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          last_practiced?: string | null;
          is_shareable?: boolean;
          original_author_id?: string | null;
          is_copy?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          last_practiced?: string | null;
          is_shareable?: boolean;
          original_author_id?: string | null;
          is_copy?: boolean;
        };
      };
      word_pairs: {
        Row: {
          id: string;
          set_id: string;
          word: string;
          translation: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          set_id: string;
          word: string;
          translation: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          set_id?: string;
          word?: string;
          translation?: string;
          position?: number;
          created_at?: string;
        };
      };
      shared_sets: {
        Row: {
          id: string;
          set_id: string;
          share_code: string;
          is_public: boolean;
          created_by: string;
          view_count: number;
          copy_count: number;
          created_at: string;
          expires_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          set_id: string;
          share_code: string;
          is_public?: boolean;
          created_by: string;
          view_count?: number;
          copy_count?: number;
          created_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          set_id?: string;
          share_code?: string;
          is_public?: boolean;
          created_by?: string;
          view_count?: number;
          copy_count?: number;
          created_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      set_copies: {
        Row: {
          id: string;
          original_set_id: string | null;
          copied_set_id: string;
          copied_by: string | null;
          shared_via_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          original_set_id?: string | null;
          copied_set_id: string;
          copied_by?: string | null;
          shared_via_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          original_set_id?: string | null;
          copied_set_id?: string;
          copied_by?: string | null;
          shared_via_code?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
