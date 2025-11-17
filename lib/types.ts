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
  createdAt: string;
  updatedAt: string;
  lastPracticed?: string;
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

export type GameType = 'flashcard' | 'match' | 'quiz';

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
