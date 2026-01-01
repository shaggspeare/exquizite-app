import { Platform, Dimensions } from 'react-native';

// Mock react-native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 1024, height: 768 })),
  },
}));

// Import after mocks
import { isDesktopWeb, isMobileWeb, isNative } from '../../lib/platform-utils';

describe('platform-utils', () => {
  // Store original values
  let originalWindow: typeof globalThis.window;
  let originalNavigator: typeof globalThis.navigator;

  beforeEach(() => {
    // Save originals
    originalWindow = global.window;
    originalNavigator = global.navigator;
    // Reset to default values
    (Platform as any).OS = 'web';
    (Dimensions.get as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
    global.window = {} as any;
    global.navigator = { maxTouchPoints: 0, userAgent: 'Mozilla/5.0' } as any;
  });

  afterEach(() => {
    // Restore originals
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  describe('isDesktopWeb', () => {
    it('returns false for non-web platform', () => {
      (Platform as any).OS = 'ios';
      expect(isDesktopWeb()).toBe(false);
    });

    it('returns false when window is undefined', () => {
      (Platform as any).OS = 'web';
      // @ts-ignore
      delete global.window;
      expect(isDesktopWeb()).toBe(false);
    });

    it('returns false for mobile width (< 768)', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });
      global.window = {} as any;
      global.navigator = { maxTouchPoints: 0, userAgent: 'Mozilla/5.0' } as any;
      expect(isDesktopWeb()).toBe(false);
    });

    it('returns true for desktop with no touch support', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
      global.window = {} as any;
      global.navigator = {
        maxTouchPoints: 0,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      } as any;
      expect(isDesktopWeb()).toBe(true);
    });

    it('returns false for touch device with mobile user agent', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
      global.window = { ontouchstart: true } as any;
      global.navigator = {
        maxTouchPoints: 5,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      } as any;
      expect(isDesktopWeb()).toBe(false);
    });

    it('returns true for touch-enabled desktop (like Surface)', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
      global.window = { ontouchstart: true } as any;
      global.navigator = {
        maxTouchPoints: 10,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      } as any;
      expect(isDesktopWeb()).toBe(true);
    });
  });

  describe('isMobileWeb', () => {
    it('returns false for non-web platform', () => {
      (Platform as any).OS = 'android';
      expect(isMobileWeb()).toBe(false);
    });

    it('returns true when isDesktopWeb returns false on web', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });
      global.window = {} as any;
      global.navigator = { maxTouchPoints: 0, userAgent: 'Mozilla/5.0' } as any;
      expect(isMobileWeb()).toBe(true);
    });

    it('returns false when isDesktopWeb returns true', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
      global.window = {} as any;
      global.navigator = {
        maxTouchPoints: 0,
        userAgent: 'Mozilla/5.0 (Macintosh)',
      } as any;
      expect(isMobileWeb()).toBe(false);
    });
  });

  describe('isNative', () => {
    it('returns true for iOS', () => {
      (Platform as any).OS = 'ios';
      expect(isNative()).toBe(true);
    });

    it('returns true for Android', () => {
      (Platform as any).OS = 'android';
      expect(isNative()).toBe(true);
    });

    it('returns false for web', () => {
      (Platform as any).OS = 'web';
      expect(isNative()).toBe(false);
    });
  });
});
