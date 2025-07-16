import { WebPageMetadata, VideoMetadata, SocialMetadata } from '@/types'

export interface MetadataExtractor {
  extractWebPage(url: string): Promise<WebPageMetadata>
  extractYouTube(url: string): Promise<VideoMetadata>
  extractInstagram(url: string): Promise<SocialMetadata>
}

export interface ExtractorOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
}

class MetadataExtractionService implements MetadataExtractor {
  private readonly defaultOptions: Required<ExtractorOptions> = {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000
  }

  constructor(private options: ExtractorOptions = {}) {
    this.options = { ...this.defaultOptions, ...options }
  }

  async extractWebPage(url: string): Promise<WebPageMetadata> {
    return this.withRetry(async () => {
      const html = await this.fetchWithTimeout(url)
      return this.parseWebPageMetadata(html, url)
    })
  }

  async extractYouTube(url: string): Promise<VideoMetadata> {
    return this.withRetry(async () => {
      const html = await this.fetchWithTimeout(url)
      return this.parseYouTubeMetadata(html, url)
    })
  }

  async extractInstagram(url: string): Promise<SocialMetadata> {
    return this.withRetry(async () => {
      const html = await this.fetchWithTimeout(url)
      return this.parseInstagramMetadata(html, url)
    })
  }

  private async fetchWithTimeout(url: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout!)

    try {
      // In a browser environment, we need to use a CORS proxy or server-side endpoint
      // For now, we'll simulate the fetch with a placeholder that would work with a proxy
      const proxyUrl = this.buildProxyUrl(url)
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UniversalPocket/1.0)'
        }
      })

      if (!response || !response.ok) {
        const status = response?.status || 0
        const statusText = response?.statusText || 'Unknown Error'
        throw new Error(`HTTP ${status}: ${statusText}`)
      }

      return await response.text()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.options.timeout}ms`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private buildProxyUrl(url: string): string {
    // In production, this would use a CORS proxy service or server-side endpoint
    // For development, we'll use a placeholder that simulates the behavior
    if (process.env.NODE_ENV === 'development') {
      return `/api/proxy?url=${encodeURIComponent(url)}`
    }
    return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  }

  private parseWebPageMetadata(html: string, url: string): WebPageMetadata {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract Open Graph tags
    const ogTitle = this.getMetaContent(doc, 'property', 'og:title')
    const ogDescription = this.getMetaContent(doc, 'property', 'og:description')
    const ogImage = this.getMetaContent(doc, 'property', 'og:image')
    const ogSiteName = this.getMetaContent(doc, 'property', 'og:site_name')

    // Extract Twitter Card tags as fallback
    const twitterTitle = this.getMetaContent(doc, 'name', 'twitter:title')
    const twitterDescription = this.getMetaContent(doc, 'name', 'twitter:description')
    const twitterImage = this.getMetaContent(doc, 'name', 'twitter:image')

    // Extract standard HTML tags as fallback
    const htmlTitle = doc.querySelector('title')?.textContent?.trim()
    const htmlDescription = this.getMetaContent(doc, 'name', 'description')

    // Extract author information
    const author = this.getMetaContent(doc, 'name', 'author') || 
                  this.getMetaContent(doc, 'property', 'article:author')

    // Extract published date
    const publishedDate = this.extractPublishedDate(doc)

    return {
      title: ogTitle || twitterTitle || htmlTitle || this.extractTitleFromUrl(url),
      description: ogDescription || twitterDescription || htmlDescription || '',
      image: this.resolveImageUrl(ogImage || twitterImage || '', url),
      siteName: ogSiteName || this.extractSiteNameFromUrl(url),
      author: author || undefined,
      publishedDate: publishedDate || undefined
    }
  }

  private parseYouTubeMetadata(html: string, url: string): VideoMetadata {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract basic metadata first
    const baseMetadata = this.parseWebPageMetadata(html, url)

    // Extract YouTube-specific data
    const videoId = this.extractYouTubeVideoId(url)
    const channelName = this.extractYouTubeChannelName(doc)
    const duration = this.extractYouTubeDuration(doc)
    const viewCount = this.extractYouTubeViewCount(doc)

    return {
      ...baseMetadata,
      duration: duration || 0,
      channelName: channelName || 'Unknown Channel',
      viewCount: viewCount || undefined,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    }
  }

  private parseInstagramMetadata(html: string, url: string): SocialMetadata {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract basic metadata first
    const baseMetadata = this.parseWebPageMetadata(html, url)

    // Extract Instagram-specific data
    const username = this.extractInstagramUsername(url, doc)
    const postType = this.extractInstagramPostType(url)

    return {
      ...baseMetadata,
      platform: 'instagram',
      username: username || undefined,
      postType: postType || undefined
    }
  }

  private getMetaContent(doc: Document, attribute: string, value: string): string {
    const element = doc.querySelector(`meta[${attribute}="${value}"]`)
    return element?.getAttribute('content')?.trim() || ''
  }

  private extractPublishedDate(doc: Document): Date | null {
    // Try various date selectors
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[name="publish-date"]',
      'time[datetime]',
      '.published-date',
      '.post-date'
    ]

    for (const selector of dateSelectors) {
      const element = doc.querySelector(selector)
      if (element) {
        const dateStr = element.getAttribute('content') || 
                       element.getAttribute('datetime') || 
                       element.textContent
        
        if (dateStr) {
          const date = new Date(dateStr.trim())
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
    }

    return null
  }

  private extractYouTubeVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return ''
  }

  private extractYouTubeChannelName(doc: Document): string | null {
    // Try various selectors for channel name
    const selectors = [
      'meta[name="author"]',
      'link[itemprop="name"]',
      '.ytd-channel-name a',
      '#channel-name .ytd-channel-name'
    ]

    for (const selector of selectors) {
      const element = doc.querySelector(selector)
      const content = element?.getAttribute('content') || element?.textContent
      if (content?.trim()) {
        return content.trim()
      }
    }

    return null
  }

  private extractYouTubeDuration(doc: Document): number | null {
    // Look for duration in various formats
    const durationSelectors = [
      'meta[itemprop="duration"]',
      '.ytp-time-duration',
      '.video-duration'
    ]

    for (const selector of durationSelectors) {
      const element = doc.querySelector(selector)
      const content = element?.getAttribute('content') || element?.textContent
      
      if (content) {
        const duration = this.parseDuration(content.trim())
        if (duration > 0) return duration
      }
    }

    return null
  }

  private extractYouTubeViewCount(doc: Document): number | null {
    const viewSelectors = [
      'meta[itemprop="interactionCount"]',
      '.view-count',
      '#count .ytd-video-view-count-renderer'
    ]

    for (const selector of viewSelectors) {
      const element = doc.querySelector(selector)
      const content = element?.getAttribute('content') || element?.textContent
      
      if (content) {
        const viewCount = this.parseViewCount(content.trim())
        if (viewCount > 0) return viewCount
      }
    }

    return null
  }

  private extractInstagramUsername(url: string, doc: Document): string | null {
    // Extract from URL first
    const urlMatch = url.match(/instagram\.com\/([^\/]+)/)
    if (urlMatch) return urlMatch[1]

    // Try to extract from HTML
    const usernameSelectors = [
      'meta[property="instapp:owner_user_id"]',
      '.username',
      'h1'
    ]

    for (const selector of usernameSelectors) {
      const element = doc.querySelector(selector)
      const content = element?.textContent?.trim()
      if (content && content.startsWith('@')) {
        return content.substring(1)
      }
    }

    return null
  }

  private extractInstagramPostType(url: string): string | null {
    if (url.includes('/reel/')) return 'reel'
    if (url.includes('/p/')) return 'post'
    if (url.includes('/tv/')) return 'igtv'
    return null
  }

  private parseDuration(durationStr: string): number {
    // Parse ISO 8601 duration (PT1M30S) or time format (1:30)
    if (durationStr.startsWith('PT')) {
      const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const hours = parseInt(match[1] || '0')
        const minutes = parseInt(match[2] || '0')
        const seconds = parseInt(match[3] || '0')
        return hours * 3600 + minutes * 60 + seconds
      }
    } else {
      // Parse MM:SS or HH:MM:SS format
      const parts = durationStr.split(':').map(p => parseInt(p))
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1] // MM:SS
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2] // HH:MM:SS
      }
    }

    return 0
  }

  private parseViewCount(viewStr: string): number {
    // Remove non-numeric characters except for K, M, B suffixes
    const cleaned = viewStr.replace(/[^\d.KMB]/gi, '')
    const match = cleaned.match(/^([\d.]+)([KMB])?/i)
    
    if (match) {
      const number = parseFloat(match[1])
      const suffix = match[2]?.toUpperCase()
      
      switch (suffix) {
        case 'K': return Math.floor(number * 1000)
        case 'M': return Math.floor(number * 1000000)
        case 'B': return Math.floor(number * 1000000000)
        default: return Math.floor(number)
      }
    }

    return 0
  }

  private resolveImageUrl(imageUrl: string, baseUrl: string): string {
    if (!imageUrl) return ''
    
    try {
      // If it's already a full URL, return as-is
      if (imageUrl.startsWith('http')) return imageUrl
      
      // If it's a protocol-relative URL
      if (imageUrl.startsWith('//')) {
        const protocol = new URL(baseUrl).protocol
        return `${protocol}${imageUrl}`
      }
      
      // If it's a relative URL, resolve against base URL
      return new URL(imageUrl, baseUrl).href
    } catch {
      return imageUrl
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      // Remove file extension and clean up
      const title = pathname
        .split('/')
        .pop()
        ?.replace(/\.[^.]*$/, '')
        ?.replace(/[-_]/g, ' ')
        ?.replace(/\b\w/g, l => l.toUpperCase())
      
      return title || urlObj.hostname
    } catch {
      return 'Web Page'
    }
  }

  private extractSiteNameFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname
      return hostname.replace(/^www\./, '')
    } catch {
      return 'Unknown Site'
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.options.retries!; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < this.options.retries!) {
          await this.delay(this.options.retryDelay! * Math.pow(2, attempt))
        }
      }
    }

    throw new Error(`Failed after ${this.options.retries! + 1} attempts: ${lastError?.message}`)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Factory method for creating extractors with different configurations
  static create(options?: ExtractorOptions): MetadataExtractionService {
    return new MetadataExtractionService(options)
  }

  // Utility method to determine which extractor to use based on URL
  static getExtractorType(url: string): 'youtube' | 'instagram' | 'webpage' {
    const lowerUrl = url.toLowerCase()
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube'
    }
    
    if (lowerUrl.includes('instagram.com')) {
      return 'instagram'
    }
    
    return 'webpage'
  }
}

// Create and export a default instance
export const metadataExtractor = MetadataExtractionService.create()

// Export the class for custom configurations
export { MetadataExtractionService }