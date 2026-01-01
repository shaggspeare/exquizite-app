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

// Import after mocks are set up
import {
  Breakpoints,
  getWindowDimensions,
  isDesktop,
  isTablet,
  isMobile,
  getScreenType,
  responsive,
  MAX_CONTENT_WIDTH,
  MAX_NARROW_WIDTH,
} from '../../lib/responsive';

describe('responsive', () => {
  beforeEach(() => {
    (Platform as any).OS = 'web';
    (Dimensions.get as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
  });

  describe('Breakpoints', () => {
    it('has correct breakpoint values', () => {
      expect(Breakpoints.mobile).toBe(0);
      expect(Breakpoints.tablet).toBe(768);
      expect(Breakpoints.desktop).toBe(1024);
      expect(Breakpoints.wide).toBe(1440);
    });
  });

  describe('getWindowDimensions', () => {
    it('returns current window dimensions', () => {
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1200, height: 800 });

      const result = getWindowDimensions();

      expect(result).toEqual({ width: 1200, height: 800 });
    });
  });

  describe('isDesktop', () => {
    it('returns false for non-web platform', () => {
      (Platform as any).OS = 'ios';
      expect(isDesktop()).toBe(false);
    });

    it('returns true for width >= 1024 on web', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
      expect(isDesktop()).toBe(true);
    });

    it('returns true for wide screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
      expect(isDesktop()).toBe(true);
    });

    it('returns false for width < 1024 on web', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 800, height: 600 });
      expect(isDesktop()).toBe(false);
    });
  });

  describe('isTablet', () => {
    it('returns false for non-web platform', () => {
      (Platform as any).OS = 'android';
      expect(isTablet()).toBe(false);
    });

    it('returns true for width between 768 and 1024', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 900, height: 600 });
      expect(isTablet()).toBe(true);
    });

    it('returns true at exactly 768', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 768, height: 1024 });
      expect(isTablet()).toBe(true);
    });

    it('returns false for desktop width', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
      expect(isTablet()).toBe(false);
    });

    it('returns false for mobile width', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });
      expect(isTablet()).toBe(false);
    });
  });

  describe('isMobile', () => {
    it('returns true for non-web platform', () => {
      (Platform as any).OS = 'ios';
      expect(isMobile()).toBe(true);
    });

    it('returns true for width < 768 on web', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });
      expect(isMobile()).toBe(true);
    });

    it('returns false for tablet width on web', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 800, height: 600 });
      expect(isMobile()).toBe(false);
    });
  });

  describe('getScreenType', () => {
    it('returns desktop for large screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
      expect(getScreenType()).toBe('desktop');
    });

    it('returns tablet for medium screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 900, height: 600 });
      expect(getScreenType()).toBe('tablet');
    });

    it('returns mobile for small screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });
      expect(getScreenType()).toBe('mobile');
    });

    it('returns mobile for native platforms', () => {
      (Platform as any).OS = 'ios';
      expect(getScreenType()).toBe('mobile');
    });
  });

  describe('responsive', () => {
    it('returns desktop value for desktop screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });

      const result = responsive({
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
      });

      expect(result).toBe('desktop-value');
    });

    it('returns tablet value for tablet screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 900, height: 600 });

      const result = responsive({
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
      });

      expect(result).toBe('tablet-value');
    });

    it('returns mobile value for mobile screens', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });

      const result = responsive({
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
      });

      expect(result).toBe('mobile-value');
    });

    it('falls back to mobile when desktop value not provided', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });

      const result = responsive({
        mobile: 'mobile-value',
      });

      expect(result).toBe('mobile-value');
    });

    it('falls back to mobile when tablet value not provided', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 900, height: 600 });

      const result = responsive({
        mobile: 'mobile-value',
        desktop: 'desktop-value',
      });

      expect(result).toBe('mobile-value');
    });

    it('works with number values', () => {
      (Platform as any).OS = 'web';
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });

      const result = responsive({
        mobile: 16,
        tablet: 20,
        desktop: 24,
      });

      expect(result).toBe(24);
    });
  });

  describe('Constants', () => {
    it('exports MAX_CONTENT_WIDTH', () => {
      expect(MAX_CONTENT_WIDTH).toBe(1400);
    });

    it('exports MAX_NARROW_WIDTH', () => {
      expect(MAX_NARROW_WIDTH).toBe(800);
    });
  });
});
