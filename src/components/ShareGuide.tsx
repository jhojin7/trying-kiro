import { useState } from 'react'
import { pwaService } from '../services/pwa'

export function ShareGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const installState = pwaService.getInstallState()

  return (
    <div style={{
      background: '#f8f9fa',
      padding: '1.5rem',
      borderRadius: '8px',
      margin: '1rem 0',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
      onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#333', fontSize: '1.1rem' }}>
            🔗 How to Save from Other Apps
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {installState.isInstalled 
              ? 'Ready to receive shared content!' 
              : 'Install the app first to enable sharing'
            }
          </p>
        </div>
        <div style={{ 
          fontSize: '1.2rem', 
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s'
        }}>
          ▼
        </div>
      </div>

      {isOpen && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
          {!installState.isInstalled ? (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: '#856404' }}>⚠️ Installation Required</strong>
              <p style={{ margin: '0.5rem 0 0', color: '#856404', fontSize: '0.9rem' }}>
                To save content from other apps, you need to install Universal Pocket as a PWA first. 
                Look for the install prompt or the install button in your browser.
              </p>
            </div>
          ) : (
            <div style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: '#155724' }}>✅ App Installed!</strong>
              <p style={{ margin: '0.5rem 0 0', color: '#155724', fontSize: '0.9rem' }}>
                Universal Pocket is installed and ready to receive shared content.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {/* Mobile Chrome/Android */}
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#333', fontSize: '1rem' }}>
                📱 Mobile Chrome/Android
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#666', fontSize: '0.85rem' }}>
                <li>Open any webpage or app</li>
                <li>Tap the Share button</li>
                <li>Select "Universal Pocket" from the share menu</li>
                <li>Content saves automatically!</li>
              </ol>
            </div>

            {/* iOS Safari */}
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#333', fontSize: '1rem' }}>
                🍎 iOS Safari
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#666', fontSize: '0.85rem' }}>
                <li>Open any webpage in Safari</li>
                <li>Tap the Share button</li>
                <li>Select "Universal Pocket"</li>
                <li>Or manually copy URL and paste in the app</li>
              </ol>
            </div>

            {/* Desktop */}
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#333', fontSize: '1rem' }}>
                💻 Desktop Browsers
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#666', fontSize: '0.85rem' }}>
                <li>Use the bookmarklet above for one-click saving</li>
                <li>Or copy/paste URLs manually</li>
                <li>Select text on any page before using bookmarklet to save highlighted content</li>
              </ol>
            </div>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#333', fontSize: '1rem' }}>
              💡 Pro Tips
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#666', fontSize: '0.85rem' }}>
              <li><strong>Text Selection:</strong> Select text before sharing to save highlighted content</li>
              <li><strong>Offline Saving:</strong> Content saves even without internet - metadata loads when you're back online</li>
              <li><strong>Multiple Formats:</strong> Works with articles, videos, social posts, images, and plain text</li>
              <li><strong>Auto-tagging:</strong> Content is automatically categorized by type and platform</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}