// Core type definitions for Exquizite app

export interface WordPair {
  id: string;
  word: string;
  translation: string;
}

export interface WordSet {
  id: string;
  name: string;
  words: WordPair[];
  targetLanguage: string;
  nativeLanguage: string;
  createdAt: string;
  updatedAt: string;
  lastPracticed?: string;
  isCopy?: boolean;
  isShareable?: boolean;
  originalAuthorId?: string;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  avatar?: string;
}

export interface GameResult {
  setId: string;
  gameType: 'flashcard' | 'match' | 'quiz';
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
}

export type GameMode = 'flashcard' | 'match' | 'quiz' | 'fill-blank';

// Legacy alias
export type GameType = 'flashcard' | 'match' | 'quiz';

// Practice Statistics Types
export interface PracticeSession {
  id: string;
  userId: string;
  setId: string;
  gameMode: GameMode;
  score?: number;
  completedAt: string;
}

export interface PracticeStats {
  totalCount: number;
  byMode: Record<GameMode, number>;
}

export interface SetPracticeStats {
  [setId: string]: PracticeStats;
}

export interface QuizQuestion {
  word: string;
  correctAnswer: string;
  options: string[];
}

export interface MatchPair {
  id: string;
  word: string;
  translation: string;
  isMatched: boolean;
}

// Sharing Feature Types

export interface SharedSet {
  id: string;
  setId: string;
  shareCode: string;
  isPublic: boolean;
  createdBy: string;
  viewCount: number;
  copyCount: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface ShareMetadata {
  shareId: string;
  shareCode: string;
  shareUrl: string;
  isNew: boolean;
  viewCount: number;
  copyCount: number;
  createdAt: string;
  expiresAt?: string;
}

export interface ShareOptions {
  isPublic?: boolean;
  expiresInDays?: number;
}

export interface SharedSetDetails {
  setId: string;
  name: string;
  targetLanguage: string;
  nativeLanguage: string;
  wordCount: number;
  words: WordPair[];
  shareInfo: {
    shareCode: string;
    viewCount: number;
    copyCount: number;
    createdAt: string;
    expiresAt?: string;
  };
  author: {
    name: string;
  };
}

export interface CopySetResponse {
  setId: string;
  name: string;
  wordCount: number;
  success: boolean;
}
