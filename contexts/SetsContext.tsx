import { createContext, useContext, useState, ReactNode } from 'react';
import { WordSet, WordPair } from '@/lib/types';

interface SetsContextType {
  sets: WordSet[];
  createSet: (name: string, words: WordPair[]) => WordSet;
  updateSet: (id: string, name: string, words: WordPair[]) => void;
  deleteSet: (id: string) => void;
  getSetById: (id: string) => WordSet | undefined;
  updateLastPracticed: (id: string) => void;
}

const SetsContext = createContext<SetsContextType | undefined>(undefined);

export function SetsProvider({ children }: { children: ReactNode }) {
  const [sets, setSets] = useState<WordSet[]>([]);

  const createSet = (name: string, words: WordPair[]): WordSet => {
    const newSet: WordSet = {
      id: Date.now().toString(),
      name,
      words,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSets(prev => [...prev, newSet]);
    return newSet;
  };

  const updateSet = (id: string, name: string, words: WordPair[]) => {
    setSets(prev =>
      prev.map(set =>
        set.id === id
          ? { ...set, name, words, updatedAt: new Date().toISOString() }
          : set
      )
    );
  };

  const deleteSet = (id: string) => {
    setSets(prev => prev.filter(set => set.id !== id));
  };

  const getSetById = (id: string): WordSet | undefined => {
    return sets.find(set => set.id === id);
  };

  const updateLastPracticed = (id: string) => {
    setSets(prev =>
      prev.map(set =>
        set.id === id
          ? { ...set, lastPracticed: new Date().toISOString() }
          : set
      )
    );
  };

  return (
    <SetsContext.Provider
      value={{
        sets,
        createSet,
        updateSet,
        deleteSet,
        getSetById,
        updateLastPracticed,
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
