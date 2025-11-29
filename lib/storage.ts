// Platform-aware storage utility
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Platform-aware storage adapter
 * - Web: uses localStorage
 * - Native (iOS/Android): uses expo-secure-store (encrypted)
 */
export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } else {
      // Native platforms
      return await SecureStore.getItemAsync(key);
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } else {
      // Native platforms
      await SecureStore.setItemAsync(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } else {
      // Native platforms
      await SecureStore.deleteItemAsync(key);
    }
  },
};
