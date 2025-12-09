import { Platform, Dimensions } from 'react-native';

/**
 * Detects if the current platform is desktop web
 * Returns true for desktop browsers, false for mobile web and native platforms
 */
export function isDesktopWeb(): boolean {
  if (Platform.OS !== 'web') {
    return false;
  }

  // Check if window is available (web environment)
  if (typeof window === 'undefined') {
    return false;
  }

  // Check screen width - typical mobile breakpoint
  const { width } = Dimensions.get('window');
  const isMobileWidth = width < 768;

  // Check for touch device
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - msMaxTouchPoints is IE specific
    navigator.msMaxTouchPoints > 0;

  // Check user agent for mobile devices
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(navigator.userAgent);

  // Desktop if: not mobile width AND (not touch device OR not mobile UA)
  // This allows for touch-enabled desktop devices (like Surface)
  return !isMobileWidth && (!isTouchDevice || !isMobileUA);
}

/**
 * Detects if the current platform is mobile web
 * Returns true for mobile browsers, false for desktop web and native platforms
 */
export function isMobileWeb(): boolean {
  if (Platform.OS !== 'web') {
    return false;
  }

  return !isDesktopWeb();
}

/**
 * Detects if the current platform is native (iOS or Android)
 */
export function isNative(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
