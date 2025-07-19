import { ContentItem, ContentType, SaveRequest } from '../types'
import { storageService } from './storage'
import { metadataExtractor, MetadataExtractionService } from './metadata'
import { isValidUrl } from '../utils'

interface QueuedSave {
  id: string
  request: SaveRequest
  timestamp: Date
  retryCount: number
}

class ContentService {
  private offlineQueue: QueuedSave[] = []
  private isOnline = navigator.onLine
  private processingQueue = false

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processOfflineQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async saveContent(request: SaveRequest): Promise<ContentItem> {
    try {
      const contentType = this.detectContentType(request)
      
      // For offline saves or when metadata extraction might fail
      if (!this.isOnline && request.url) {
        return this.saveOffline(request, contentType)
      }

      const metadata = await this.extractMetadata(request)
      
      const contentItem = {
        type: contentType,
        title: request.title || (metadata.title as string) || this.generateFallbackTitle(request),
        content: request.content,
        url: request.url,
        thumbnail: metadata.image as string,
        metadata: metadata,
        tags: this.extractTags(request, contentType),
        syncStatus: 'local' as const
      }

      return storageService.saveContent(contentItem)
    } catch (error) {
      console.warn('Metadata extraction failed, saving with basic info:', error)
      return this.saveFallback(request)
    }
  }

  private async saveOffline(request: SaveRequest, contentType: ContentType): Promise<ContentItem> {
    const contentItem = {
      type: contentType,
      title: request.title || this.generateFallbackTitle(request),
      content: request.content,
      url: request.url,
      thumbnail: '',
      metadata: {
        source: request.source || 'web',
        savedAt: new Date().toISOString(),
        offline: true,
        extractionPending: true
      },
      tags: this.extractTags(request, contentType),
      syncStatus: 'pending' as const
    }

    const savedItem = await storageService.saveContent(contentItem)
    
    // Queue for metadata extraction when online
    if (request.url) {
      this.offlineQueue.push({
        id: savedItem.id,
        request,
        timestamp: new Date(),
        retryCount: 0
      })
    }

    return savedItem
  }

  private async saveFallback(request: SaveRequest): Promise<ContentItem> {
    const contentType = this.detectContentType(request)
    
    const contentItem = {
      type: contentType,
      title: request.title || this.generateFallbackTitle(request),
      content: request.content,
      url: request.url,
      thumbnail: '',
      metadata: {
        source: request.source || 'web',
        savedAt: new Date().toISOString(),
        extractionError: true,
        url: request.url,
        siteName: request.url ? this.extractSiteNameFromUrl(request.url) : undefined
      },
      tags: this.extractTags(request, contentType),
      syncStatus: 'local' as const
    }

    return storageService.saveContent(contentItem)
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

  private async processOfflineQueue(): Promise<void> {
    if (this.processingQueue || this.offlineQueue.length === 0) return
    
    this.processingQueue = true
    
    try {
      const itemsToProcess = [...this.offlineQueue]
      this.offlineQueue = []

      for (const queuedItem of itemsToProcess) {
        try {
          await this.retryMetadataExtraction(queuedItem)
        } catch (error) {
          console.warn(`Failed to process queued item ${queuedItem.id}:`, error)
          
          // Re-queue if retry count is low
          if (queuedItem.retryCount < 3) {
            this.offlineQueue.push({
              ...queuedItem,
              retryCount: queuedItem.retryCount + 1
            })
          }
        }
      }
    } finally {
      this.processingQueue = false
    }
  }

  private async retryMetadataExtraction(queuedItem: QueuedSave): Promise<void> {
    const existingItem = await storageService.getContent(queuedItem.id)
    if (!existingItem || !queuedItem.request.url) return

    try {
      const metadata = await this.extractMetadata(queuedItem.request)
      
      const updatedItem = {
        ...existingItem,
        title: queuedItem.request.title || (metadata.title as string) || existingItem.title,
        thumbnail: metadata.image as string || existingItem.thumbnail,
        metadata: {
          ...metadata,
          source: queuedItem.request.source || 'web',
          savedAt: existingItem.createdAt.toISOString(),
          offline: false,
          extractionPending: false
        },
        syncStatus: 'local' as const
      }

      await storageService.updateContent(queuedItem.id, updatedItem)
    } catch (error) {
      // Update to show extraction failed but keep the item
      const updatedItem = {
        ...existingItem,
        metadata: {
          ...existingItem.metadata,
          extractionError: true,
          extractionPending: false,
          lastRetry: new Date().toISOString()
        }
      }
      
      await storageService.updateContent(queuedItem.id, updatedItem)
      throw error
    }
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
    try {
      // Get the item first to perform cleanup
      const item = await storageService.getContent(id)
      if (!item) {
        throw new Error(`Content with id ${id} not found`)
      }

      // Remove from offline queue if present
      this.offlineQueue = this.offlineQueue.filter(queued => queued.id !== id)

      // Perform the deletion
      await storageService.deleteContent(id)

      // Additional cleanup could be added here (e.g., clearing cached thumbnails)
      console.log(`Successfully deleted content: ${item.title}`)
    } catch (error) {
      console.error(`Failed to delete content with id ${id}:`, error)
      throw error
    }
  }

  async deleteMultipleContent(ids: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] }
    
    for (const id of ids) {
      try {
        await this.deleteContent(id)
        results.success.push(id)
      } catch (error) {
        console.error(`Failed to delete content ${id}:`, error)
        results.failed.push(id)
      }
    }

    return results
  }

  async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    return storageService.updateContent(id, updates)
  }

  // Queue management methods
  getOfflineQueueStatus(): { count: number, items: QueuedSave[] } {
    return {
      count: this.offlineQueue.length,
      items: [...this.offlineQueue]
    }
  }

  async forceProcessQueue(): Promise<void> {
    if (this.isOnline) {
      await this.processOfflineQueue()
    }
  }

  clearOfflineQueue(): void {
    this.offlineQueue = []
  }

  // Utility methods for testing and debugging
  isOnlineStatus(): boolean {
    return this.isOnline
  }

  async retryFailedExtractions(): Promise<void> {
    const allContent = await this.getAllContent()
    const failedItems = allContent.filter(item => 
      item.metadata.extractionError || item.metadata.extractionPending
    )

    for (const item of failedItems) {
      if (item.url) {
        try {
          const metadata = await this.extractMetadata({ url: item.url, source: 'web' })
          await this.updateContent(item.id, {
            thumbnail: metadata.image as string || item.thumbnail,
            metadata: {
              ...metadata,
              source: item.metadata.source,
              savedAt: item.createdAt.toISOString(),
              offline: false,
              extractionPending: false,
              extractionError: false
            }
          })
        } catch (error) {
          console.warn(`Failed to retry extraction for ${item.id}:`, error)
        }
      }
    }
  }
}

export const contentService = new ContentService()