import {
  SHARE_CONFIG,
  generateShareUrl,
  generateWebShareUrl,
  extractShareCode,
  isValidShareCode,
  formatShareMessage,
  generateShareText,
  parseShareUrl,
} from '../../lib/share-utils';

describe('share-utils', () => {
  describe('SHARE_CONFIG', () => {
    it('has correct configuration values', () => {
      expect(SHARE_CONFIG.SCHEME).toBe('exquiziteapp');
      expect(SHARE_CONFIG.HOST).toBe('shared');
      expect(SHARE_CONFIG.WEB_URL).toBe('https://app.exquizite.app/shared');
      expect(SHARE_CONFIG.CODE_LENGTH).toBe(12);
    });
  });

  describe('generateShareUrl', () => {
    it('generates correct app scheme URL', () => {
      const shareCode = 'ABC123XYZ789';
      const result = generateShareUrl(shareCode);
      expect(result).toBe('exquiziteapp://shared/ABC123XYZ789');
    });

    it('handles empty share code', () => {
      const result = generateShareUrl('');
      expect(result).toBe('exquiziteapp://shared/');
    });
  });

  describe('generateWebShareUrl', () => {
    it('generates correct web URL', () => {
      const shareCode = 'ABC123XYZ789';
      const result = generateWebShareUrl(shareCode);
      expect(result).toBe('https://app.exquizite.app/shared/ABC123XYZ789');
    });

    it('handles empty share code', () => {
      const result = generateWebShareUrl('');
      expect(result).toBe('https://app.exquizite.app/shared/');
    });
  });

  describe('extractShareCode', () => {
    it('extracts code from app scheme URL', () => {
      const url = 'exquiziteapp://shared/ABC123XYZ789';
      const result = extractShareCode(url);
      expect(result).toBe('ABC123XYZ789');
    });

    it('extracts code from web URL', () => {
      const url = 'https://app.exquizite.app/shared/ABC123XYZ789';
      const result = extractShareCode(url);
      expect(result).toBe('ABC123XYZ789');
    });

    it('extracts direct code input with correct length', () => {
      const code = 'ABC123XYZ789'; // 12 characters
      const result = extractShareCode(code);
      expect(result).toBe('ABC123XYZ789');
    });

    it('returns null for direct code with wrong length', () => {
      const code = 'ABC123'; // 6 characters
      const result = extractShareCode(code);
      expect(result).toBeNull();
    });

    it('returns null for invalid URL', () => {
      const url = 'https://example.com/something';
      const result = extractShareCode(url);
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = extractShareCode('');
      expect(result).toBeNull();
    });

    it('returns null for code with special characters', () => {
      const code = 'ABC!@#XYZ789'; // 12 characters but with special chars
      const result = extractShareCode(code);
      expect(result).toBeNull();
    });

    it('handles lowercase characters in code', () => {
      const url = 'exquiziteapp://shared/abc123xyz789';
      const result = extractShareCode(url);
      expect(result).toBe('abc123xyz789');
    });
  });

  describe('isValidShareCode', () => {
    it('returns true for valid 12-character alphanumeric code', () => {
      expect(isValidShareCode('ABC123XYZ789')).toBe(true);
      expect(isValidShareCode('abcdefghijkl')).toBe(true);
      expect(isValidShareCode('123456789012')).toBe(true);
    });

    it('returns false for code with wrong length', () => {
      expect(isValidShareCode('ABC123')).toBe(false);
      expect(isValidShareCode('ABC123XYZ7890')).toBe(false);
      expect(isValidShareCode('')).toBe(false);
    });

    it('returns false for code with special characters', () => {
      expect(isValidShareCode('ABC!@#XYZ789')).toBe(false);
      expect(isValidShareCode('ABC 123 XYZ7')).toBe(false);
      expect(isValidShareCode('ABC-123-XYZ7')).toBe(false);
    });
  });

  describe('formatShareMessage', () => {
    it('formats message correctly with all parameters', () => {
      const result = formatShareMessage('Spanish Basics', 'https://example.com/share', 50);
      expect(result).toBe(
        'Check out my "Spanish Basics" word set with 50 words! Practice it here: https://example.com/share'
      );
    });

    it('handles set name with special characters', () => {
      const result = formatShareMessage('Test & Fun "Quotes"', 'https://example.com', 10);
      expect(result).toContain('Test & Fun "Quotes"');
    });

    it('handles zero word count', () => {
      const result = formatShareMessage('Empty Set', 'https://example.com', 0);
      expect(result).toContain('0 words');
    });
  });

  describe('generateShareText', () => {
    it('generates text with app scheme URL by default', () => {
      const result = generateShareText('Test Set', 'ABC123XYZ789', 25, false);
      expect(result).toContain('exquiziteapp://shared/ABC123XYZ789');
      expect(result).toContain('Test Set');
      expect(result).toContain('25 words');
    });

    it('generates text with web URL when includeWebUrl is true', () => {
      const result = generateShareText('Test Set', 'ABC123XYZ789', 25, true);
      expect(result).toContain('https://app.exquizite.app/shared/ABC123XYZ789');
    });

    it('uses web URL by default when includeWebUrl not specified', () => {
      const result = generateShareText('Test Set', 'ABC123XYZ789', 25);
      expect(result).toContain('exquiziteapp://shared/ABC123XYZ789');
    });
  });

  describe('parseShareUrl', () => {
    it('returns shareCode for valid app scheme URL', () => {
      const result = parseShareUrl('exquiziteapp://shared/ABC123XYZ789');
      expect(result).toEqual({ shareCode: 'ABC123XYZ789' });
    });

    it('returns shareCode for valid web URL', () => {
      const result = parseShareUrl('https://app.exquizite.app/shared/ABC123XYZ789');
      expect(result).toEqual({ shareCode: 'ABC123XYZ789' });
    });

    it('returns null for invalid URL', () => {
      const result = parseShareUrl('https://example.com/invalid');
      expect(result).toBeNull();
    });

    it('returns null for URL with invalid share code format', () => {
      // Code extracted but invalid length
      const result = parseShareUrl('exquiziteapp://shared/ABC');
      expect(result).toBeNull();
    });

    it('returns shareCode for direct valid code input', () => {
      const result = parseShareUrl('ABC123XYZ789');
      expect(result).toEqual({ shareCode: 'ABC123XYZ789' });
    });

    it('returns null for empty string', () => {
      const result = parseShareUrl('');
      expect(result).toBeNull();
    });
  });
});
