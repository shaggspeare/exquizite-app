// Utility functions for handling share links and codes
import { Platform } from 'react-native';

/**
 * Share link configuration
 * Note: Update WEB_URL to 'https://exquizite.app/shared' when custom domain is configured
 */
export const SHARE_CONFIG = {
  SCHEME: 'exquiziteapp',
  HOST: 'shared',
  WEB_URL: 'https://exquizite-app.vercel.app/shared',
  CODE_LENGTH: 12,
} as const;

/**
 * Generates a share URL from a share code
 */
export function generateShareUrl(shareCode: string): string {
  return `${SHARE_CONFIG.SCHEME}://${SHARE_CONFIG.HOST}/${shareCode}`;
}

/**
 * Generates a web share URL from a share code (for sharing outside the app)
 */
export function generateWebShareUrl(shareCode: string): string {
  return `${SHARE_CONFIG.WEB_URL}/${shareCode}`;
}

/**
 * Extracts the share code from a share URL
 */
export function extractShareCode(url: string): string | null {
  try {
    // Handle app scheme URLs: exquiziteapp://shared/CODE
    const appSchemePattern = new RegExp(`${SHARE_CONFIG.SCHEME}://${SHARE_CONFIG.HOST}/([A-Za-z0-9]+)`);
    const appMatch = url.match(appSchemePattern);
    if (appMatch && appMatch[1]) {
      return appMatch[1];
    }

    // Handle web URLs: https://exquizite.app/shared/CODE
    const webPattern = new RegExp(`${SHARE_CONFIG.WEB_URL}/([A-Za-z0-9]+)`);
    const webMatch = url.match(webPattern);
    if (webMatch && webMatch[1]) {
      return webMatch[1];
    }

    // Handle direct code input (if someone pastes just the code)
    if (url.length === SHARE_CONFIG.CODE_LENGTH && /^[A-Za-z0-9]+$/.test(url)) {
      return url;
    }

    return null;
  } catch (error) {
    console.error('Error extracting share code:', error);
    return null;
  }
}

/**
 * Validates a share code format
 */
export function isValidShareCode(code: string): boolean {
  return (
    code.length === SHARE_CONFIG.CODE_LENGTH &&
    /^[A-Za-z0-9]+$/.test(code)
  );
}

/**
 * Formats a share message for different platforms
 */
export function formatShareMessage(
  setName: string,
  shareUrl: string,
  wordCount: number
): string {
  return `Check out my "${setName}" word set with ${wordCount} words! Practice it here: ${shareUrl}`;
}

/**
 * Generates a shareable text for copying
 */
export function generateShareText(
  setName: string,
  shareCode: string,
  wordCount: number,
  includeWebUrl: boolean = false
): string {
  const url = includeWebUrl ? generateWebShareUrl(shareCode) : generateShareUrl(shareCode);
  return formatShareMessage(setName, url, wordCount);
}

/**
 * Share via native share dialog (if available)
 */
export async function shareViaDialog(
  setName: string,
  shareCode: string,
  wordCount: number
): Promise<boolean> {
  try {
    // Dynamic import to avoid errors on web
    const { Share } = await import('react-native');

    const message = generateShareText(setName, shareCode, wordCount, true);

    const result = await Share.share({
      message,
      title: `Share "${setName}"`,
      url: generateWebShareUrl(shareCode),
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing via dialog:', error);
    return false;
  }
}

/**
 * Parse a share URL and extract navigation params
 */
export function parseShareUrl(url: string): { shareCode: string } | null {
  const shareCode = extractShareCode(url);
  if (!shareCode || !isValidShareCode(shareCode)) {
    return null;
  }
  return { shareCode };
}

/**
 * Gets the appropriate share URL based on platform
 * Returns web URL for web platform, app scheme URL for native platforms
 */
export function getPlatformShareUrl(shareCode: string): string {
  if (Platform.OS === 'web') {
    return generateWebShareUrl(shareCode);
  }
  return generateShareUrl(shareCode);
}
