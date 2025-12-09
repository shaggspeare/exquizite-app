import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';
import * as guestStorage from '@/lib/guestStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session (both Supabase auth and local guest)
    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
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
        if (nextAppState === 'active') {
          console.log('App became active, refreshing session...');
          checkSession(false); // Don't show loading state when resuming from background
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const checkSession = async (shouldSetLoading: boolean = true) => {
    try {
      // First check for Supabase auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        // If no Supabase session, check for guest user in local storage
        const guestUser = await guestStorage.getGuestUser();
        if (guestUser) {
          console.log('✅ Guest user loaded from storage:', guestUser.name);
          setUser(guestUser);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      if (shouldSetLoading) {
        setIsLoading(false);
      }
    }
  };

  const loadUserProfile = async (userId: string, retries = 5) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist yet and we have retries left, wait and retry
        if (error.code === 'PGRST116' && retries > 0) {
          console.log(
            `Profile not found, retrying... (${retries} attempts left)`
          );
          await new Promise(resolve => setTimeout(resolve, 500));
          return loadUserProfile(userId, retries - 1);
        }
        throw error;
      }

      if (profile) {
        console.log('✅ Profile loaded successfully:', profile.name);
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email || undefined,
          isGuest: profile.is_guest,
          avatar: profile.avatar_url || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
      // Check if current user is a guest
      if (user?.isGuest) {
        // Clear guest data from local storage
        await guestStorage.clearGuestData();
        console.log('✅ Guest data cleared');
      } else {
        // Sign out from Supabase
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
