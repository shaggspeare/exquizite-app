// Responsive utilities for desktop/mobile layouts
import { Dimensions, Platform } from 'react-native';

// Breakpoints
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

// Get current window dimensions
export const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Check if current screen is desktop size
export const isDesktop = (): boolean => {
  if (Platform.OS !== 'web') return false;
  const { width } = getWindowDimensions();
  return width >= Breakpoints.desktop;
};

// Check if current screen is tablet size
export const isTablet = (): boolean => {
  if (Platform.OS !== 'web') return false;
  const { width } = getWindowDimensions();
  return width >= Breakpoints.tablet && width < Breakpoints.desktop;
};

// Check if current screen is mobile size
export const isMobile = (): boolean => {
  if (Platform.OS !== 'web') return true;
  const { width } = getWindowDimensions();
  return width < Breakpoints.tablet;
};

// Get current screen type
export const getScreenType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isDesktop()) return 'desktop';
  if (isTablet()) return 'tablet';
  return 'mobile';
};

// Responsive value selector
export const responsive = <T,>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T => {
  const screenType = getScreenType();

  if (screenType === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }

  if (screenType === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }

  return values.mobile;
};

// Max content width for desktop
export const MAX_CONTENT_WIDTH = 1400;
export const MAX_NARROW_WIDTH = 800;
