import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { contentService } from '../services/content'
import { SaveRequest } from '../types'

export function SavePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const processSharedContent = async () => {
      // Extract shared data from URL parameters
      const url = searchParams.get('url')
      const text = searchParams.get('text')
      const title = searchParams.get('title')

      // If no shared data, redirect to main page
      if (!url && !text && !title) {
        navigate('/')
        return
      }

      setIsProcessing(true)

      try {
        const saveRequest: SaveRequest = {
          url: url || undefined,
          content: text || undefined,
          title: title || undefined,
          source: 'share'
        }

        await contentService.saveContent(saveRequest)
        
        setResult({
          success: true,
          message: 'Content saved successfully!'
        })

        // Redirect to main page after 2 seconds
        setTimeout(() => {
          navigate('/')
        }, 2000)

      } catch (error) {
        console.error('Failed to save shared content:', error)
        setResult({
          success: false,
          message: 'Failed to save content. Please try again.'
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processSharedContent()
  }, [searchParams, navigate])

  if (isProcessing) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '300px',
          padding: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #646cff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem'
          }}></div>
          <h2 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.5rem' }}>
            Saving Content...
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
            Processing your shared content
          </p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          padding: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            background: result.success ? '#4caf50' : '#f44336',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white'
          }}>
            {result.success ? '✓' : '✗'}
          </div>
          <h2 style={{ 
            margin: '0 0 1rem', 
            color: result.success ? '#4caf50' : '#f44336',
            fontSize: '1.5rem' 
          }}>
            {result.success ? 'Success!' : 'Error'}
          </h2>
          <p style={{ margin: '0 0 2rem', color: '#666', fontSize: '1rem' }}>
            {result.message}
          </p>
          {result.success && (
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
              Redirecting to your content...
            </p>
          )}
          {!result.success && (
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#646cff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Go to App
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}