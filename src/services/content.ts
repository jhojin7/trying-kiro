import { ContentItem, ContentType, SaveRequest } from '@/types'
import { storageService } from './storage'
import { metadataExtractor, MetadataExtractionService } from './metadata'
import { isValidUrl } from '@/utils'

class ContentService {
  async saveContent(request: SaveRequest): Promise<ContentItem> {
    const contentType = this.detectContentType(request)
    const metadata = await this.extractMetadata(request)
    
    const contentItem = {
      type: contentType,
      title: request.title || (metadata.title as string) || 'Untitled',
      content: request.content,
      url: request.url,
      thumbnail: metadata.image as string,
      metadata: metadata,
      tags: this.extractTags(request),
      syncStatus: 'local' as const
    }

    return storageService.saveContent(contentItem)
  }

  private detectContentType(request: SaveRequest): ContentType {
    if (request.files && request.files.length > 0) {
      const file = request.files[0]
      if (file.type.startsWith('image/')) return 'image'
      if (file.type.startsWith('video/')) return 'video'
    }

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

  private async extractMetadata(request: SaveRequest): Promise<Record<string, unknown>> {
    const metadata: Record<string, unknown> = {
      source: request.source || 'web',
      savedAt: new Date().toISOString()
    }

    if (request.url && isValidUrl(request.url)) {
      try {
        const extractorType = MetadataExtractionService.getExtractorType(request.url)
        let extractedMetadata

        switch (extractorType) {
          case 'youtube':
            extractedMetadata = await metadataExtractor.extractYouTube(request.url)
            break
          case 'instagram':
            extractedMetadata = await metadataExtractor.extractInstagram(request.url)
            break
          default:
            extractedMetadata = await metadataExtractor.extractWebPage(request.url)
        }

        // Merge extracted metadata with base metadata
        Object.assign(metadata, extractedMetadata)
      } catch (error) {
        // Fallback to basic metadata if extraction fails
        console.warn('Metadata extraction failed:', error)
        metadata.url = request.url
        metadata.title = request.title || this.extractTitleFromUrl(request.url)
        metadata.description = request.content || ''
        metadata.image = ''
        metadata.siteName = this.extractSiteNameFromUrl(request.url)
        metadata.extractionError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return metadata
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

  private extractTags(request: SaveRequest): string[] {
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
    }

    // Add content type tag
    const contentType = this.detectContentType(request)
    tags.push(contentType)

    return [...new Set(tags)] // Remove duplicates
  }

  async getContent(id: string): Promise<ContentItem | null> {
    return storageService.getContent(id)
  }

  async getAllContent(): Promise<ContentItem[]> {
    return storageService.getAllContent()
  }

  async searchContent(query: string): Promise<ContentItem[]> {
    return storageService.getAllContent({ searchQuery: query })
  }

  async getContentByType(type: ContentType): Promise<ContentItem[]> {
    return storageService.getAllContent({ type })
  }

  async deleteContent(id: string): Promise<void> {
    return storageService.deleteContent(id)
  }

  async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    return storageService.updateContent(id, updates)
  }
}

export const contentService = new ContentService()