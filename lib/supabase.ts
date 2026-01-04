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

// Helper function to validate and refresh session if needed
export async function ensureValidSession(): Promise<boolean> {
  try {
    // Add timeout protection to prevent hanging on web
    const getSessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error('getSession timeout in ensureValidSession')), 5000)
    );

    const result = await Promise.race([getSessionPromise, timeoutPromise]).catch((error) => {
      if (error.message?.includes('timeout')) {
        console.warn('⚠️ getSession timed out in ensureValidSession, assuming session is valid');
        // If getSession hangs on web, it's likely because token was just refreshed
        // Return a special marker to skip validation
        return { data: { session: null }, error: null, timedOut: true };
      }
      return { data: { session: null }, error };
    });

    // If timed out, assume session is valid (likely just refreshed)
    if (result.timedOut) {
      return true;
    }

    const {
      data: { session },
      error,
    } = result;

    // If there's an error or no session, try to refresh
    if (error || !session) {
      console.log('No valid session, attempting refresh...');
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError || !refreshedSession) {
        console.error('Session refresh failed:', refreshError?.message);
        return false;
      }

      console.log('✅ Session refreshed successfully');
      return true;
    }

    // Check if token is close to expiration (within 5 minutes)
    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (expiresAt - now < fiveMinutes) {
        console.log('Token expiring soon, refreshing...');
        const {
          data: { session: refreshedSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          console.error('Proactive refresh failed:', refreshError?.message);
          return false;
        }

        console.log('✅ Session proactively refreshed');
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

// Helper function to retry operations on network failure or transient errors
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
      const isNetworkError =
        error?.message?.includes('Network request failed') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('ETIMEDOUT') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('ENOTFOUND') ||
        error?.code === 'NETWORK_ERROR' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'ECONNREFUSED';

      // Only retry on network errors and transient errors
      if (isNetworkError && attempt < maxRetries) {
        console.log(
          `Network error on attempt ${attempt + 1}, retrying in ${delayMs}ms...`
        );
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
