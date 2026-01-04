import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as guestStorage from '@/lib/guestStorage';
import { storage } from '@/lib/storage';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/guestStorage');
jest.mock('@/lib/storage');
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

describe('AuthContext - Session Management', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    isGuest: false,
    avatarUrl: null,
  };

  const mockSession = {
    user: { id: 'test-user-id' },
    access_token: 'test-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
  };

  const mockProfile = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    is_guest: false,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (storage.getItem as jest.Mock).mockResolvedValue(null);
    (storage.setItem as jest.Mock).mockResolvedValue(undefined);
    (storage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (guestStorage.getGuestUser as jest.Mock).mockResolvedValue(null);
    (guestStorage.hasGuestData as jest.Mock).mockResolvedValue(false);
  });

  describe('Token Refresh Handling', () => {
    it('should store session from TOKEN_REFRESHED event', async () => {
      let authStateCallback: any;

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate TOKEN_REFRESHED event
      await act(async () => {
        await authStateCallback('TOKEN_REFRESHED', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should use cached profile when session times out', async () => {
      const cachedProfile = JSON.stringify(mockUser);
      (storage.getItem as jest.Mock).mockResolvedValue(cachedProfile);

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(() => {
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      // Simulate getSession timing out
      (supabase.auth.getSession as jest.Mock).mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      }, { timeout: 3000 });
    });

    it('should handle SIGNED_OUT with cached profile fallback', async () => {
      let authStateCallback: any;
      const cachedProfile = JSON.stringify(mockUser);

      (storage.getItem as jest.Mock).mockResolvedValue(cachedProfile);

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate automatic SIGNED_OUT (not manual)
      await act(async () => {
        await authStateCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        // Should use cached profile instead of signing out
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should clear user on manual sign out', async () => {
      let authStateCallback: any;

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Manually sign out
      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(storage.removeItem).toHaveBeenCalledWith('cached_user_profile');
    });
  });

  describe('Profile Caching', () => {
    it('should cache user profile after successful load', async () => {
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(() => {
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(
          'cached_user_profile',
          expect.stringContaining(mockUser.id)
        );
      });
    });

    it('should load cached profile immediately on mount', async () => {
      const cachedProfile = JSON.stringify(mockUser);
      (storage.getItem as jest.Mock).mockResolvedValue(cachedProfile);

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(() => {
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Should have user from cache almost immediately
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      }, { timeout: 500 });
    });
  });

  describe('Guest User Handling', () => {
    it('should load guest user when no Supabase session exists', async () => {
      const mockGuestUser = {
        id: 'guest-id',
        name: 'Guest User',
        isGuest: true,
        avatarUrl: null,
      };

      (guestStorage.getGuestUser as jest.Mock).mockResolvedValue(mockGuestUser);

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(() => {
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockGuestUser);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear guest data on guest sign out', async () => {
      const mockGuestUser = {
        id: 'guest-id',
        name: 'Guest User',
        isGuest: true,
        avatarUrl: null,
      };

      (guestStorage.getGuestUser as jest.Mock).mockResolvedValue(mockGuestUser);
      (guestStorage.clearGuestData as jest.Mock).mockResolvedValue(undefined);

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(() => {
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockGuestUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(guestStorage.clearGuestData).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });
});
