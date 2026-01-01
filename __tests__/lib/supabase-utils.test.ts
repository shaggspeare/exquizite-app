// Mock the config module before importing supabase
jest.mock('../../lib/config', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
    },
  },
}));

// Mock the storage module
jest.mock('../../lib/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import { retryOperation } from '../../lib/supabase';

describe('supabase utilities', () => {
  describe('retryOperation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns result on first successful attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const promise = retryOperation(operation);
      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on network error and succeeds', async () => {
      const networkError = new Error('Network request failed');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce('success');

      const promise = retryOperation(operation);

      // First attempt fails
      await jest.advanceTimersByTimeAsync(0);

      // Wait for retry delay
      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('retries on Failed to fetch error', async () => {
      const fetchError = new Error('Failed to fetch');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(fetchError)
        .mockResolvedValueOnce('success');

      const promise = retryOperation(operation);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('retries on NETWORK_ERROR code', async () => {
      const error = { message: 'Something', code: 'NETWORK_ERROR' };
      const operation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const promise = retryOperation(operation);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('throws immediately on non-network error', async () => {
      const authError = new Error('Authentication failed');
      const operation = jest.fn().mockRejectedValue(authError);

      await expect(retryOperation(operation)).rejects.toThrow('Authentication failed');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('exhausts retries and throws', async () => {
      jest.useRealTimers(); // Use real timers for this test
      const networkError = new Error('Network request failed');
      const operation = jest.fn().mockRejectedValue(networkError);

      await expect(retryOperation(operation, 2, 10)).rejects.toThrow('Network request failed');
      expect(operation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('uses custom retry count', async () => {
      jest.useRealTimers(); // Use real timers for this test
      const networkError = new Error('Network request failed');
      const operation = jest.fn().mockRejectedValue(networkError);

      await expect(retryOperation(operation, 1, 10)).rejects.toThrow('Network request failed');
      expect(operation).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
    });

    it('uses custom delay', async () => {
      const networkError = new Error('Network request failed');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce('success');

      const promise = retryOperation(operation, 2, 2000);

      // First attempt
      await jest.advanceTimersByTimeAsync(0);

      // Should not have retried yet
      expect(operation).toHaveBeenCalledTimes(1);

      // Wait for custom delay
      await jest.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('handles async operation that returns undefined', async () => {
      const operation = jest.fn().mockResolvedValue(undefined);

      const result = await retryOperation(operation);

      expect(result).toBeUndefined();
    });

    it('preserves error message from last failed attempt', async () => {
      jest.useRealTimers(); // Use real timers for this test
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockRejectedValueOnce(new Error('Final network error'));

      await expect(retryOperation(operation, 2, 10)).rejects.toThrow('Final network error');
    });
  });
});
