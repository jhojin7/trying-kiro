import { ContentItem, ContentFilter } from '../types'
import { generateId } from '../utils'

// IndexedDB database configuration
const DB_NAME = 'UniversalPocketDB'
const DB_VERSION = 1
const STORE_NAME = 'content'

export interface StorageQuota {
  used: number
  available: number
  percentage: number
}

export interface StorageStats {
  totalItems: number
  itemsByType: Record<string, number>
  quota: StorageQuota
}

class StorageService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._init()
    return this.initPromise
  }

  private async _init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
      }
    })
  }

  async saveContent(item: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem> {
    if (!this.db) await this.init()

    const contentItem: ContentItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      syncStatus: 'local'
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(contentItem)

      request.onsuccess = () => resolve(contentItem)
      request.onerror = () => reject(request.error)
    })
  }

  async getContent(id: string): Promise<ContentItem | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllContent(filter?: ContentFilter): Promise<ContentItem[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        let results = request.result as ContentItem[]
        
        // Apply filters
        if (filter) {
          if (filter.type) {
            results = results.filter(item => item.type === filter.type)
          }
          if (filter.tags && filter.tags.length > 0) {
            results = results.filter(item => 
              filter.tags!.some(tag => item.tags.includes(tag))
            )
          }
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase()
            results = results.filter(item =>
              item.title.toLowerCase().includes(query) ||
              (item.content && item.content.toLowerCase().includes(query))
            )
          }
        }

        // Sort by creation date (newest first)
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    if (!this.db) await this.init()

    const existing = await this.getContent(id)
    if (!existing) {
      throw new Error(`Content with id ${id} not found`)
    }

    const updated = { ...existing, ...updates }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(updated)

      request.onsuccess = () => resolve(updated)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteContent(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getStorageStats(): Promise<StorageStats> {
    if (!this.db) await this.init()

    const items = await this.getAllContent()
    const quota = await this.getStorageQuota()
    
    const itemsByType: Record<string, number> = {}
    items.forEach(item => {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1
    })

    return {
      totalItems: items.length,
      itemsByType,
      quota
    }
  }

  async getStorageQuota(): Promise<StorageQuota> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const available = estimate.quota || 0
        const percentage = available > 0 ? (used / available) * 100 : 0

        return { used, available, percentage }
      }
    } catch (error) {
      console.warn('Storage quota estimation not available:', error)
    }

    // Fallback for browsers that don't support storage estimation
    return { used: 0, available: 0, percentage: 0 }
  }

  async checkStorageSpace(): Promise<boolean> {
    const quota = await this.getStorageQuota()
    // Consider storage full if over 90% used
    return quota.percentage < 90
  }

  async saveContentWithQuotaCheck(item: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem> {
    const hasSpace = await this.checkStorageSpace()
    if (!hasSpace) {
      throw new Error('Storage quota exceeded. Please delete some items to free up space.')
    }

    return this.saveContent(item)
  }

  // Batch operations for better performance
  async saveMultipleContent(items: Omit<ContentItem, 'id' | 'createdAt'>[]): Promise<ContentItem[]> {
    if (!this.db) await this.init()

    const contentItems: ContentItem[] = items.map(item => ({
      ...item,
      id: generateId(),
      createdAt: new Date(),
      syncStatus: 'local'
    }))

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const results: ContentItem[] = []

      transaction.oncomplete = () => resolve(results)
      transaction.onerror = () => reject(transaction.error)

      contentItems.forEach((item, index) => {
        const request = store.add(item)
        request.onsuccess = () => {
          results[index] = item
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async deleteMultipleContent(ids: string[]): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      ids.forEach(id => {
        const request = store.delete(id)
        request.onsuccess = () => {
          // Delete completed successfully
        }
        request.onerror = () => reject(request.error)
      })
    })
  }
}

// Export singleton instance
export const storageService = new StorageService()