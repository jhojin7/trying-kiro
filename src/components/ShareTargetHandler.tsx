import React, { useEffect, useState } from 'react';
import { pwaService } from '@/services/pwa';
import { contentService } from '@/services/content';

interface ShareTargetHandlerProps {
  onContentShared?: (content: any) => void;
}

export const ShareTargetHandler: React.FC<ShareTargetHandlerProps> = ({
  onContentShared
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [sharedContent, setSharedContent] = useState<any>(null);

  useEffect(() => {
    // Check for shared content on component mount
    const handleSharedContent = async () => {
      const shared = pwaService.handleShareTarget();
      
      if (shared) {
        setIsProcessing(true);
        setSharedContent(shared);
        
        try {
          // Process the shared content
          let savedContent;
          
          if (shared.url) {
            // Save URL content
            savedContent = await contentService.saveContent({
              url: shared.url,
              title: shared.title
            });
          } else if (shared.text) {
            // Save text content
            savedContent = await contentService.saveContent({
              content: shared.text,
              title: shared.title
            });
          }
          
          if (savedContent) {
            onContentShared?.(savedContent);
            
            // Show success feedback
            showSuccessNotification();
          }
        } catch (error) {
          console.error('Error processing shared content:', error);
          showErrorNotification();
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleSharedContent();
  }, [onContentShared]);

  const showSuccessNotification = () => {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.textContent = 'Content saved successfully!';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const showErrorNotification = () => {
    const notification = document.createElement('div');
    notification.textContent = 'Failed to save content. Please try again.';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  // Show processing indicator if content is being processed
  if (isProcessing && sharedContent) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #646cff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#333' }}>
            Saving Content...
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {sharedContent.url ? 'Processing URL' : 'Saving text'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ShareTargetHandler;