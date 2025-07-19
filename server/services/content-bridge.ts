import { ContentItem, SaveRequest, ContentType } from '../../src/types'

// Mock for server environment - simple in-memory storage for now
// In production, this would connect to the same storage as the web app

class ContentBridge {
  private items: ContentItem[] = []

  async saveContent(request: SaveRequest): Promise<ContentItem> {
    const contentType = this.detectContentType(request)
    
    const contentItem: ContentItem = {
      id: this.generateId(),
      type: contentType,
      title: request.title || this.generateFallbackTitle(request),
      content: request.content,
      url: request.url,
      thumbnail: '',
      metadata: {
        source: request.source || 'raycast',
        savedAt: new Date().toISOString()
      },
      tags: this.extractTags(request, contentType),
      createdAt: new Date(),
      syncStatus: 'local' as const
    }

    this.items.unshift(contentItem)
    return contentItem
  }

  async getAllContent(): Promise<ContentItem[]> {
    return [...this.items]
  }

  async getContent(id: string): Promise<ContentItem | null> {
    return this.items.find(item => item.id === id) || null
  }

  async deleteContent(id: string): Promise<void> {
    const index = this.items.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Content with id ${id} not found`)
    }
    this.items.splice(index, 1)
  }

  async searchContent(query: string): Promise<ContentItem[]> {
    const lowerQuery = query.toLowerCase()
    return this.items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.content && item.content.toLowerCase().includes(lowerQuery)) ||
      (item.url && item.url.toLowerCase().includes(lowerQuery))
    )
  }

  async getContentByType(type: ContentType): Promise<ContentItem[]> {
    return this.items.filter(item => item.type === type)
  }

  async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    const index = this.items.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Content with id ${id} not found`)
    }
    
    this.items[index] = { ...this.items[index], ...updates }
    return this.items[index]
  }

  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private detectContentType(request: SaveRequest): ContentType {
    if (request.url) {
      const url = request.url.toLowerCase()
      
      // Video platforms
      if (url.includes('youtube.com') || url.includes('youtu.be') || 
          url.includes('vimeo.com') || url.includes('twitch.tv')) {
        return 'video'
      }
      
      // Social platforms
      if (url.includes('twitter.com') || url.includes('x.com') ||
          url.includes('instagram.com') || url.includes('tiktok.com') ||
          url.includes('linkedin.com')) {
        return 'social'
      }
      
      // Default to article for URLs
      return 'article'
    }

    // If it's just text content without URL
    if (request.content && !request.url) {
      return 'note'
    }

    return 'link'
  }

  private generateFallbackTitle(request: SaveRequest): string {
    if (request.title) return request.title
    if (request.content) {
      // Use first 50 characters of content as title
      return request.content.length > 50 
        ? `${request.content.substring(0, 50)}...`
        : request.content
    }
    if (request.url) return this.extractTitleFromUrl(request.url)
    return 'Untitled'
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

  private extractTags(request: SaveRequest, contentType?: ContentType): string[] {
    const tags: string[] = []

    // Add source tag
    if (request.source) {
      tags.push(request.source)
    }

    // Add platform-specific tags based on URL
    if (request.url) {
      const url = request.url.toLowerCase()
      if (url.includes('youtube.com')) tags.push('youtube')
      if (url.includes('twitter.com') || url.includes('x.com')) tags.push('twitter')
      if (url.includes('instagram.com')) tags.push('instagram')
      if (url.includes('github.com')) tags.push('github')
      if (url.includes('reddit.com')) tags.push('reddit')
      if (url.includes('medium.com')) tags.push('medium')
      if (url.includes('dev.to')) tags.push('dev')
    }

    // Add content type tag
    const type = contentType || this.detectContentType(request)
    tags.push(type)

    return [...new Set(tags)] // Remove duplicates
  }
}

export const contentBridge = new ContentBridge()