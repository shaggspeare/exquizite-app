// Import the module under test directly
import {
  canUseWebShare,
  canUseClipboard,
  shareViaWebAPI,
  copyToClipboard,
  getSocialShareUrls,
  openInNewTab,
} from '../../lib/web-share';

describe('web-share', () => {
  // Store original values
  let originalNavigator: typeof globalThis.navigator;
  let originalDocument: typeof globalThis.document;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalNavigator = global.navigator;
    originalDocument = global.document;
    originalWindow = global.window;
    // Set defaults
    global.navigator = {} as any;
    global.document = {} as any;
    global.window = {} as any;
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    global.document = originalDocument;
    global.window = originalWindow;
  });

  describe('canUseWebShare', () => {
    it('returns false when navigator.share is undefined', () => {
      global.navigator = {} as any;
      expect(canUseWebShare()).toBe(false);
    });

    it('returns true when navigator.share is available', () => {
      global.navigator = { share: jest.fn() } as any;
      expect(canUseWebShare()).toBe(true);
    });
  });

  describe('canUseClipboard', () => {
    it('returns false when clipboard is undefined', () => {
      global.navigator = {} as any;
      expect(canUseClipboard()).toBe(false);
    });

    it('returns false when clipboard.writeText is undefined', () => {
      global.navigator = { clipboard: {} } as any;
      expect(canUseClipboard()).toBe(false);
    });

    it('returns true when clipboard.writeText is available', () => {
      global.navigator = {
        clipboard: { writeText: jest.fn() },
      } as any;
      expect(canUseClipboard()).toBe(true);
    });
  });

  describe('shareViaWebAPI', () => {
    it('returns false when Web Share API not available', async () => {
      global.navigator = {} as any;
      const result = await shareViaWebAPI({ title: 'Test', text: 'Hello' });
      expect(result).toBe(false);
    });

    it('returns true on successful share', async () => {
      const shareMock = jest.fn().mockResolvedValue(undefined);
      global.navigator = { share: shareMock } as any;

      const result = await shareViaWebAPI({ title: 'Test', text: 'Hello', url: 'https://example.com' });

      expect(result).toBe(true);
      expect(shareMock).toHaveBeenCalledWith({
        title: 'Test',
        text: 'Hello',
        url: 'https://example.com',
      });
    });

    it('returns false when user cancels (AbortError)', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      const shareMock = jest.fn().mockRejectedValue(abortError);
      global.navigator = { share: shareMock } as any;

      const result = await shareViaWebAPI({ title: 'Test' });

      expect(result).toBe(false);
    });

    it('returns false on other errors', async () => {
      const shareMock = jest.fn().mockRejectedValue(new Error('Share failed'));
      global.navigator = { share: shareMock } as any;

      const result = await shareViaWebAPI({ title: 'Test' });

      expect(result).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('uses modern Clipboard API when available', async () => {
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      global.navigator = {
        clipboard: { writeText: writeTextMock },
      } as any;

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith('test text');
    });

    it('falls back to execCommand when Clipboard API fails', async () => {
      const writeTextMock = jest.fn().mockRejectedValue(new Error('Failed'));
      global.navigator = {
        clipboard: { writeText: writeTextMock },
      } as any;

      const mockTextArea = {
        value: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn(),
      };
      const createElementMock = jest.fn().mockReturnValue(mockTextArea);
      const appendChildMock = jest.fn();
      const removeChildMock = jest.fn();
      const execCommandMock = jest.fn().mockReturnValue(true);

      global.document = {
        createElement: createElementMock,
        body: {
          appendChild: appendChildMock,
          removeChild: removeChildMock,
        },
        execCommand: execCommandMock,
      } as any;

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
      expect(execCommandMock).toHaveBeenCalledWith('copy');
    });

    it('uses fallback when Clipboard API not available', async () => {
      global.navigator = {} as any;

      const mockTextArea = {
        value: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn(),
      };
      const createElementMock = jest.fn().mockReturnValue(mockTextArea);
      const appendChildMock = jest.fn();
      const removeChildMock = jest.fn();
      const execCommandMock = jest.fn().mockReturnValue(true);

      global.document = {
        createElement: createElementMock,
        body: {
          appendChild: appendChildMock,
          removeChild: removeChildMock,
        },
        execCommand: execCommandMock,
      } as any;

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
    });
  });

  describe('getSocialShareUrls', () => {
    it('generates correct Twitter URL', () => {
      const urls = getSocialShareUrls('https://example.com', 'Test Title', 'Test description');

      expect(urls.twitter).toBe(
        'https://twitter.com/intent/tweet?text=Test%20description&url=https%3A%2F%2Fexample.com'
      );
    });

    it('generates correct Facebook URL', () => {
      const urls = getSocialShareUrls('https://example.com', 'Test Title', 'Test description');

      expect(urls.facebook).toBe(
        'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com'
      );
    });

    it('generates correct WhatsApp URL', () => {
      const urls = getSocialShareUrls('https://example.com', 'Test Title', 'Test description');

      expect(urls.whatsapp).toBe(
        'https://wa.me/?text=Test%20description%20https%3A%2F%2Fexample.com'
      );
    });

    it('generates correct Telegram URL', () => {
      const urls = getSocialShareUrls('https://example.com', 'Test Title', 'Test description');

      expect(urls.telegram).toBe(
        'https://t.me/share/url?url=https%3A%2F%2Fexample.com&text=Test%20description'
      );
    });

    it('encodes special characters properly', () => {
      const urls = getSocialShareUrls(
        'https://example.com/path?query=value',
        'Title & "Quotes"',
        'Description with spaces & symbols!'
      );

      expect(urls.twitter).toContain('Description%20with%20spaces%20%26%20symbols!');
      expect(urls.twitter).toContain('https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue');
    });
  });

  describe('openInNewTab', () => {
    it('opens URL in new tab when window is available', () => {
      const openMock = jest.fn();
      global.window = { open: openMock } as any;

      openInNewTab('https://example.com');

      expect(openMock).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });
  });
});
