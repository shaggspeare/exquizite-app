import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { supabase, retryOperation } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
  WordSet,
  WordPair,
  ShareMetadata,
  ShareOptions,
  SharedSetDetails,
  CopySetResponse,
  GameMode,
  PracticeStats,
} from '@/lib/types';
import * as guestStorage from '@/lib/guestStorage';
import featuredSetsData from '@/data/featuredSets.json';

interface SetsContextType {
  sets: WordSet[];
  isLoading: boolean;
  practiceStats: Record<string, PracticeStats>;
  createSet: (
    name: string,
    words: WordPair[],
    targetLanguage: string,
    nativeLanguage: string
  ) => Promise<WordSet | null>;
  updateSet: (
    id: string,
    name: string,
    words: WordPair[],
    targetLanguage: string,
    nativeLanguage: string
  ) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  getSetById: (id: string) => WordSet | undefined;
  updateLastPracticed: (id: string) => Promise<void>;
  refreshSets: () => Promise<void>;
  migrateGuestSetsToUser: () => Promise<void>;
  // Practice tracking methods
  recordPracticeSession: (
    setId: string,
    gameMode: GameMode,
    score?: number
  ) => Promise<void>;
  getPracticeStats: (setId: string) => PracticeStats;
  // Sharing methods
  shareSet: (
    setId: string,
    options?: ShareOptions
  ) => Promise<ShareMetadata | null>;
  getSharedSet: (shareCode: string) => Promise<SharedSetDetails | null>;
  copySharedSet: (
    shareCode: string,
    customName?: string
  ) => Promise<WordSet | null>;
  deleteShare: (setId: string) => Promise<void>;
}

const SetsContext = createContext<SetsContextType | undefined>(undefined);

// Helper function to select 3 featured sets based on user's languages
function selectFeaturedSets(
  targetLanguage: string,
  nativeLanguage: string
): WordSet[] {
  console.log(
    '🎯 Selecting featured sets for languages:',
    targetLanguage,
    '→',
    nativeLanguage
  );

  // Type for the featured sets data structure
  type FeaturedSetsData = {
    [theme: string]: {
      theme: string;
      concepts: Array<{
        id: string;
        translations: { [langCode: string]: string };
      }>;
    };
  };

  const data = featuredSetsData as FeaturedSetsData;
  const themes = ['greetings', 'food', 'travel'];

  const featuredSets: WordSet[] = themes
    .map(theme => {
      const themeData = data[theme];
      if (!themeData) {
        console.warn(`⚠️ Theme '${theme}' not found in featured sets data`);
        return null;
      }

      // Generate word pairs by getting translations for target and native languages
      const wordPairs: WordPair[] = themeData.concepts.map(concept => {
        const targetWord = concept.translations[targetLanguage];
        const nativeWord = concept.translations[nativeLanguage];

        // Fallback to English if language not found
        const fallbackTarget = targetWord || concept.translations['en'] || '';
        const fallbackNative = nativeWord || concept.translations['en'] || '';

        return {
          id: concept.id,
          word: fallbackTarget,
          translation: fallbackNative,
        };
      });

      // Capitalize theme name for display
      const displayName = theme.charAt(0).toUpperCase() + theme.slice(1);

      const set: WordSet = {
        id: `featured-${theme}-${targetLanguage}`,
        name: displayName,
        words: wordPairs,
        targetLanguage,
        nativeLanguage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFeatured: true,
      };

      return set;
    })
    .filter((set): set is WordSet => set !== null);

  console.log(
    `✅ Generated ${featuredSets.length} featured sets for ${targetLanguage} → ${nativeLanguage}`
  );

  return featuredSets;
}

export function SetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { preferences } = useLanguage();
  const [sets, setSets] = useState<WordSet[]>([]);
  // Start with isLoading true - we'll set it to false once we know there's nothing to load
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);
  const isMigratingRef = useRef(false);
  const [practiceStats, setPracticeStats] = useState<Record<string, PracticeStats>>({});

  // Track previous values to detect actual changes and prevent unnecessary reloads
  const prevUserIdRef = useRef<string | null>(null);
  const prevIsConfiguredRef = useRef<boolean>(false);
  const prevTargetLanguageRef = useRef<string>('');
  const hasLoadedRef = useRef<boolean>(false);

  // Track cold start retry attempts
  const coldStartRetryRef = useRef<boolean>(false);
  const coldStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track when sets loading started (for radical refresh approach on web)
  const setsLoadStartTimeRef = useRef<number>(0);
  const forceRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start loading sets as soon as we have a user
    // The force-refresh mechanism will handle any auth issues
    if (user) {
      // Determine what changed
      const userChanged = prevUserIdRef.current !== user.id;
      const isConfiguredChanged = prevIsConfiguredRef.current !== preferences.isConfigured && preferences.isConfigured;
      const targetLanguageChanged = prevTargetLanguageRef.current !== preferences.targetLanguage && !!preferences.targetLanguage;

      // Update refs BEFORE determining shouldLoad to avoid stale comparisons
      const wasFirstLoad = !hasLoadedRef.current;

      // Update tracking refs
      prevUserIdRef.current = user.id;
      prevIsConfiguredRef.current = preferences.isConfigured;
      prevTargetLanguageRef.current = preferences.targetLanguage;

      // Load sets if:
      // 1. User changed (new login) - reset loaded flag too
      // 2. isConfigured just became true (completed language setup)
      // 3. targetLanguage changed (to update featured sets)
      // 4. First load for this user (haven't loaded yet)
      if (userChanged) {
        hasLoadedRef.current = false; // Reset on user change
      }

      const shouldLoad = userChanged || isConfiguredChanged || targetLanguageChanged || wasFirstLoad;

      if (shouldLoad) {
        console.log('🔄 Loading sets:', {
          userChanged,
          isConfiguredChanged,
          targetLanguageChanged,
          wasFirstLoad,
          userId: user.id,
          isConfigured: preferences.isConfigured,
          targetLanguage: preferences.targetLanguage
        });
        hasLoadedRef.current = true;
        loadSets();
      }

      // Automatically migrate guest data when user becomes authenticated (not a guest)
      if (!user.isGuest && !hasMigrated) {
        checkAndMigrateGuestData();
      }
    } else {
      setSets([]);
      setIsLoading(false); // No user means nothing to load
      setHasMigrated(false);
      isMigratingRef.current = false;
      // Reset refs when user logs out
      prevUserIdRef.current = null;
      prevIsConfiguredRef.current = false;
      prevTargetLanguageRef.current = '';
      hasLoadedRef.current = false;
      // Clear cold start timeout
      coldStartRetryRef.current = false;
      if (coldStartTimeoutRef.current) {
        clearTimeout(coldStartTimeoutRef.current);
        coldStartTimeoutRef.current = null;
      }
    }

    // Cleanup timeouts on unmount
    return () => {
      if (coldStartTimeoutRef.current) {
        clearTimeout(coldStartTimeoutRef.current);
        coldStartTimeoutRef.current = null;
      }
      if (forceRefreshTimeoutRef.current) {
        clearInterval(forceRefreshTimeoutRef.current);
        forceRefreshTimeoutRef.current = null;
      }
    };
    // Note: loadSets, checkAndMigrateGuestData, and hasMigrated are intentionally excluded
    // to prevent infinite loops - these functions/values change on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, preferences.isConfigured, preferences.targetLanguage]);

  const checkAndMigrateGuestData = async () => {
    // Prevent concurrent migrations
    if (isMigratingRef.current) {
      console.log('⏭️ Migration already in progress, skipping...');
      return;
    }

    try {
      const hasGuest = await guestStorage.hasGuestData();
      if (hasGuest) {
        console.log('🔔 Guest data detected, starting automatic migration...');
        isMigratingRef.current = true;
        await migrateGuestSetsToUser();
        setHasMigrated(true);
        isMigratingRef.current = false;
      }
    } catch (error) {
      console.error('Error checking/migrating guest data:', error);
      isMigratingRef.current = false;
    }
  };

  // Helper function to determine if user is a guest
  const isGuestUser = (): boolean => {
    return user?.isGuest === true;
  };

  const loadSets = async (isColdStartRetry: boolean = false) => {
    if (!user) return;

    // Always show loading state during sets fetch
    // This ensures users see a loader during session recreation
    setIsLoading(true);

    try {
      let userSets: WordSet[] = [];

      // If guest user, load from local storage
      if (isGuestUser()) {
        console.log('📱 Loading guest sets from local storage...');
        const guestSets = await guestStorage.getGuestSets();
        userSets = guestSets;
        console.log(`✅ Loaded ${guestSets.length} guest sets`);
      } else {
        // Load from Supabase for authenticated users
        console.log(`☁️ Loading sets from Supabase for user: ${user.id} ${isColdStartRetry ? '(Cold start retry)' : ''}`);

        // RADICAL APPROACH: On web, if sets don't load within 1 second, force page refresh
        // Use setInterval instead of setTimeout to avoid timer throttling in background tabs
        if (Platform.OS === 'web' && !isColdStartRetry) {
          // Clear any existing interval first
          if (forceRefreshTimeoutRef.current) {
            clearInterval(forceRefreshTimeoutRef.current);
            forceRefreshTimeoutRef.current = null;
          }

          setsLoadStartTimeRef.current = Date.now();
          const intervalId = setInterval(() => {
            const elapsed = Date.now() - setsLoadStartTimeRef.current;
            if (elapsed >= 1000) {
              console.warn(`⚠️ TIMEOUT! Sets failed to load within 1 second (${elapsed}ms) - forcing page refresh NOW`);
              clearInterval(intervalId);
              // Keep loading state visible during reload for better UX
              // The page will refresh before this matters, but good practice
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }
          }, 100); // Check every 100ms
          forceRefreshTimeoutRef.current = intervalId as any;
          console.log('⏱️ Starting 1-second check interval for sets loading... Interval ID:', intervalId);
        }

        // Simply query - Supabase client handles auth internally
        // RLS policies ensure we only get this user's sets
        const { data: setsData, error: setsError } = await retryOperation(async () => {
          return await supabase
            .from('word_sets')
            .select(
              `
              *,
              word_pairs (*)
            `
            )
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        });

        // Cancel the force refresh interval if we got here successfully
        if (forceRefreshTimeoutRef.current) {
          const elapsed = Date.now() - setsLoadStartTimeRef.current;
          console.log(`✅ Sets loaded in ${elapsed}ms - cancelling force refresh interval`);
          clearInterval(forceRefreshTimeoutRef.current);
          forceRefreshTimeoutRef.current = null;
        }

        if (setsError) {
          console.error('🔴 Error loading sets from Supabase:', setsError);
          // Check if it's an authentication error
          const isAuthError =
            setsError.message?.includes('JWT') ||
            setsError.message?.includes('expired') ||
            setsError.message?.includes('invalid') ||
            setsError.code === 'PGRST301';

          if (isAuthError) {
            console.error('🔴 Authentication error detected when loading sets');
            console.error('Error details:', setsError);
            // Don't sign out here - AuthContext will handle session refresh
            // Just throw error to trigger retry logic
            throw new Error('Authentication error - will retry after session refresh');
          }

          throw setsError;
        }

        console.log(`✅ Successfully loaded ${setsData?.length || 0} sets from Supabase`);

        // Transform database format to app format
        userSets = (setsData || []).map(set => ({
          id: set.id,
          name: set.name,
          words: (set.word_pairs || [])
            .sort((a: any, b: any) => a.position - b.position)
            .map((pair: any) => ({
              id: pair.id,
              word: pair.word,
              translation: pair.translation,
            })),
          targetLanguage: set.target_language || 'uk',
          nativeLanguage: set.native_language || 'en',
          createdAt: set.created_at,
          updatedAt: set.updated_at,
          lastPracticed: set.last_practiced || undefined,
          isCopy: set.is_copy || false,
          isShareable: set.is_shareable !== false,
          originalAuthorId: set.original_author_id || undefined,
        }));

        console.log(`✅ Loaded ${userSets.length} sets from Supabase`);
      }

      // Always show featured sets for all users when both languages are set
      if (preferences.targetLanguage && preferences.nativeLanguage) {
        console.log('🎯 Adding featured sets...');
        const featured = selectFeaturedSets(
          preferences.targetLanguage,
          preferences.nativeLanguage
        );
        // Combine user sets and featured sets (user sets first)
        setSets([...userSets, ...featured]);
        console.log(`✅ Added ${featured.length} featured sets`);
      } else {
        setSets(userSets);
      }

      // Clear cold start retry flag on successful load
      coldStartRetryRef.current = false;
      if (coldStartTimeoutRef.current) {
        clearTimeout(coldStartTimeoutRef.current);
        coldStartTimeoutRef.current = null;
      }

      // Detect if we got empty data when we should have user info
      // This indicates a potential cold start issue
      if (!isGuestUser() && preferences.isConfigured && userSets.length === 0 && !isColdStartRetry && !coldStartRetryRef.current) {
        console.log('⚠️ Detected potential cold start - no sets loaded for configured user. Scheduling retry in 4 seconds...');
        coldStartRetryRef.current = true;

        coldStartTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Executing cold start retry...');
          loadSets(true);
        }, 4000);
      }
    } catch (error) {
      console.error('Error loading sets:', error);

      // If this wasn't a retry and we haven't retried yet, schedule a retry
      if (!isColdStartRetry && !coldStartRetryRef.current && !isGuestUser()) {
        console.log('⚠️ Error loading sets, scheduling cold start retry in 4 seconds...');
        coldStartRetryRef.current = true;

        coldStartTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Executing cold start retry after error...');
          loadSets(true);
        }, 4000);
      } else {
        // On final error, just log it - don't sign out the user
        // AuthContext will handle session management
        console.error('🔴 Error loading sets after retry - keeping user logged in');
      }
    } finally {
      // Don't set loading to false if we're scheduling a retry
      if (!coldStartRetryRef.current || isColdStartRetry) {
        setIsLoading(false);
      }
    }
  };

  const createSet = async (
    name: string,
    words: WordPair[],
    targetLanguage: string,
    nativeLanguage: string
  ): Promise<WordSet | null> => {
    if (!user) {
      console.error('No user found when creating set');
      console.error('User state:', { user, hasUser: !!user });
      throw new Error(
        'You must be signed in to create a set. Please sign in or continue as a guest.'
      );
    }

    try {
      console.log('Creating set:', {
        name,
        wordCount: words.length,
        userId: user.id,
        isGuest: user.isGuest,
        targetLanguage,
        nativeLanguage,
      });

      // If guest user, save to local storage
      if (isGuestUser()) {
        console.log('📱 Creating guest set in local storage...');
        const newSet = await guestStorage.createGuestSet(
          name,
          words,
          targetLanguage,
          nativeLanguage
        );

        // For guest users, keep featured sets and add new set at the top
        setSets(prev => {
          // Separate user sets from featured sets
          const userSets = prev.filter(s => !s.isFeatured);
          const featuredSets = prev.filter(s => s.isFeatured);
          // Add new set at the top, followed by other user sets, then featured sets
          return [newSet, ...userSets, ...featuredSets];
        });

        console.log('✅ Guest set created successfully');
        return newSet;
      }

      // Otherwise, save to Supabase

      // Create the word set with retry logic
      const setData = await retryOperation(async () => {
        const { data, error: setError } = await supabase
          .from('word_sets')
          .insert({
            user_id: user.id,
            name,
            target_language: targetLanguage,
            native_language: nativeLanguage,
          })
          .select()
          .single();

        if (setError) {
          console.error(
            'Error creating word set:',
            JSON.stringify(setError, null, 2)
          );
          console.error('Error details:', {
            message: setError.message,
            code: setError.code,
            details: setError.details,
            hint: setError.hint,
          });
          throw new Error(
            `Failed to create word set: ${setError.message || 'Unknown error'}`
          );
        }

        return data;
      });

      console.log('Set created successfully:', setData);

      // Create word pairs with retry logic
      const wordPairsToInsert = words.map((word, index) => ({
        set_id: setData.id,
        word: word.word,
        translation: word.translation,
        position: index,
      }));

      console.log('Inserting word pairs:', wordPairsToInsert.length);

      const pairsData = await retryOperation(async () => {
        const { data, error: pairsError } = await supabase
          .from('word_pairs')
          .insert(wordPairsToInsert)
          .select();

        if (pairsError) {
          console.error(
            'Error creating word pairs:',
            JSON.stringify(pairsError, null, 2)
          );
          console.error('Error details:', {
            message: pairsError.message,
            code: pairsError.code,
            details: pairsError.details,
            hint: pairsError.hint,
          });
          throw new Error(
            `Failed to create word pairs: ${pairsError.message || 'Unknown error'}`
          );
        }

        return data;
      });

      console.log('Word pairs created successfully:', pairsData?.length);

      // Create the new set object
      const newSet: WordSet = {
        id: setData.id,
        name: setData.name,
        words: (pairsData || []).map(pair => ({
          id: pair.id,
          word: pair.word,
          translation: pair.translation,
        })),
        targetLanguage: setData.target_language,
        nativeLanguage: setData.native_language,
        createdAt: setData.created_at,
        updatedAt: setData.updated_at,
        lastPracticed: undefined,
      };

      // Update local state - add new set and keep featured sets
      setSets(prev => {
        // Separate user sets from featured sets
        const userSets = prev.filter(set => !set.isFeatured);
        const featuredSets = prev.filter(set => set.isFeatured);
        // Add new set at the top, followed by other user sets, then featured sets
        return [newSet, ...userSets, ...featuredSets];
      });

      return newSet;
    } catch (error: any) {
      console.error('Error creating set - Full error:', error);
      console.error(
        'Error creating set - Stringified:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      );
      console.error('Error creating set - Details:', {
        message: error?.message || 'No message',
        name: error?.name || 'No name',
        code: error?.code || 'No code',
        details: error?.details || 'No details',
        hint: error?.hint || 'No hint',
        stack: error?.stack || 'No stack',
      });

      // Show alert to user with error message
      const errorMessage =
        error?.message || error?.toString() || 'Unknown error occurred';
      console.error('Final error message:', errorMessage);

      return null;
    }
  };

  const updateSet = async (
    id: string,
    name: string,
    words: WordPair[],
    targetLanguage: string,
    nativeLanguage: string
  ) => {
    if (!user) {
      throw new Error('No user found when updating set');
    }

    // Prevent editing featured sets
    const setToUpdate = sets.find(set => set.id === id);
    if (setToUpdate?.isFeatured) {
      throw new Error(
        'Featured sets cannot be edited. Please create your own set instead.'
      );
    }

    try {
      console.log('Updating set:', {
        id,
        name,
        wordCount: words.length,
        targetLanguage,
        nativeLanguage,
      });

      // If guest user, update in local storage
      if (isGuestUser()) {
        console.log('📱 Updating guest set in local storage...');
        await guestStorage.updateGuestSet(
          id,
          name,
          words,
          targetLanguage,
          nativeLanguage
        );
        await loadSets(); // Reload to get updated data
        console.log('✅ Guest set updated successfully');
        return;
      }

      // Otherwise, update in Supabase

      // Update the word set with retry logic
      await retryOperation(async () => {
        const { error: setError } = await supabase
          .from('word_sets')
          .update({
            name,
            target_language: targetLanguage,
            native_language: nativeLanguage,
          })
          .eq('id', id);

        if (setError) {
          console.error('Error updating word set:', setError);
          throw new Error(`Failed to update word set: ${setError.message}`);
        }
      });

      // Delete existing word pairs with retry logic
      await retryOperation(async () => {
        const { error: deleteError } = await supabase
          .from('word_pairs')
          .delete()
          .eq('set_id', id);

        if (deleteError) {
          console.error('Error deleting word pairs:', deleteError);
          throw new Error(
            `Failed to delete word pairs: ${deleteError.message}`
          );
        }
      });

      // Insert new word pairs with retry logic
      const wordPairsToInsert = words.map((word, index) => ({
        set_id: id,
        word: word.word,
        translation: word.translation,
        position: index,
      }));

      await retryOperation(async () => {
        const { error: insertError } = await supabase
          .from('word_pairs')
          .insert(wordPairsToInsert);

        if (insertError) {
          console.error('Error inserting word pairs:', insertError);
          throw new Error(
            `Failed to insert word pairs: ${insertError.message}`
          );
        }
      });

      console.log('Set updated successfully');

      // Reload sets to get updated data
      await loadSets();
    } catch (error: any) {
      console.error('Error updating set:', error);
      // Re-throw the error so the calling code can handle it
      throw error;
    }
  };

  const deleteSet = async (id: string) => {
    if (!user) return;

    // Prevent deleting featured sets
    const setToDelete = sets.find(set => set.id === id);
    if (setToDelete?.isFeatured) {
      throw new Error('Featured sets cannot be deleted.');
    }

    try {
      // If guest user, delete from local storage
      if (isGuestUser()) {
        console.log('📱 Deleting guest set from local storage...');
        await guestStorage.deleteGuestSet(id);
        setSets(prev => prev.filter(set => set.id !== id));
        console.log('✅ Guest set deleted successfully');
        return;
      }

      // Delete from Supabase
      // Word pairs will be deleted automatically due to CASCADE
      // Include user_id filter as safety measure (RLS also enforces this)
      const { error, count } = await retryOperation(async () => {
        return await supabase
          .from('word_sets')
          .delete({ count: 'exact' })
          .eq('id', id)
          .eq('user_id', user.id);
      });

      if (error) {
        console.error('Error deleting set:', error);
        throw new Error(`Failed to delete set: ${error.message}`);
      }

      // Verify that a row was actually deleted
      if (count === 0) {
        console.error('🔴 Delete returned 0 rows - set may not exist or user lacks permission');
        throw new Error('Failed to delete set. Please try again.');
      }

      console.log('✅ Set deleted successfully');

      // Update local state
      setSets(prev => prev.filter(set => set.id !== id));
    } catch (error: any) {
      console.error('Error deleting set:', error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  const getSetById = (id: string): WordSet | undefined => {
    return sets.find(set => set.id === id);
  };

  const updateLastPracticed = async (id: string) => {
    if (!user) return;

    try {
      // If guest user, update in local storage
      if (isGuestUser()) {
        await guestStorage.updateGuestSetLastPracticed(id);
        setSets(prev =>
          prev.map(set =>
            set.id === id
              ? { ...set, lastPracticed: new Date().toISOString() }
              : set
          )
        );
        return;
      }

      // Otherwise, update in Supabase
      const { error } = await supabase
        .from('word_sets')
        .update({ last_practiced: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSets(prev =>
        prev.map(set =>
          set.id === id
            ? { ...set, lastPracticed: new Date().toISOString() }
            : set
        )
      );
    } catch (error) {
      console.error('Error updating last practiced:', error);
    }
  };

  const refreshSets = async () => {
    await loadSets();
  };

  const migrateGuestSetsToUser = async () => {
    // Migrate guest sets from local storage to Supabase
    if (!user || user.isGuest) {
      console.log('⚠️ Cannot migrate: not authenticated as real user');
      return;
    }

    try {
      console.log('🔵 Starting migration of guest sets to Supabase...');

      // Get guest sets from local storage
      const guestSets = await guestStorage.getGuestSets();

      if (guestSets.length === 0) {
        console.log('No guest sets to migrate');
        await guestStorage.clearGuestData();
        return;
      }

      console.log(`📦 Migrating ${guestSets.length} guest sets...`);

      // Create each guest set in Supabase
      for (const guestSet of guestSets) {
        console.log(`Migrating set: ${guestSet.name}`);

        // Create the word set
        const { data: setData, error: setError } = await supabase
          .from('word_sets')
          .insert({
            user_id: user.id,
            name: guestSet.name,
            target_language: guestSet.targetLanguage,
            native_language: guestSet.nativeLanguage,
          })
          .select()
          .single();

        if (setError) {
          console.error(`Error migrating set ${guestSet.name}:`, setError);
          continue; // Skip this set and continue with others
        }

        // Create word pairs
        if (guestSet.words.length > 0) {
          const wordPairsToInsert = guestSet.words.map((word, index) => ({
            set_id: setData.id,
            word: word.word,
            translation: word.translation,
            position: index,
          }));

          const { error: pairsError } = await supabase
            .from('word_pairs')
            .insert(wordPairsToInsert);

          if (pairsError) {
            console.error(
              `Error migrating word pairs for ${guestSet.name}:`,
              pairsError
            );
          }
        }

        console.log(`✅ Migrated set: ${guestSet.name}`);
      }

      // Clear guest data after successful migration
      await guestStorage.clearGuestData();
      console.log('✅ Guest data migration completed and local data cleared');

      // Reload sets from Supabase
      await loadSets();
    } catch (error) {
      console.error('❌ Error during migration:', error);
      throw error;
    }
  };

  // Sharing methods
  const shareSet = async (
    setId: string,
    options?: ShareOptions
  ): Promise<ShareMetadata | null> => {
    if (!user) {
      console.error('User must be authenticated to share sets');
      return null;
    }

    // Guest users cannot share sets (only stored locally)
    if (isGuestUser()) {
      console.error(
        'Guest users cannot share sets. Please sign up to share sets.'
      );
      throw new Error('Please create an account to share sets with others.');
    }

    // Prevent sharing featured sets
    const setToShare = sets.find(set => set.id === setId);
    if (setToShare?.isFeatured) {
      throw new Error(
        'Featured sets cannot be shared. Please create your own set instead.'
      );
    }

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error('Share link generation timed out after 30 seconds')
            ),
          30000
        );
      });

      const invokePromise = supabase.functions.invoke('generate-share-link', {
        body: {
          setId,
          isPublic: options?.isPublic ?? true,
          expiresInDays: options?.expiresInDays,
        },
      });

      const { data, error } = (await Promise.race([
        invokePromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.error('Error generating share link:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from share function');
      }

      return data as ShareMetadata;
    } catch (error: any) {
      console.error('Error sharing set:', error);
      return null;
    }
  };

  const getSharedSet = async (
    shareCode: string
  ): Promise<SharedSetDetails | null> => {
    try {
      console.log('Fetching shared set:', shareCode);

      const { data, error } = await supabase.functions.invoke(
        'get-shared-set',
        {
          body: { shareCode },
        }
      );

      if (error) {
        console.error('Error fetching shared set:', error);
        throw error;
      }

      console.log('Shared set fetched successfully:', data);
      console.log('Word count:', data?.wordCount);
      console.log('Words array length:', data?.words?.length);
      console.log('First few words:', data?.words?.slice(0, 3));
      return data as SharedSetDetails;
    } catch (error: any) {
      console.error('Error getting shared set:', error);
      return null;
    }
  };

  const copySharedSet = async (
    shareCode: string,
    customName?: string
  ): Promise<WordSet | null> => {
    if (!user) {
      console.error('User must be authenticated to copy sets');
      return null;
    }

    // Guest users cannot copy shared sets (would need to save to Supabase)
    if (isGuestUser()) {
      console.error(
        'Guest users cannot copy shared sets. Please sign up to copy sets.'
      );
      throw new Error('Please create an account to copy shared sets.');
    }

    try {
      console.log('Copying shared set:', { shareCode, customName });

      const { data, error } = await supabase.functions.invoke(
        'copy-shared-set',
        {
          body: {
            shareCode,
            customName,
          },
        }
      );

      if (error) {
        console.error('Error copying shared set:', error);
        throw error;
      }

      console.log('Shared set copied successfully:', data);

      const response = data as CopySetResponse;

      // Fetch the newly created set with its word pairs directly from database
      const { data: newSetData, error: fetchError } = await supabase
        .from('word_sets')
        .select(
          `
          *,
          word_pairs (*)
        `
        )
        .eq('id', response.setId)
        .single();

      if (fetchError || !newSetData) {
        console.error('Error fetching newly copied set:', fetchError);
        // Reload all sets as fallback
        await loadSets();
        return getSetById(response.setId) || null;
      }

      // Transform to WordSet format
      const copiedSet: WordSet = {
        id: newSetData.id,
        name: newSetData.name,
        words: (newSetData.word_pairs || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((pair: any) => ({
            id: pair.id,
            word: pair.word,
            translation: pair.translation,
          })),
        targetLanguage: newSetData.target_language || 'uk',
        nativeLanguage: newSetData.native_language || 'en',
        createdAt: newSetData.created_at,
        updatedAt: newSetData.updated_at,
        lastPracticed: newSetData.last_practiced || undefined,
      };

      // Reload sets in background to update the list
      loadSets();

      return copiedSet;
    } catch (error: any) {
      console.error('Error copying shared set:', error);
      return null;
    }
  };

  const deleteShare = async (setId: string): Promise<void> => {
    if (!user) {
      console.error('User must be authenticated to delete shares');
      return;
    }

    // Guest users don't have shares to delete
    if (isGuestUser()) {
      console.error('Guest users cannot delete shares');
      return;
    }

    try {
      console.log('Deleting share for set:', setId);

      // Deactivate the share by updating is_active to false
      const { error } = await supabase
        .from('shared_sets')
        .update({ is_active: false })
        .eq('set_id', setId)
        .eq('created_by', user.id);

      if (error) {
        console.error('Error deleting share:', error);
        throw error;
      }

      console.log('Share deleted successfully');
    } catch (error: any) {
      console.error('Error deleting share:', error);
      throw error;
    }
  };

  // Practice tracking methods

  const loadPracticeStats = async () => {
    if (!user) return;

    try {
      if (isGuestUser()) {
        // Load from local storage for guest users
        const stats = await guestStorage.getAllGuestPracticeStats();
        setPracticeStats(stats);
      } else {
        // Load from Supabase for authenticated users
        const { data, error } = await supabase
          .from('practice_sessions')
          .select('set_id, game_mode')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading practice stats:', error);
          return;
        }

        // Aggregate stats by set
        const stats: Record<string, PracticeStats> = {};
        for (const session of data || []) {
          if (!stats[session.set_id]) {
            stats[session.set_id] = {
              totalCount: 0,
              byMode: {
                flashcard: 0,
                match: 0,
                quiz: 0,
                'fill-blank': 0,
              },
            };
          }
          stats[session.set_id].totalCount++;
          stats[session.set_id].byMode[session.game_mode as GameMode]++;
        }

        setPracticeStats(stats);
      }
    } catch (error) {
      console.error('Error loading practice stats:', error);
    }
  };

  const recordPracticeSession = async (
    setId: string,
    gameMode: GameMode,
    score?: number
  ): Promise<void> => {
    if (!user) return;

    try {
      if (isGuestUser()) {
        // Save to local storage for guest users
        await guestStorage.recordGuestPracticeSession(setId, gameMode, score);
      } else {
        // Save to Supabase for authenticated users
        const { error } = await supabase.from('practice_sessions').insert({
          user_id: user.id,
          set_id: setId,
          game_mode: gameMode,
          score,
        });

        if (error) {
          console.error('Error recording practice session:', error);
          throw error;
        }
      }

      // Update local state
      setPracticeStats(prev => {
        const current = prev[setId] || {
          totalCount: 0,
          byMode: { flashcard: 0, match: 0, quiz: 0, 'fill-blank': 0 },
        };
        return {
          ...prev,
          [setId]: {
            totalCount: current.totalCount + 1,
            byMode: {
              ...current.byMode,
              [gameMode]: current.byMode[gameMode] + 1,
            },
          },
        };
      });

      console.log(`✅ Recorded practice session: ${gameMode} for set ${setId}`);
    } catch (error) {
      console.error('Error recording practice session:', error);
    }
  };

  const getPracticeStats = (setId: string): PracticeStats => {
    return (
      practiceStats[setId] || {
        totalCount: 0,
        byMode: { flashcard: 0, match: 0, quiz: 0, 'fill-blank': 0 },
      }
    );
  };

  // Load practice stats when sets are loaded
  useEffect(() => {
    if (user && sets.length > 0) {
      loadPracticeStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sets.length]);

  return (
    <SetsContext.Provider
      value={{
        sets,
        isLoading,
        practiceStats,
        createSet,
        updateSet,
        deleteSet,
        getSetById,
        updateLastPracticed,
        refreshSets,
        migrateGuestSetsToUser,
        recordPracticeSession,
        getPracticeStats,
        shareSet,
        getSharedSet,
        copySharedSet,
        deleteShare,
      }}
    >
      {children}
    </SetsContext.Provider>
  );
}

export function useSets() {
  const context = useContext(SetsContext);
  if (context === undefined) {
    throw new Error('useSets must be used within a SetsProvider');
  }
  return context;
}
