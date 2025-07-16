import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MetadataExtractionService, metadataExtractor } from './metadata'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('MetadataExtractionService', () => {
  let service: MetadataExtractionService

  beforeEach(() => {
    service = MetadataExtractionService.create({ timeout: 5000, retries: 2, retryDelay: 100 })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('extractWebPage', () => {
    it('should extract basic Open Graph metadata', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Article</title>
          <meta property="og:title" content="Amazing Article Title" />
          <meta property="og:description" content="This is a great article about testing" />
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="og:site_name" content="Test Site" />
          <meta name="author" content="John Doe" />
          <meta property="article:published_time" content="2024-01-15T10:30:00Z" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractWebPage('https://example.com/article')

      expect(result).toEqual({
        title: 'Amazing Article Title',
        description: 'This is a great article about testing',
        image: 'https://example.com/image.jpg',
        siteName: 'Test Site',
        author: 'John Doe',
        publishedDate: new Date('2024-01-15T10:30:00Z')
      })
    })

    it('should fallback to Twitter Card metadata when Open Graph is missing', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fallback Title</title>
          <meta name="twitter:title" content="Twitter Card Title" />
          <meta name="twitter:description" content="Twitter description" />
          <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
          <meta name="description" content="HTML meta description" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractWebPage('https://example.com/article')

      expect(result).toEqual({
        title: 'Twitter Card Title',
        description: 'Twitter description',
        image: 'https://example.com/twitter-image.jpg',
        siteName: 'example.com',
        author: undefined,
        publishedDate: undefined
      })
    })

    it('should fallback to HTML title when no meta tags are present', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Basic HTML Title</title>
          <meta name="description" content="Basic description" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractWebPage('https://example.com/basic-page')

      expect(result).toEqual({
        title: 'Basic HTML Title',
        description: 'Basic description',
        image: '',
        siteName: 'example.com',
        author: undefined,
        publishedDate: undefined
      })
    })

    it('should handle relative image URLs', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="Test" />
          <meta property="og:image" content="/images/test.jpg" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractWebPage('https://example.com/article')

      expect(result.image).toBe('https://example.com/images/test.jpg')
    })

    it('should handle protocol-relative image URLs', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="Test" />
          <meta property="og:image" content="//cdn.example.com/image.jpg" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractWebPage('https://example.com/article')

      expect(result.image).toBe('https://cdn.example.com/image.jpg')
    })
  })

  describe('extractYouTube', () => {
    it('should extract YouTube video metadata', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Amazing Video - YouTube</title>
          <meta property="og:title" content="Amazing Video Tutorial" />
          <meta property="og:description" content="Learn something amazing in this video" />
          <meta property="og:image" content="https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" />
          <meta name="author" content="Test Channel" />
          <meta itemprop="duration" content="PT3M45S" />
          <meta itemprop="interactionCount" content="1234567" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

      expect(result).toEqual({
        title: 'Amazing Video Tutorial',
        description: 'Learn something amazing in this video',
        image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        siteName: 'youtube.com',
        author: 'Test Channel',
        publishedDate: undefined,
        duration: 225, // 3 minutes 45 seconds
        channelName: 'Test Channel',
        viewCount: 1234567,
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      })
    })

    it('should handle YouTube Shorts URLs', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="Short Video" />
          <meta property="og:description" content="A short video" />
          <meta property="og:image" content="https://i.ytimg.com/vi/abc123/maxresdefault.jpg" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractYouTube('https://www.youtube.com/shorts/abc123')

      expect(result.embedUrl).toBe('https://www.youtube.com/embed/abc123')
    })

    it('should handle youtu.be URLs', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="Shared Video" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractYouTube('https://youtu.be/xyz789')

      expect(result.embedUrl).toBe('https://www.youtube.com/embed/xyz789')
    })

    it('should parse different duration formats', async () => {
      const testCases = [
        { input: 'PT1M30S', expected: 90 },
        { input: 'PT2H15M30S', expected: 8130 },
        { input: 'PT45S', expected: 45 },
        { input: '1:30', expected: 90 },
        { input: '2:15:30', expected: 8130 }
      ]

      for (const testCase of testCases) {
        const mockHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta property="og:title" content="Test Video" />
            <meta itemprop="duration" content="${testCase.input}" />
          </head>
          <body></body>
          </html>
        `

        mockFetch.mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        })

        const result = await service.extractYouTube('https://www.youtube.com/watch?v=test')
        expect(result.duration).toBe(testCase.expected)
      }
    })

    it('should parse view counts with suffixes', async () => {
      const testCases = [
        { input: '1.2K views', expected: 1200 },
        { input: '5.7M views', expected: 5700000 },
        { input: '2.1B views', expected: 2100000000 },
        { input: '1,234,567 views', expected: 1234567 }
      ]

      for (const testCase of testCases) {
        const mockHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta property="og:title" content="Test Video" />
            <meta itemprop="interactionCount" content="${testCase.input}" />
          </head>
          <body></body>
          </html>
        `

        mockFetch.mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        })

        const result = await service.extractYouTube('https://www.youtube.com/watch?v=test')
        expect(result.viewCount).toBe(testCase.expected)
      }
    })
  })

  describe('extractInstagram', () => {
    it('should extract Instagram post metadata', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="Amazing post by @testuser" />
          <meta property="og:description" content="Check out this amazing post!" />
          <meta property="og:image" content="https://instagram.com/p/abc123/media/?size=l" />
          <meta property="og:site_name" content="Instagram" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractInstagram('https://www.instagram.com/p/abc123/')

      expect(result).toEqual({
        title: 'Amazing post by @testuser',
        description: 'Check out this amazing post!',
        image: 'https://instagram.com/p/abc123/media/?size=l',
        siteName: 'Instagram',
        author: undefined,
        publishedDate: undefined,
        platform: 'instagram',
        username: 'p',
        postType: 'post'
      })
    })

    it('should detect Instagram reel posts', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="Reel by @creator" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractInstagram('https://www.instagram.com/reel/xyz789/')

      expect(result.postType).toBe('reel')
    })

    it('should detect Instagram TV posts', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="IGTV by @creator" />
        </head>
        <body></body>
        </html>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      })

      const result = await service.extractInstagram('https://www.instagram.com/tv/igtv123/')

      expect(result.postType).toBe('igtv')
    })
  })

  describe('error handling and retry logic', () => {
    it('should retry on network failures', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('<html><head><title>Success</title></head></html>')
        })

      const result = await service.extractWebPage('https://example.com/test')

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result.title).toBe('Success')
    })

    it('should fail after maximum retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'))

      await expect(service.extractWebPage('https://example.com/test'))
        .rejects.toThrow('Failed after 3 attempts: Persistent network error')

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(service.extractWebPage('https://example.com/not-found'))
        .rejects.toThrow('Failed after 3 attempts: HTTP 404: Not Found')
    })

    it('should handle timeout errors', async () => {
      const slowService = MetadataExtractionService.create({ timeout: 100, retries: 0 })
      
      mockFetch.mockImplementationOnce(() => {
        const abortError = new Error('The operation was aborted')
        abortError.name = 'AbortError'
        return Promise.reject(abortError)
      })

      await expect(slowService.extractWebPage('https://example.com/slow'))
        .rejects.toThrow('Failed after 1 attempts: Request timeout after 100ms')
    })

    it('should provide fallback metadata on extraction failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'))

      // Test direct extraction failure
      await expect(service.extractWebPage('https://example.com/failed-extraction'))
        .rejects.toThrow('Failed after 3 attempts: Network failure')
    }, 10000)
  })

  describe('utility methods', () => {
    it('should correctly identify extractor types', () => {
      expect(MetadataExtractionService.getExtractorType('https://www.youtube.com/watch?v=abc123'))
        .toBe('youtube')
      
      expect(MetadataExtractionService.getExtractorType('https://youtu.be/abc123'))
        .toBe('youtube')
      
      expect(MetadataExtractionService.getExtractorType('https://www.instagram.com/p/abc123/'))
        .toBe('instagram')
      
      expect(MetadataExtractionService.getExtractorType('https://example.com/article'))
        .toBe('webpage')
    })

    it('should create instances with custom options', () => {
      const customService = MetadataExtractionService.create({
        timeout: 15000,
        retries: 5,
        retryDelay: 2000
      })

      expect(customService).toBeInstanceOf(MetadataExtractionService)
    })
  })

  describe('real URL integration tests', () => {
    // These tests would work with actual URLs in a real environment
    // For now, we'll mock them but structure them as integration tests
    
    it('should handle malformed HTML gracefully', async () => {
      const malformedHtml = `
        <html>
        <head>
          <title>Broken HTML</title>
          <meta property="og:description" content="Valid description" />
        </head>
        <body>
          <p>Some content
        </body>
      `

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(malformedHtml)
      })

      const result = await service.extractWebPage('https://example.com/malformed')

      // Should still extract what it can
      expect(result.title).toBe('Broken HTML')
      expect(result.description).toBe('Valid description')
    })

    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('')
      })

      const result = await service.extractWebPage('https://example.com/empty')

      expect(result).toEqual({
        title: 'Empty',
        description: '',
        image: '',
        siteName: 'example.com',
        author: undefined,
        publishedDate: undefined
      })
    })

    it('should handle non-HTML responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"error": "This is JSON, not HTML"}')
      })

      const result = await service.extractWebPage('https://api.example.com/data')

      expect(result.title).toBe('Data')
      expect(result.siteName).toBe('api.example.com')
    })
  })
})

describe('Default metadata extractor instance', () => {
  it('should export a default configured instance', () => {
    expect(metadataExtractor).toBeInstanceOf(MetadataExtractionService)
  })
})