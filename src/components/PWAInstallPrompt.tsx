import React, { useState, useEffect } from 'react';
import { pwaService, PWAInstallState } from '@/services/pwa';
import './PWAInstallPrompt.css';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [installState, setInstallState] = useState<PWAInstallState>(
    pwaService.getInstallState()
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Subscribe to install state changes
    const unsubscribe = pwaService.onInstallStateChange(setInstallState);
    
    // Show prompt if app can be installed
    if (installState.canInstall && !localStorage.getItem('pwa-install-dismissed')) {
      setIsVisible(true);
    }

    return unsubscribe;
  }, [installState.canInstall]);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await pwaService.promptInstall();
      
      if (success) {
        setIsVisible(false);
        onInstall?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  // Don't show if already installed or can't install
  if (!isVisible || !installState.canInstall || installState.isInstalled) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          📱
        </div>
        <div className="pwa-install-text">
          <h3>Install Universal Pocket</h3>
          <p>Add to your home screen for quick access and offline use</p>
          <div className="pwa-install-instructions">
            {pwaService.getInstallInstructions()}
          </div>
        </div>
        <div className="pwa-install-actions">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="pwa-install-button primary"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            className="pwa-install-button secondary"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;