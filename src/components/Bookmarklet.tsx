import { useState } from 'react'

export function Bookmarklet() {
  const [copied, setCopied] = useState(false)

  const bookmarkletCode = `javascript:(function(){
    const url = window.location.href;
    const title = document.title;
    const text = window.getSelection().toString();
    const saveUrl = '${window.location.origin}/save';
    const params = new URLSearchParams();
    if(url) params.set('url', url);
    if(title) params.set('title', title);
    if(text) params.set('text', text);
    window.open(saveUrl + '?' + params.toString(), '_blank', 'width=400,height=600');
  })()`

  const copyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy bookmarklet:', error)
      // Fallback: show the code in a modal for manual copying
      const textarea = document.createElement('textarea')
      textarea.value = bookmarkletCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{
      background: '#f5f5f5',
      padding: '1.5rem',
      borderRadius: '8px',
      margin: '1rem 0',
      border: '1px solid #e0e0e0'
    }}>
      <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.1rem' }}>
        🔖 Desktop Bookmarklet
      </h3>
      <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
        Save any webpage instantly from your browser's bookmark bar. Works on all desktop browsers.
      </p>
      
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: '#333',
          wordBreak: 'break-all',
          lineHeight: '1.3',
          maxHeight: '60px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {bookmarkletCode.slice(0, 100)}...
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'linear-gradient(to right, transparent, white 50%)',
            width: '40px',
            height: '100%'
          }}></div>
        </div>
      </div>

      <button
        onClick={copyBookmarklet}
        style={{
          background: copied ? '#4caf50' : '#646cff',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '6px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginRight: '1rem',
          transition: 'background-color 0.2s'
        }}
      >
        {copied ? '✓ Copied!' : '📋 Copy Bookmarklet'}
      </button>

      <details style={{ marginTop: '1rem' }}>
        <summary style={{ 
          cursor: 'pointer', 
          color: '#646cff',
          fontSize: '0.9rem',
          outline: 'none'
        }}>
          📖 How to install
        </summary>
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '1rem',
          background: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#666', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Click "Copy Bookmarklet" above
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Right-click your browser's bookmark bar
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Select "Add page..." or "Add bookmark"
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Name it "Save to Pocket" (or any name you like)
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Paste the copied code as the URL
            </li>
            <li>
              Click the bookmark on any webpage to save it instantly!
            </li>
          </ol>
        </div>
      </details>
    </div>
  )
}