// Core type definitions for Universal Pocket

export type ContentType = 'article' | 'video' | 'social' | 'note' | 'link' | 'image'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  content?: string
  url?: string
  thumbnail?: string
  metadata: Record<string, unknown>
  tags: string[]
  createdAt: Date
  syncStatus: 'local' | 'synced' | 'pending'
}

export interface WebPageMetadata {
  title: string
  description: string
  image: string
  siteName: string
  author?: string
  publishedDate?: Date
}

export interface VideoMetadata extends WebPageMetadata {
  duration: number
  channelName: string
  viewCount?: number
  embedUrl: string
}

export interface SocialMetadata extends WebPageMetadata {
  platform: string
  username?: string
  postType?: string
}

export interface ContentFilter {
  type?: ContentType
  tags?: string[]
  searchQuery?: string
}

export interface SaveRequest {
  content?: string
  url?: string
  title?: string
  files?: File[]
  source?: 'web' | 'raycast' | 'share' | 'bookmarklet'
}