import { renderHook, act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

// Mock react-native Dimensions
const mockDimensionsListeners: Array<(params: { window: { width: number; height: number } }) => void> = [];

jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 1024, height: 768 })),
    addEventListener: jest.fn((event, callback) => {
      mockDimensionsListeners.push(callback);
      return {
        remove: jest.fn(() => {
          const index = mockDimensionsListeners.indexOf(callback);
          if (index > -1) {
            mockDimensionsListeners.splice(index, 1);
          }
        }),
      };
    }),
  },
  Platform: {
    OS: 'web',
  },
}));

// Mock the responsive module
jest.mock('../../lib/responsive', () => ({
  getScreenType: jest.fn(() => 'desktop'),
}));

import { useResponsive } from '../../hooks/useResponsive';
import { getScreenType } from '../../lib/responsive';

const mockedGetScreenType = getScreenType as jest.MockedFunction<typeof getScreenType>;

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDimensionsListeners.length = 0;
    (Dimensions.get as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
    mockedGetScreenType.mockReturnValue('desktop');
  });

  it('returns initial dimensions', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('returns initial screen type', () => {
    mockedGetScreenType.mockReturnValue('desktop');

    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenType).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
  });

  it('returns tablet state correctly', () => {
    mockedGetScreenType.mockReturnValue('tablet');

    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenType).toBe('tablet');
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it('returns mobile state correctly', () => {
    mockedGetScreenType.mockReturnValue('mobile');

    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenType).toBe('mobile');
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(true);
  });

  it('sets up dimension change listener', () => {
    renderHook(() => useResponsive());

    expect(Dimensions.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates dimensions on change', () => {
    const { result } = renderHook(() => useResponsive());

    // Simulate dimension change
    act(() => {
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 375, height: 667 });
      mockedGetScreenType.mockReturnValue('mobile');

      mockDimensionsListeners.forEach(listener => {
        listener({ window: { width: 375, height: 667 } });
      });
    });

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
    expect(result.current.screenType).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const removeMock = jest.fn();
    (Dimensions.addEventListener as jest.Mock).mockReturnValue({ remove: removeMock });

    const { unmount } = renderHook(() => useResponsive());
    unmount();

    expect(removeMock).toHaveBeenCalled();
  });

  it('handles dimension changes', () => {
    // Ensure listeners are captured during this test
    const localListeners: Array<(params: { window: { width: number; height: number } }) => void> = [];
    (Dimensions.addEventListener as jest.Mock).mockImplementation((event, callback) => {
      localListeners.push(callback);
      return {
        remove: jest.fn(),
      };
    });

    const { result } = renderHook(() => useResponsive());

    // Verify initial state
    expect(result.current.isDesktop).toBe(true);

    // Simulate dimension change to mobile
    act(() => {
      mockedGetScreenType.mockReturnValue('mobile');
      localListeners.forEach(listener => {
        listener({ window: { width: 375, height: 667 } });
      });
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });
});
