import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pwaService } from './pwa';

// Mock window and navigator objects
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  share: vi.fn(),
};

const mockWindow = {
  addEventListener: vi.fn(),
  matchMedia: vi.fn(),
  navigator: mockNavigator,
  location: {
    search: '',
    pathname: '/',
  },
  history: {
    replaceState: vi.fn(),
  },
};

// Setup global mocks
vi.stubGlobal('window', mockWindow);
vi.stubGlobal('navigator', mockNavigator);

describe('PWAService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getInstallState', () => {
    it('should return correct install state for desktop', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      mockWindow.matchMedia = vi.fn().mockReturnValue({ matches: false });
      
      const state = pwaService.getInstallState();
      
      expect(state.platform).toBe('desktop');
      expect(state.isStandalone).toBe(false);
      expect(state.isInstalled).toBe(false);
    });

    it('should detect iOS platform', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      
      const state = pwaService.getInstallState();
      
      expect(state.platform).toBe('ios');
    });

    it('should detect Android platform', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      
      const state = pwaService.getInstallState();
      
      expect(state.platform).toBe('android');
    });

    it('should detect standalone mode', () => {
      mockWindow.matchMedia = vi.fn().mockReturnValue({ matches: true });
      
      const state = pwaService.getInstallState();
      
      expect(state.isStandalone).toBe(true);
      expect(state.isInstalled).toBe(true);
    });
  });

  describe('handleShareTarget', () => {
    it('should return null when no shared data', () => {
      mockWindow.location.search = '';
      
      const result = pwaService.handleShareTarget();
      
      expect(result).toBeNull();
    });

    it('should parse shared URL data', () => {
      mockWindow.location.search = '?url=https://example.com&title=Test&text=Sample';
      
      const result = pwaService.handleShareTarget();
      
      expect(result).toEqual({
        url: 'https://example.com',
        title: 'Test',
        text: 'Sample'
      });
    });

    it('should clear URL parameters after processing', () => {
      mockWindow.location.search = '?url=https://example.com';
      
      pwaService.handleShareTarget();
      
      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        {},
        expect.any(String),
        '/'
      );
    });
  });

  describe('canShare', () => {
    it('should return true when Web Share API is supported', () => {
      mockNavigator.share = vi.fn();
      
      const result = pwaService.canShare();
      
      expect(result).toBe(true);
    });

    it('should return false when Web Share API is not supported', () => {
      delete (mockNavigator as any).share;
      
      const result = pwaService.canShare();
      
      expect(result).toBe(false);
    });
  });

  describe('share', () => {
    it('should call navigator.share with correct data', async () => {
      mockNavigator.share = vi.fn().mockResolvedValue(undefined);
      
      const shareData = { title: 'Test', url: 'https://example.com' };
      const result = await pwaService.share(shareData);
      
      expect(mockNavigator.share).toHaveBeenCalledWith(shareData);
      expect(result).toBe(true);
    });

    it('should return false when share fails', async () => {
      mockNavigator.share = vi.fn().mockRejectedValue(new Error('Share failed'));
      
      const result = await pwaService.share({ title: 'Test' });
      
      expect(result).toBe(false);
    });

    it('should return false when Web Share API is not supported', async () => {
      delete (mockNavigator as any).share;
      
      const result = await pwaService.share({ title: 'Test' });
      
      expect(result).toBe(false);
    });
  });

  describe('getInstallInstructions', () => {
    it('should return iOS instructions for iPhone', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      
      const instructions = pwaService.getInstallInstructions();
      
      expect(instructions).toContain('Share button');
      expect(instructions).toContain('Add to Home Screen');
    });

    it('should return Android instructions for Android devices', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      
      const instructions = pwaService.getInstallInstructions();
      
      expect(instructions).toContain('menu button');
      expect(instructions).toContain('Install App');
    });

    it('should return desktop instructions for desktop browsers', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      
      const instructions = pwaService.getInstallInstructions();
      
      expect(instructions).toContain('install button');
      expect(instructions).toContain('address bar');
    });
  });
});