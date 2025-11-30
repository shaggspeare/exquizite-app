import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, retryOperation } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { WordSet, WordPair, ShareMetadata, ShareOptions, SharedSetDetails, CopySetResponse } from '@/lib/types';
import * as guestStorage from '@/lib/guestStorage';

interface SetsContextType {
  sets: WordSet[];
  isLoading: boolean;
  createSet: (name: string, words: WordPair[], targetLanguage: string, nativeLanguage: string) => Promise<WordSet | null>;
  updateSet: (id: string, name: string, words: WordPair[], targetLanguage: string, nativeLanguage: string) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  getSetById: (id: string) => WordSet | undefined;
  updateLastPracticed: (id: string) => Promise<void>;
  refreshSets: () => Promise<void>;
  migrateGuestSetsToUser: () => Promise<void>;
  // Sharing methods
  shareSet: (setId: string, options?: ShareOptions) => Promise<ShareMetadata | null>;
  getSharedSet: (shareCode: string) => Promise<SharedSetDetails | null>;
  copySharedSet: (shareCode: string, customName?: string) => Promise<WordSet | null>;
  deleteShare: (setId: string) => Promise<void>;
}

const SetsContext = createContext<SetsContextType | undefined>(undefined);

export function SetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sets, setSets] = useState<WordSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);

  useEffect(() => {
    if (user) {
      loadSets();

      // Automatically migrate guest data when user becomes authenticated (not a guest)
      if (!user.isGuest && !hasMigrated) {
        checkAndMigrateGuestData();
      }
    } else {
      setSets([]);
      setHasMigrated(false);
    }
  }, [user]);

  const checkAndMigrateGuestData = async () => {
    try {
      const hasGuest = await guestStorage.hasGuestData();
      if (hasGuest) {
        console.log('🔔 Guest data detected, starting automatic migration...');
        await migrateGuestSetsToUser();
        setHasMigrated(true);
      }
    } catch (error) {
      console.error('Error checking/migrating guest data:', error);
    }
  };

  // Helper function to determine if user is a guest
  const isGuestUser = (): boolean => {
    return user?.isGuest === true;
  };

  const loadSets = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // If guest user, load from local storage
      if (isGuestUser()) {
        console.log('📱 Loading guest sets from local storage...');
        const guestSets = await guestStorage.getGuestSets();
        setSets(guestSets);
        console.log(`✅ Loaded ${guestSets.length} guest sets`);
      } else {
        // Load from Supabase for authenticated users
        console.log('☁️ Loading sets from Supabase...');
        const { data: setsData, error: setsError } = await supabase
          .from('word_sets')
          .select(`
            *,
            word_pairs (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (setsError) throw setsError;

        // Transform database format to app format
        const transformedSets: WordSet[] = (setsData || []).map(set => ({
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

        setSets(transformedSets);
        console.log(`✅ Loaded ${transformedSets.length} sets from Supabase`);
      }
    } catch (error) {
      console.error('Error loading sets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSet = async (name: string, words: WordPair[], targetLanguage: string, nativeLanguage: string): Promise<WordSet | null> => {
    if (!user) {
      console.error('No user found when creating set');
      console.error('User state:', { user, hasUser: !!user });
      throw new Error('You must be signed in to create a set. Please sign in or continue as a guest.');
    }

    try {
      console.log('Creating set:', { name, wordCount: words.length, userId: user.id, isGuest: user.isGuest, targetLanguage, nativeLanguage });

      // If guest user, save to local storage
      if (isGuestUser()) {
        console.log('📱 Creating guest set in local storage...');
        const newSet = await guestStorage.createGuestSet(name, words, targetLanguage, nativeLanguage);
        setSets(prev => [newSet, ...prev]);
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
          console.error('Error creating word set:', JSON.stringify(setError, null, 2));
          console.error('Error details:', {
            message: setError.message,
            code: setError.code,
            details: setError.details,
            hint: setError.hint,
          });
          throw new Error(`Failed to create word set: ${setError.message || 'Unknown error'}`);
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
          console.error('Error creating word pairs:', JSON.stringify(pairsError, null, 2));
          console.error('Error details:', {
            message: pairsError.message,
            code: pairsError.code,
            details: pairsError.details,
            hint: pairsError.hint,
          });
          throw new Error(`Failed to create word pairs: ${pairsError.message || 'Unknown error'}`);
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

      // Update local state
      setSets(prev => [newSet, ...prev]);
      return newSet;
    } catch (error: any) {
      console.error('Error creating set - Full error:', error);
      console.error('Error creating set - Stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('Error creating set - Details:', {
        message: error?.message || 'No message',
        name: error?.name || 'No name',
        code: error?.code || 'No code',
        details: error?.details || 'No details',
        hint: error?.hint || 'No hint',
        stack: error?.stack || 'No stack',
      });

      // Show alert to user with error message
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      console.error('Final error message:', errorMessage);

      return null;
    }
  };

  const updateSet = async (id: string, name: string, words: WordPair[], targetLanguage: string, nativeLanguage: string) => {
    if (!user) {
      throw new Error('No user found when updating set');
    }

    try {
      console.log('Updating set:', { id, name, wordCount: words.length, targetLanguage, nativeLanguage });

      // If guest user, update in local storage
      if (isGuestUser()) {
        console.log('📱 Updating guest set in local storage...');
        await guestStorage.updateGuestSet(id, name, words, targetLanguage, nativeLanguage);
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
          throw new Error(`Failed to delete word pairs: ${deleteError.message}`);
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
          throw new Error(`Failed to insert word pairs: ${insertError.message}`);
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

    try {
      // If guest user, delete from local storage
      if (isGuestUser()) {
        console.log('📱 Deleting guest set from local storage...');
        await guestStorage.deleteGuestSet(id);
        setSets(prev => prev.filter(set => set.id !== id));
        console.log('✅ Guest set deleted successfully');
        return;
      }

      // Otherwise, delete from Supabase
      // Word pairs will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('word_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSets(prev => prev.filter(set => set.id !== id));
    } catch (error) {
      console.error('Error deleting set:', error);
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
            console.error(`Error migrating word pairs for ${guestSet.name}:`, pairsError);
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
  const shareSet = async (setId: string, options?: ShareOptions): Promise<ShareMetadata | null> => {
    if (!user) {
      console.error('User must be authenticated to share sets');
      return null;
    }

    // Guest users cannot share sets (only stored locally)
    if (isGuestUser()) {
      console.error('Guest users cannot share sets. Please sign up to share sets.');
      throw new Error('Please create an account to share sets with others.');
    }

    try {
      console.log('Sharing set:', { setId, options });

      const { data, error } = await supabase.functions.invoke('generate-share-link', {
        body: {
          setId,
          isPublic: options?.isPublic ?? true,
          expiresInDays: options?.expiresInDays,
        },
      });

      if (error) {
        console.error('Error generating share link:', error);
        throw error;
      }

      console.log('Share link generated successfully:', data);
      return data as ShareMetadata;
    } catch (error: any) {
      console.error('Error sharing set:', error);
      return null;
    }
  };

  const getSharedSet = async (shareCode: string): Promise<SharedSetDetails | null> => {
    try {
      console.log('Fetching shared set:', shareCode);

      const { data, error } = await supabase.functions.invoke('get-shared-set', {
        body: { shareCode },
      });

      if (error) {
        console.error('Error fetching shared set:', error);
        throw error;
      }

      console.log('Shared set fetched successfully:', data);
      return data as SharedSetDetails;
    } catch (error: any) {
      console.error('Error getting shared set:', error);
      return null;
    }
  };

  const copySharedSet = async (shareCode: string, customName?: string): Promise<WordSet | null> => {
    if (!user) {
      console.error('User must be authenticated to copy sets');
      return null;
    }

    // Guest users cannot copy shared sets (would need to save to Supabase)
    if (isGuestUser()) {
      console.error('Guest users cannot copy shared sets. Please sign up to copy sets.');
      throw new Error('Please create an account to copy shared sets.');
    }

    try {
      console.log('Copying shared set:', { shareCode, customName });

      const { data, error } = await supabase.functions.invoke('copy-shared-set', {
        body: {
          shareCode,
          customName,
        },
      });

      if (error) {
        console.error('Error copying shared set:', error);
        throw error;
      }

      console.log('Shared set copied successfully:', data);

      const response = data as CopySetResponse;

      // Reload sets to include the newly copied set
      await loadSets();

      // Return the newly created set
      return getSetById(response.setId) || null;
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

  return (
    <SetsContext.Provider
      value={{
        sets,
        isLoading,
        createSet,
        updateSet,
        deleteSet,
        getSetById,
        updateLastPracticed,
        refreshSets,
        migrateGuestSetsToUser,
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
