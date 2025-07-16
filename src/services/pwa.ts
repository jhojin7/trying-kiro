/**
 * PWA Service - Handles Progressive Web App functionality
 * Including installation detection, prompts, and share target handling
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

class PWAService {
  private installPrompt: BeforeInstallPromptEvent | null = null;
  private installStateListeners: ((state: PWAInstallState) => void)[] = [];

  constructor() {
    this.setupInstallPromptListener();
    this.setupAppInstalledListener();
  }

  /**
   * Get current PWA installation state
   */
  getInstallState(): PWAInstallState {
    const isStandalone = this.isStandalone();
    const platform = this.detectPlatform();
    
    return {
      canInstall: !!this.installPrompt && !isStandalone,
      isInstalled: isStandalone,
      isStandalone,
      platform
    };
  }

  /**
   * Check if app is running in standalone mode (installed)
   */
  private isStandalone(): boolean {
    // Check for standalone display mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS standalone
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      return true;
    }

    // Check for Android TWA
    if (document.referrer && document.referrer.includes('android-app://')) {
      return true;
    }

    return false;
  }

  /**
   * Detect user's platform
   */
  private detectPlatform(): PWAInstallState['platform'] {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    if (/windows|macintosh|linux/.test(userAgent)) {
      return 'desktop';
    }
    
    return 'unknown';
  }

  /**
   * Setup listener for beforeinstallprompt event
   */
  private setupInstallPromptListener(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      this.installPrompt = e as BeforeInstallPromptEvent;
      this.notifyStateChange();
    });
  }

  /**
   * Setup listener for app installed event
   */
  private setupAppInstalledListener(): void {
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.notifyStateChange();
    });
  }

  /**
   * Trigger PWA installation prompt
   */
  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.installPrompt = null;
        this.notifyStateChange();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting for install:', error);
      return false;
    }
  }

  /**
   * Subscribe to PWA install state changes
   */
  onInstallStateChange(callback: (state: PWAInstallState) => void): () => void {
    this.installStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.installStateListeners.indexOf(callback);
      if (index > -1) {
        this.installStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyStateChange(): void {
    const state = this.getInstallState();
    this.installStateListeners.forEach(callback => callback(state));
  }

  /**
   * Handle shared content from share target
   */
  handleShareTarget(): { url?: string; text?: string; title?: string; files?: FileList } | null {
    const urlParams = new URLSearchParams(window.location.search);
    
    const sharedData = {
      url: urlParams.get('url') || undefined,
      text: urlParams.get('text') || undefined,
      title: urlParams.get('title') || undefined,
    };

    // Check if any shared data exists
    if (!sharedData.url && !sharedData.text && !sharedData.title) {
      return null;
    }

    // Clear the URL parameters after processing
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return sharedData;
  }

  /**
   * Check if Web Share API is supported
   */
  canShare(): boolean {
    return 'share' in navigator;
  }

  /**
   * Share content using Web Share API
   */
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!this.canShare()) {
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
      return false;
    }
  }

  /**
   * Get installation instructions for current platform
   */
  getInstallInstructions(): string {
    const platform = this.detectPlatform();
    
    switch (platform) {
      case 'ios':
        return 'Tap the Share button and select "Add to Home Screen"';
      case 'android':
        return 'Tap the menu button and select "Add to Home Screen" or "Install App"';
      case 'desktop':
        return 'Click the install button in your browser\'s address bar';
      default:
        return 'Look for an "Install" or "Add to Home Screen" option in your browser';
    }
  }
}

// Export singleton instance
export const pwaService = new PWAService();