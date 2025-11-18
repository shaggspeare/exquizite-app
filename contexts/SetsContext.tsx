import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { WordSet, WordPair } from '@/lib/types';

interface SetsContextType {
  sets: WordSet[];
  isLoading: boolean;
  createSet: (name: string, words: WordPair[]) => Promise<WordSet | null>;
  updateSet: (id: string, name: string, words: WordPair[]) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  getSetById: (id: string) => WordSet | undefined;
  updateLastPracticed: (id: string) => Promise<void>;
  refreshSets: () => Promise<void>;
}

const SetsContext = createContext<SetsContextType | undefined>(undefined);

export function SetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sets, setSets] = useState<WordSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSets();
    } else {
      setSets([]);
    }
  }, [user]);

  const loadSets = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch word sets with their word pairs
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
        createdAt: set.created_at,
        updatedAt: set.updated_at,
        lastPracticed: set.last_practiced || undefined,
      }));

      setSets(transformedSets);
    } catch (error) {
      console.error('Error loading sets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSet = async (name: string, words: WordPair[]): Promise<WordSet | null> => {
    if (!user) return null;

    try {
      // Create the word set
      const { data: setData, error: setError } = await supabase
        .from('word_sets')
        .insert({
          user_id: user.id,
          name,
        })
        .select()
        .single();

      if (setError) throw setError;

      // Create word pairs
      const wordPairsToInsert = words.map((word, index) => ({
        set_id: setData.id,
        word: word.word,
        translation: word.translation,
        position: index,
      }));

      const { data: pairsData, error: pairsError } = await supabase
        .from('word_pairs')
        .insert(wordPairsToInsert)
        .select();

      if (pairsError) throw pairsError;

      // Create the new set object
      const newSet: WordSet = {
        id: setData.id,
        name: setData.name,
        words: (pairsData || []).map(pair => ({
          id: pair.id,
          word: pair.word,
          translation: pair.translation,
        })),
        createdAt: setData.created_at,
        updatedAt: setData.updated_at,
        lastPracticed: undefined,
      };

      // Update local state
      setSets(prev => [newSet, ...prev]);
      return newSet;
    } catch (error) {
      console.error('Error creating set:', error);
      return null;
    }
  };

  const updateSet = async (id: string, name: string, words: WordPair[]) => {
    if (!user) return;

    try {
      // Update the word set
      const { error: setError } = await supabase
        .from('word_sets')
        .update({ name })
        .eq('id', id);

      if (setError) throw setError;

      // Delete existing word pairs
      const { error: deleteError } = await supabase
        .from('word_pairs')
        .delete()
        .eq('set_id', id);

      if (deleteError) throw deleteError;

      // Insert new word pairs
      const wordPairsToInsert = words.map((word, index) => ({
        set_id: id,
        word: word.word,
        translation: word.translation,
        position: index,
      }));

      const { error: insertError } = await supabase
        .from('word_pairs')
        .insert(wordPairsToInsert);

      if (insertError) throw insertError;

      // Reload sets to get updated data
      await loadSets();
    } catch (error) {
      console.error('Error updating set:', error);
    }
  };

  const deleteSet = async (id: string) => {
    if (!user) return;

    try {
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
