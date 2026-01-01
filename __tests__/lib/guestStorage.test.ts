import {
  generateGuestEmail,
  createGuestUser,
  getGuestUser,
  updateGuestUser,
  deleteGuestUser,
  getGuestSets,
  createGuestSet,
  updateGuestSet,
  deleteGuestSet,
  updateGuestSetLastPracticed,
  getGuestSetById,
  clearGuestData,
  hasGuestData,
} from '../../lib/guestStorage';
import { storage } from '../../lib/storage';

// Mock the storage module
jest.mock('../../lib/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockedStorage = storage as jest.Mocked<typeof storage>;

describe('guestStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGuestEmail', () => {
    it('generates email with correct format', () => {
      const email = generateGuestEmail();
      expect(email).toMatch(/^guest_[a-f0-9-]+@exquizite\.local$/);
    });

    it('generates unique emails', () => {
      const email1 = generateGuestEmail();
      const email2 = generateGuestEmail();
      expect(email1).not.toBe(email2);
    });
  });

  describe('createGuestUser', () => {
    it('creates guest user with default name', async () => {
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      const user = await createGuestUser();

      expect(user.name).toBe('Guest');
      expect(user.isGuest).toBe(true);
      expect(user.email).toMatch(/^guest_.*@exquizite\.local$/);
      expect(user.id).toBeDefined();
      expect(mockedStorage.setItem).toHaveBeenCalledWith(
        'exquizite_guest_user',
        expect.any(String)
      );
    });

    it('creates guest user with custom name', async () => {
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      const user = await createGuestUser('John');

      expect(user.name).toBe('John');
      expect(user.isGuest).toBe(true);
    });
  });

  describe('getGuestUser', () => {
    it('returns null when no user exists', async () => {
      mockedStorage.getItem.mockResolvedValueOnce(null);

      const user = await getGuestUser();

      expect(user).toBeNull();
    });

    it('returns parsed user when exists', async () => {
      const storedUser = { id: '123', name: 'Test', email: 'test@test.com', isGuest: true };
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(storedUser));

      const user = await getGuestUser();

      expect(user).toEqual(storedUser);
    });

    it('returns null on parse error', async () => {
      mockedStorage.getItem.mockResolvedValueOnce('invalid json');

      const user = await getGuestUser();

      expect(user).toBeNull();
    });
  });

  describe('updateGuestUser', () => {
    it('updates existing guest user', async () => {
      const storedUser = { id: '123', name: 'Test', email: 'test@test.com', isGuest: true };
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(storedUser));
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      await updateGuestUser({ name: 'Updated' });

      expect(mockedStorage.setItem).toHaveBeenCalledWith(
        'exquizite_guest_user',
        expect.stringContaining('"name":"Updated"')
      );
    });

    it('throws error when no user exists', async () => {
      mockedStorage.getItem.mockResolvedValueOnce(null);

      await expect(updateGuestUser({ name: 'Test' })).rejects.toThrow('No guest user found');
    });
  });

  describe('deleteGuestUser', () => {
    it('removes guest user from storage', async () => {
      mockedStorage.removeItem.mockResolvedValueOnce(undefined);

      await deleteGuestUser();

      expect(mockedStorage.removeItem).toHaveBeenCalledWith('exquizite_guest_user');
    });
  });

  describe('getGuestSets', () => {
    it('returns empty array when no sets exist', async () => {
      mockedStorage.getItem.mockResolvedValueOnce(null);

      const sets = await getGuestSets();

      expect(sets).toEqual([]);
    });

    it('returns parsed sets when exist', async () => {
      const storedSets = [
        { id: '1', name: 'Set 1', words: [], targetLanguage: 'es', nativeLanguage: 'en' },
      ];
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(storedSets));

      const sets = await getGuestSets();

      expect(sets).toEqual(storedSets);
    });

    it('returns empty array on parse error', async () => {
      mockedStorage.getItem.mockResolvedValueOnce('invalid json');

      const sets = await getGuestSets();

      expect(sets).toEqual([]);
    });
  });

  describe('createGuestSet', () => {
    it('creates new set and adds to beginning of array', async () => {
      const existingSets = [{ id: 'old', name: 'Old Set', words: [], targetLanguage: 'es', nativeLanguage: 'en' }];
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingSets));
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      const words = [{ id: '1', word: 'hello', translation: 'hola' }];
      const newSet = await createGuestSet('New Set', words, 'es', 'en');

      expect(newSet.name).toBe('New Set');
      expect(newSet.words).toEqual(words);
      expect(newSet.targetLanguage).toBe('es');
      expect(newSet.nativeLanguage).toBe('en');
      expect(newSet.id).toBeDefined();
      expect(newSet.createdAt).toBeDefined();
      expect(newSet.updatedAt).toBeDefined();

      // Check that new set is at the beginning
      const savedData = JSON.parse(mockedStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].name).toBe('New Set');
      expect(savedData[1].name).toBe('Old Set');
    });

    it('creates set when no existing sets', async () => {
      mockedStorage.getItem.mockResolvedValueOnce(null);
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      const newSet = await createGuestSet('First Set', [], 'fr', 'en');

      expect(newSet.name).toBe('First Set');
    });
  });

  describe('updateGuestSet', () => {
    it('updates existing set', async () => {
      const existingSets = [
        { id: '1', name: 'Set 1', words: [], targetLanguage: 'es', nativeLanguage: 'en', createdAt: '2023-01-01' },
      ];
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingSets));
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      const newWords = [{ id: 'w1', word: 'cat', translation: 'gato' }];
      await updateGuestSet('1', 'Updated Name', newWords, 'de', 'en');

      const savedData = JSON.parse(mockedStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].name).toBe('Updated Name');
      expect(savedData[0].words).toEqual(newWords);
      expect(savedData[0].targetLanguage).toBe('de');
      expect(savedData[0].createdAt).toBe('2023-01-01'); // preserved
      expect(savedData[0].updatedAt).toBeDefined();
    });

    it('throws error when set not found', async () => {
      mockedStorage.getItem.mockResolvedValueOnce('[]');

      await expect(updateGuestSet('nonexistent', 'Name', [], 'es', 'en')).rejects.toThrow(
        'Set not found'
      );
    });
  });

  describe('deleteGuestSet', () => {
    it('removes set from storage', async () => {
      const existingSets = [
        { id: '1', name: 'Set 1' },
        { id: '2', name: 'Set 2' },
      ];
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingSets));
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      await deleteGuestSet('1');

      const savedData = JSON.parse(mockedStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });
  });

  describe('updateGuestSetLastPracticed', () => {
    it('updates lastPracticed timestamp', async () => {
      const existingSets = [{ id: '1', name: 'Set 1' }];
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingSets));
      mockedStorage.setItem.mockResolvedValueOnce(undefined);

      await updateGuestSetLastPracticed('1');

      const savedData = JSON.parse(mockedStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].lastPracticed).toBeDefined();
      expect(new Date(savedData[0].lastPracticed)).toBeInstanceOf(Date);
    });

    it('throws error when set not found', async () => {
      mockedStorage.getItem.mockResolvedValueOnce('[]');

      await expect(updateGuestSetLastPracticed('nonexistent')).rejects.toThrow('Set not found');
    });
  });

  describe('getGuestSetById', () => {
    it('returns set when found', async () => {
      const existingSets = [
        { id: '1', name: 'Set 1' },
        { id: '2', name: 'Set 2' },
      ];
      mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingSets));

      const set = await getGuestSetById('2');

      expect(set).toEqual({ id: '2', name: 'Set 2' });
    });

    it('returns null when not found', async () => {
      mockedStorage.getItem.mockResolvedValueOnce('[]');

      const set = await getGuestSetById('nonexistent');

      expect(set).toBeNull();
    });
  });

  describe('clearGuestData', () => {
    it('removes both user and sets data', async () => {
      mockedStorage.removeItem.mockResolvedValue(undefined);

      await clearGuestData();

      expect(mockedStorage.removeItem).toHaveBeenCalledWith('exquizite_guest_user');
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('exquizite_guest_sets');
    });
  });

  describe('hasGuestData', () => {
    it('returns true when user exists', async () => {
      mockedStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({ id: '1', name: 'Guest' }))
        .mockResolvedValueOnce('[]');

      const result = await hasGuestData();

      expect(result).toBe(true);
    });

    it('returns true when sets exist', async () => {
      mockedStorage.getItem
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(JSON.stringify([{ id: '1' }]));

      const result = await hasGuestData();

      expect(result).toBe(true);
    });

    it('returns false when no guest data', async () => {
      mockedStorage.getItem.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      const result = await hasGuestData();

      expect(result).toBe(false);
    });
  });
});
