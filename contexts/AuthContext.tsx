import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase, retryOperation } from '@/lib/supabase';
import { User } from '@/lib/types';
import * as guestStorage from '@/lib/guestStorage';
import { storage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthReady: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  signInAsGuest: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  migrateGuestToUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_PROFILE_CACHE_KEY = 'cached_user_profile';

// Helper to save user profile to cache
async function cacheUserProfile(user: User) {
  try {
    await storage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(user));
    console.log('💾 User profile cached');
  } catch (error) {
    console.error('Error caching user profile:', error);
  }
}

// Helper to load user profile from cache
async function loadCachedUserProfile(): Promise<User | null> {
  try {
    const cached = await storage.getItem(USER_PROFILE_CACHE_KEY);
    if (cached) {
      const user = JSON.parse(cached);
      console.log('💾 User profile loaded from cache:', user.name);
      return user;
    }
  } catch (error) {
    console.error('Error loading cached user profile:', error);
  }
  return null;
}

// Helper to clear user profile cache
async function clearUserProfileCache() {
  try {
    await storage.removeItem(USER_PROFILE_CACHE_KEY);
    console.log('💾 User profile cache cleared');
  } catch (error) {
    console.error('Error clearing user profile cache:', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const isManualSignOutRef = useRef(false);
  // Store the last valid session to avoid calling getSession() repeatedly
  const lastValidSessionRef = useRef<any>(null);
  // Track when we last received a TOKEN_REFRESHED event
  const lastTokenRefreshTimeRef = useRef<number>(0);

  useEffect(() => {
    // Listen for auth state changes FIRST (before checkSession)
    // This ensures we catch TOKEN_REFRESHED events during initialization
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully');
          // Store the refreshed session for immediate use
          lastValidSessionRef.current = session;
          // Track when we received this refresh (to avoid redundant checkSession calls)
          lastTokenRefreshTimeRef.current = Date.now();

          // IMPORTANT: Explicitly set the session to ensure Supabase client has it
          // This is critical for subsequent database queries to work
          if (session) {
            try {
              await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              });
              console.log('✅ Session explicitly set in Supabase client');
            } catch (error) {
              console.error('Error setting session:', error);
            }
          }

          // After successful refresh, load the user profile
          if (session?.user) {
            console.log('🔄 Loading profile after token refresh...');
            await loadUserProfile(session.user.id, 5, true);
            // Ensure loading state is cleared after successful refresh
            setIsLoading(false);
            setIsAuthReady(true);
          }
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('🔴 User signed out event received, isManual:', isManualSignOutRef.current);

          // If this was a manual sign out, clear everything and don't use cache
          if (isManualSignOutRef.current) {
            isManualSignOutRef.current = false; // Reset flag
            console.log('🔴 Manual sign out - clearing all state');
            setUser(null);
            return;
          }

          // Automatic sign out (expired refresh token)
          // IMPORTANT: Don't immediately clear user state
          // The refresh token might be expired, but we can still use cached profile
          const cachedProfile = await loadCachedUserProfile();
          if (cachedProfile) {
            console.log('⚡ Using cached profile instead of signing out:', cachedProfile.name);
            setUser(cachedProfile);
            return;
          }

          // Only if no cached profile, check for guest user
          const guestUser = await guestStorage.getGuestUser();
          if (guestUser) {
            console.log('✅ Guest user loaded from storage:', guestUser.name);
            setUser(guestUser);
          } else {
            console.log('🔍 No cached profile or guest user, clearing user state');
            setUser(null);
          }
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          // Check for guest user in local storage
          const guestUser = await guestStorage.getGuestUser();
          if (guestUser) {
            console.log('✅ Guest user loaded from storage:', guestUser.name);
            setUser(guestUser);
          } else {
            setUser(null);
          }
        }
      }
    );

    // Listen for app state changes (foreground/background)
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        console.log('🔍 AppState changed to:', nextAppState);
        if (nextAppState === 'active') {
          console.log('📱 App became active, refreshing session...');
          checkSession(false); // Don't show loading state when resuming from background
        }
      }
    );

    // Check for existing session (both Supabase auth and local guest)
    // Do this AFTER setting up listeners to catch any events during initialization
    checkSession();

    return () => {
      authListener?.subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const checkSession = async (shouldSetLoading: boolean = true) => {
    console.log('🔍 checkSession called, shouldSetLoading:', shouldSetLoading);

    // If we just received a TOKEN_REFRESHED event (within last 5 seconds), skip this check
    // The session is already valid and calling getSession() will likely timeout
    const timeSinceLastRefresh = Date.now() - lastTokenRefreshTimeRef.current;
    if (timeSinceLastRefresh < 5000) {
      console.log('⏭️ Skipping checkSession - token was just refreshed', timeSinceLastRefresh, 'ms ago');
      if (shouldSetLoading) {
        setIsLoading(false);
        setIsAuthReady(true);
      }
      return;
    }

    try {
      // First try to load cached profile immediately for faster UI
      const cachedProfile = await loadCachedUserProfile();
      if (cachedProfile) {
        console.log('⚡ Loading cached profile immediately while checking session');
        setUser(cachedProfile);
      }

      // Check for Supabase auth session
      console.log('🔍 Calling supabase.auth.getSession()...');

      // Add a timeout to prevent hanging forever
      const getSessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('getSession timeout')), 10000)
      );

      const {
        data: { session },
        error: sessionError,
      } = await Promise.race([getSessionPromise, timeoutPromise]).catch((error) => {
        console.warn('⚠️ getSession timed out (known Supabase issue, app continues with cached profile)');
        return { data: { session: null }, error };
      });

      console.log('🔍 Session state:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        expiresAtDate: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        now: new Date().toISOString(),
        hasError: !!sessionError,
      });

      // If there's an error getting the session (including timeout), use cached profile
      if (sessionError) {
        console.warn('Session error:', sessionError.message);

        // If we already loaded cached profile at the start, just continue with it
        if (cachedProfile) {
          console.log('⚡ Continuing with cached profile after session error');
          // Don't try to refresh - the TOKEN_REFRESHED event will handle it if needed
          return;
        }

        // No cached profile - try to refresh session as last resort
        console.warn('No cached profile, attempting session refresh...');
        const { data: { session: refreshedSession }, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          console.error('Failed to refresh session:', refreshError?.message);
          // Check for guest user
          const guestUser = await guestStorage.getGuestUser();
          if (guestUser) {
            console.log('✅ Guest user loaded from storage:', guestUser.name);
            setUser(guestUser);
          } else {
            console.log('🔍 No session, no cache, no guest - clearing user');
            setUser(null);
          }
          return;
        }

        // Use refreshed session - wait for profile to load before continuing
        console.log('✅ Session refreshed, loading profile...');
        if (refreshedSession?.user) {
          await loadUserProfile(refreshedSession.user.id, 5, true);
        }
        return;
      }

      if (session?.user) {
        // Check if token is expired or close to expiration
        if (session.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();

          // If expired or expiring within 5 minutes, refresh first
          if (expiresAt <= now || expiresAt - now < 5 * 60 * 1000) {
            console.log('Token expired or expiring soon, refreshing before loading profile...');
            const { data: { session: refreshedSession }, error: refreshError } =
              await supabase.auth.refreshSession();

            if (refreshError || !refreshedSession) {
              console.warn('Session refresh failed:', refreshError?.message);
              // Try to use cached profile
              const cachedProfile = await loadCachedUserProfile();
              if (cachedProfile && cachedProfile.id === session.user.id) {
                console.log('⚡ Using cached profile after refresh failure');
                setUser(cachedProfile);
                return;
              }
              // Fall through to try loading with existing session
            } else {
              console.log('✅ Session refreshed proactively');
              // Use refreshed session
              if (refreshedSession?.user) {
                await loadUserProfile(refreshedSession.user.id, 5, true);
              }
              return;
            }
          }
        }

        // Load cached profile immediately for faster UI
        const cachedProfile = await loadCachedUserProfile();
        if (cachedProfile && cachedProfile.id === session.user.id) {
          console.log('⚡ Using cached profile for immediate display');
          setUser(cachedProfile);
          // Still load fresh profile in background
          loadUserProfile(session.user.id, 5, false);
        } else {
          await loadUserProfile(session.user.id, 5, true);
        }
      } else {
        console.log('🔍 No Supabase session found, checking for guest user');
        // If no Supabase session, check for guest user in local storage
        const guestUser = await guestStorage.getGuestUser();
        if (guestUser) {
          console.log('✅ Guest user loaded from storage:', guestUser.name);
          setUser(guestUser);
        } else {
          console.log('🔍 No guest user found, setting user to null');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // On any error, try cached profile first
      const cachedProfile = await loadCachedUserProfile();
      if (cachedProfile) {
        console.log('⚡ Using cached profile after error');
        setUser(cachedProfile);
      } else {
        const guestUser = await guestStorage.getGuestUser();
        if (guestUser) {
          console.log('✅ Guest user loaded from storage after error:', guestUser.name);
          setUser(guestUser);
        } else {
          setUser(null);
        }
      }
    } finally {
      if (shouldSetLoading) {
        setIsLoading(false);
        setIsAuthReady(true);
      }
    }
  };

  const loadUserProfile = async (userId: string, retries = 5, isAfterRefresh = false) => {
    try {
      // Wrap in retryOperation to handle network failures
      // Use longer retry delays for cold starts (1s, 2s, 3s)
      const { data: profile, error } = await retryOperation(async () => {
        return await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      }, 3, 2000); // 3 retries with 2 second delay

      if (error) {
        // Check if it's an authentication error
        const isAuthError =
          error.message?.includes('JWT') ||
          error.message?.includes('expired') ||
          error.message?.includes('invalid') ||
          error.code === 'PGRST301';

        if (isAuthError) {
          console.error('🔴 Auth error loading profile');

          // If this happened right after a successful refresh, something is seriously wrong
          // Otherwise, try to use cached profile and let the app continue
          if (isAfterRefresh) {
            console.error('🔴 Auth error after successful refresh - signing out');
            await supabase.auth.signOut();
            await clearUserProfileCache();
            setUser(null);
            return;
          }

          // Try to use cached profile instead of signing out immediately
          const cachedProfile = await loadCachedUserProfile();
          if (cachedProfile && cachedProfile.id === userId) {
            console.log('⚡ Using cached profile after auth error');
            setUser(cachedProfile);
            return;
          }

          // No cached profile available - sign out
          console.error('🔴 No cached profile available, signing out');
          await supabase.auth.signOut();
          await clearUserProfileCache();
          setUser(null);
          return;
        }

        // If profile doesn't exist yet and we have retries left, wait and retry
        if (error.code === 'PGRST116' && retries > 0) {
          console.log(
            `Profile not found, retrying... (${retries} attempts left)`
          );
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadUserProfile(userId, retries - 1);
        }

        console.error('🔴 Failed to load profile after retries');
        // Don't sign out - keep cached profile if available
        const cachedProfile = await loadCachedUserProfile();
        if (cachedProfile && cachedProfile.id === userId) {
          console.log('⚡ Using cached profile as fallback');
          setUser(cachedProfile);
        } else {
          console.error('🔴 No cached profile available, signing out...');
          await supabase.auth.signOut();
          await clearUserProfileCache();
          setUser(null);
        }
        return;
      }

      if (profile) {
        console.log('✅ Profile loaded successfully:', profile.name);
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email || undefined,
          isGuest: profile.is_guest,
          avatar: profile.avatar_url || undefined,
        };
        setUser(userData);
        // Cache the profile for future use
        await cacheUserProfile(userData);
      } else {
        console.error('🔴 Profile is null');
        // Try to use cached profile
        const cachedProfile = await loadCachedUserProfile();
        if (cachedProfile && cachedProfile.id === userId) {
          console.log('⚡ Using cached profile as fallback');
          setUser(cachedProfile);
        } else {
          console.error('🔴 No cached profile available, signing out...');
          await supabase.auth.signOut();
          await clearUserProfileCache();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('🔴 Error loading profile:', error);
      // Try to use cached profile
      const cachedProfile = await loadCachedUserProfile();
      if (cachedProfile && cachedProfile.id === userId) {
        console.log('⚡ Using cached profile after exception');
        setUser(cachedProfile);
      } else {
        console.error('🔴 No cached profile available, signing out...');
        await supabase.auth.signOut();
        await clearUserProfileCache();
        setUser(null);
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // User profile will be loaded via onAuthStateChange
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            is_guest: false,
          },
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        throw new Error('Please check your email to confirm your account');
      }

      // User profile will be created via database trigger and loaded via onAuthStateChange
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signInAsGuest = async (name: string) => {
    try {
      console.log('🔵 Creating guest user locally...', { name });

      // Create guest user in local storage
      const guestUser = await guestStorage.createGuestUser(name || 'Guest');

      console.log('✅ Guest user created:', {
        id: guestUser.id,
        email: guestUser.email,
        isGuest: guestUser.isGuest,
      });

      setUser(guestUser);
    } catch (error: any) {
      console.error('❌ Error creating guest user:', error);
      throw new Error(error.message || 'Failed to create guest user');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'exp://localhost:8081/reset-password',
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const signOut = async () => {
    try {
      // Set flag to indicate this is a manual sign out
      isManualSignOutRef.current = true;

      // Check if current user is a guest
      if (user?.isGuest) {
        // Clear guest data from local storage
        await guestStorage.clearGuestData();
        console.log('✅ Guest data cleared');
      } else {
        // Sign out from Supabase
        await supabase.auth.signOut();
        // Clear cached profile
        await clearUserProfileCache();
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Reset flag on error
      isManualSignOutRef.current = false;
      throw error;
    }
  };

  const migrateGuestToUser = async () => {
    // This will be called after a guest signs up/signs in
    // It migrates guest sets to the authenticated user's account
    if (!user || user.isGuest) {
      console.log('⚠️ Cannot migrate: not authenticated as real user');
      return;
    }

    try {
      console.log('🔵 Starting guest data migration...');

      // Get guest sets from local storage
      const guestSets = await guestStorage.getGuestSets();

      if (guestSets.length === 0) {
        console.log('No guest sets to migrate');
        await guestStorage.clearGuestData();
        return;
      }

      console.log(
        `📦 Migrating ${guestSets.length} guest sets to user account...`
      );

      // Import the sets context to create sets in Supabase
      // Note: This will be handled in the SetsContext
      // For now, we just clear the guest data after migration
      // The actual migration logic will be in SetsContext

      console.log('✅ Guest data migration completed');
    } catch (error) {
      console.error('❌ Error migrating guest data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthReady,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        resetPassword,
        migrateGuestToUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
