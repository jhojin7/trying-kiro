import { describe, it, expect, beforeEach, vi } from 'vitest'
import { contentService } from './content'
import { storageService } from './storage'

// Mock the storage service
vi.mock('./storage', () => ({
  storageService: {
    saveContent: vi.fn(),
    getContent: vi.fn(),
    getAllContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn()
  }
}))

// Mock the metadata extractor
vi.mock('./metadata', () => ({
  metadataExtractor: {
    extractWebPage: vi.fn(),
    extractYouTube: vi.fn(),
    extractInstagram: vi.fn()
  },
  MetadataExtractionService: {
    getExtractorType: vi.fn()
  }
}))

// Mock utils
vi.mock('../utils', () => ({
  isValidUrl: vi.fn((url: string) => /^https?:\/\//.test(url)),
  generateId: vi.fn(() => 'mock-id-' + Date.now())
}))

describe('ContentService - Save Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
  })

  describe('Offline Save Workflows', () => {
    it('should save content offline when network is unavailable', async () => {
      // Set offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false
      })

      const mockSavedItem = {
        id: 'test-id',
        type: 'article' as const,
        title: 'Test Article',
        url: 'https://example.com',
        createdAt: new Date(),
        syncStatus: 'pending' as const,
        metadata: {},
        tags: []
      }

      vi.mocked(storageService.saveContent).mockResolvedValue(mockSavedItem)

      const request = {
        url: 'https://example.com',
        title: 'Test Article',
        source: 'web' as const
      }

      const result = await contentService.saveContent(request)

      expect(result.syncStatus).toBe('pending')
      expect(result.metadata.offline).toBe(true)
      expect(result.metadata.extractionPending).toBe(true)
    })

    it('should queue items for metadata extraction when saved offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false })

      const mockSavedItem = {
        id: 'test-id',
        type: 'article' as const,
        title: 'Test Article',
        url: 'https://example.com',
        createdAt: new Date(),
        syncStatus: 'pending' as const,
        metadata: {},
        tags: []
      }

      vi.mocked(storageService.saveContent).mockResolvedValue(mockSavedItem)

      await contentService.saveContent({
        url: 'https://example.com',
        source: 'web' as const
      })

      const queueStatus = contentService.getOfflineQueueStatus()
      expect(queueStatus.count).toBe(1)
      expect(queueStatus.items[0].id).toBe('test-id')
    })
  })

  describe('Fallback Save Workflows', () => {
    it('should save with fallback when metadata extraction fails', async () => {
      const mockSavedItem = {
        id: 'test-id',
        type: 'article' as const,
        title: 'Fallback Title',
        url: 'https://example.com',
        createdAt: new Date(),
        syncStatus: 'local' as const,
        metadata: { extractionError: true },
        tags: []
      }

      vi.mocked(storageService.saveContent).mockResolvedValue(mockSavedItem)

      const result = await contentService.saveContent({
        url: 'https://example.com',
        source: 'web' as const
      })

      expect(result.metadata.extractionError).toBe(true)
      expect(result.syncStatus).toBe('local')
    })
  })

  describe('Queue Processing', () => {
    it('should process offline queue when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false })

      const mockSavedItem = {
        id: 'test-id',
        type: 'article' as const,
        title: 'Test Article',
        url: 'https://example.com',
        createdAt: new Date(),
        syncStatus: 'pending' as const,
        metadata: {},
        tags: []
      }

      vi.mocked(storageService.saveContent).mockResolvedValue(mockSavedItem)
      vi.mocked(storageService.getContent).mockResolvedValue(mockSavedItem)
      vi.mocked(storageService.updateContent).mockResolvedValue({
        ...mockSavedItem,
        syncStatus: 'local' as const
      })

      // Save while offline
      await contentService.saveContent({
        url: 'https://example.com',
        source: 'web' as const
      })

      expect(contentService.getOfflineQueueStatus().count).toBe(1)

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', { value: true })
      await contentService.forceProcessQueue()

      // Queue should be processed
      expect(vi.mocked(storageService.updateContent)).toHaveBeenCalled()
    })
  })
})