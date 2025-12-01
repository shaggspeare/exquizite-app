// Web-specific sharing utilities
// These functions provide web platform sharing capabilities with browser compatibility

/**
 * Share data interface for Web Share API
 */
export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Social media platform types
 */
export type SocialPlatform = 'twitter' | 'facebook' | 'whatsapp' | 'telegram';

/**
 * Detects if the browser supports the Web Share API
 */
export const canUseWebShare = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.share !== undefined;
};

/**
 * Detects if the browser supports the Clipboard API
 */
export const canUseClipboard = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    navigator.clipboard !== undefined &&
    navigator.clipboard.writeText !== undefined
  );
};

/**
 * Wrapper for Web Share API
 * @returns true if shared successfully, false otherwise
 */
export const shareViaWebAPI = async (data: ShareData): Promise<boolean> => {
  if (!canUseWebShare()) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error: any) {
    // User cancelled sharing - this is not an error
    if (error.name === 'AbortError') {
      return false;
    }
    // Actual error occurred
    console.error('Web Share API error:', error);
    return false;
  }
};

/**
 * Fallback clipboard copy using execCommand for older browsers
 */
const fallbackCopyToClipboard = (text: string): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    document.body.removeChild(textArea);
    return false;
  }
};

/**
 * Copies text to clipboard using modern Clipboard API with fallback
 * @returns true if copied successfully, false otherwise
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try modern Clipboard API first
  if (canUseClipboard()) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard API error:', error);
      // Fall through to fallback
    }
  }

  // Fallback to execCommand for older browsers
  return fallbackCopyToClipboard(text);
};

/**
 * Generates social media share URLs for different platforms
 */
export const getSocialShareUrls = (
  url: string,
  title: string,
  description: string
): Record<SocialPlatform, string> => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedDescription}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedDescription}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedDescription}`,
  };
};

/**
 * Opens a URL in a new window/tab
 * Useful for social media sharing to avoid popup blockers
 */
export const openInNewTab = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
