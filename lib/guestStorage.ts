// Guest data storage service
// Stores guest user data and sets locally (localStorage on web, SecureStore on native)

import { storage } from './storage';
import { User, WordSet, WordPair } from './types';

const GUEST_USER_KEY = 'exquizite_guest_user';
const GUEST_SETS_KEY = 'exquizite_guest_sets';

// Generate a unique guest email
export function generateGuestEmail(): string {
  const uuid = generateUUID();
  return `guest_${uuid}@exquizite.local`;
}

// Generate a simple UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Guest User Management

export async function createGuestUser(name: string = 'Guest'): Promise<User> {
  const guestUser: User = {
    id: generateUUID(),
    name,
    email: generateGuestEmail(),
    isGuest: true,
  };

  await storage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
}

export async function getGuestUser(): Promise<User | null> {
  try {
    const data = await storage.getItem(GUEST_USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading guest user:', error);
    return null;
  }
}

export async function updateGuestUser(user: Partial<User>): Promise<void> {
  const currentUser = await getGuestUser();
  if (!currentUser) {
    throw new Error('No guest user found');
  }

  const updatedUser = { ...currentUser, ...user };
  await storage.setItem(GUEST_USER_KEY, JSON.stringify(updatedUser));
}

export async function deleteGuestUser(): Promise<void> {
  await storage.removeItem(GUEST_USER_KEY);
}

// Guest Sets Management

export async function getGuestSets(): Promise<WordSet[]> {
  try {
    const data = await storage.getItem(GUEST_SETS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading guest sets:', error);
    return [];
  }
}

export async function createGuestSet(
  name: string,
  words: WordPair[],
  targetLanguage: string,
  nativeLanguage: string
): Promise<WordSet> {
  const sets = await getGuestSets();

  const newSet: WordSet = {
    id: generateUUID(),
    name,
    words,
    targetLanguage,
    nativeLanguage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sets.unshift(newSet); // Add to beginning
  await storage.setItem(GUEST_SETS_KEY, JSON.stringify(sets));

  return newSet;
}

export async function updateGuestSet(
  id: string,
  name: string,
  words: WordPair[],
  targetLanguage: string,
  nativeLanguage: string
): Promise<void> {
  const sets = await getGuestSets();
  const setIndex = sets.findIndex(s => s.id === id);

  if (setIndex === -1) {
    throw new Error('Set not found');
  }

  sets[setIndex] = {
    ...sets[setIndex],
    name,
    words,
    targetLanguage,
    nativeLanguage,
    updatedAt: new Date().toISOString(),
  };

  await storage.setItem(GUEST_SETS_KEY, JSON.stringify(sets));
}

export async function deleteGuestSet(id: string): Promise<void> {
  const sets = await getGuestSets();
  const filteredSets = sets.filter(s => s.id !== id);
  await storage.setItem(GUEST_SETS_KEY, JSON.stringify(filteredSets));
}

export async function updateGuestSetLastPracticed(id: string): Promise<void> {
  const sets = await getGuestSets();
  const setIndex = sets.findIndex(s => s.id === id);

  if (setIndex === -1) {
    throw new Error('Set not found');
  }

  sets[setIndex] = {
    ...sets[setIndex],
    lastPracticed: new Date().toISOString(),
  };

  await storage.setItem(GUEST_SETS_KEY, JSON.stringify(sets));
}

export async function getGuestSetById(id: string): Promise<WordSet | null> {
  const sets = await getGuestSets();
  return sets.find(s => s.id === id) || null;
}

// Clear all guest data
export async function clearGuestData(): Promise<void> {
  await deleteGuestUser();
  await storage.removeItem(GUEST_SETS_KEY);
}

// Check if user has any guest data
export async function hasGuestData(): Promise<boolean> {
  const user = await getGuestUser();
  const sets = await getGuestSets();
  return user !== null || sets.length > 0;
}
