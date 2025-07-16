import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { metadataExtractor, MetadataExtractionService } from './metadata'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Metadata Extraction Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should extract YouTube metadata correctly', async () => {
    const mockYouTubeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amazing Tutorial - YouTube</title>
        <meta property="og:title" content="How to Build Amazing Apps" />
        <meta property="og:description" content="Learn to build amazing applications step by step" />
        <meta property="og:image" content="https://i.ytimg.com/vi/abc123/maxresdefault.jpg" />
        <meta name="author" content="Tech Channel" />
        <meta itemprop="duration" content="PT15M30S" />
        <meta itemprop="interactionCount" content="50000" />
      </head>
      <body></body>
      </html>
    `

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockYouTubeHtml)
    })

    const result = await metadataExtractor.extractYouTube('https://www.youtube.com/watch?v=abc123')

    expect(result).toMatchObject({
      title: 'How to Build Amazing Apps',
      description: 'Learn to build amazing applications step by step',
      image: 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg',
      duration: 930, // 15 minutes 30 seconds
      channelName: 'Tech Channel',
      viewCount: 50000,
      embedUrl: 'https://www.youtube.com/embed/abc123'
    })
  })

  it('should extract Instagram metadata correctly', async () => {
    const mockInstagramHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="Amazing post by @creator" />
        <meta property="og:description" content="Check out this amazing content!" />
        <meta property="og:image" content="https://instagram.com/p/xyz789/media/?size=l" />
        <meta property="og:site_name" content="Instagram" />
      </head>
      <body></body>
      </html>
    `

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockInstagramHtml)
    })

    const result = await metadataExtractor.extractInstagram('https://www.instagram.com/p/xyz789/')

    expect(result).toMatchObject({
      title: 'Amazing post by @creator',
      description: 'Check out this amazing content!',
      image: 'https://instagram.com/p/xyz789/media/?size=l',
      siteName: 'Instagram',
      platform: 'instagram',
      postType: 'post'
    })
  })

  it('should extract web page metadata correctly', async () => {
    const mockWebPageHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>The Ultimate Guide to Web Development</title>
        <meta property="og:title" content="The Ultimate Guide to Web Development" />
        <meta property="og:description" content="Everything you need to know about modern web development" />
        <meta property="og:image" content="https://example.com/guide-image.jpg" />
        <meta property="og:site_name" content="Dev Blog" />
        <meta name="author" content="Jane Developer" />
        <meta property="article:published_time" content="2024-01-15T10:30:00Z" />
      </head>
      <body></body>
      </html>
    `

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockWebPageHtml)
    })

    const result = await metadataExtractor.extractWebPage('https://devblog.com/ultimate-guide-web-development')

    expect(result).toMatchObject({
      title: 'The Ultimate Guide to Web Development',
      description: 'Everything you need to know about modern web development',
      image: 'https://example.com/guide-image.jpg',
      siteName: 'Dev Blog',
      author: 'Jane Developer',
      publishedDate: new Date('2024-01-15T10:30:00Z')
    })
  })

  it('should handle metadata extraction failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(metadataExtractor.extractWebPage('https://example.com/unreachable-page'))
      .rejects.toThrow('Failed after 4 attempts: Network error')
  }, 10000)

  it('should correctly identify extractor types for different URLs', () => {
    expect(MetadataExtractionService.getExtractorType('https://www.youtube.com/watch?v=abc123'))
      .toBe('youtube')
    
    expect(MetadataExtractionService.getExtractorType('https://youtu.be/abc123'))
      .toBe('youtube')
    
    expect(MetadataExtractionService.getExtractorType('https://www.instagram.com/p/abc123/'))
      .toBe('instagram')
    
    expect(MetadataExtractionService.getExtractorType('https://example.com/article'))
      .toBe('webpage')
  })

  it('should create custom extractor instances with different configurations', () => {
    const fastExtractor = MetadataExtractionService.create({
      timeout: 5000,
      retries: 1,
      retryDelay: 500
    })

    const slowExtractor = MetadataExtractionService.create({
      timeout: 30000,
      retries: 5,
      retryDelay: 2000
    })

    expect(fastExtractor).toBeInstanceOf(MetadataExtractionService)
    expect(slowExtractor).toBeInstanceOf(MetadataExtractionService)
    expect(fastExtractor).not.toBe(slowExtractor)
  })
})