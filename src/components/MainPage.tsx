import { useState, useEffect } from 'react'
import { ContentItem, SaveRequest } from '../types'
import { contentService } from '../services/content'
import { SaveForm } from './SaveForm'
import { ContentList } from './ContentList'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { ShareTargetHandler } from './ShareTargetHandler'
import { Bookmarklet } from './Bookmarklet'
import { ShareGuide } from './ShareGuide'

export function MainPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load content on app start
  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      const content = await contentService.getAllContent()
      setItems(content)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (request: SaveRequest) => {
    try {
      setIsSaving(true)
      const newItem = await contentService.saveContent(request)
      setItems(prev => [newItem, ...prev])
    } catch (error) {
      console.error('Failed to save content:', error)
      throw error // Re-throw to let SaveForm handle the error
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await contentService.deleteContent(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete content:', error)
    }
  }

  const handleOpen = (item: ContentItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    } else {
      // For notes or content without URLs, we could open a modal or detail view
      console.log('Opening item:', item)
    }
  }

  const handleContentShared = (content: ContentItem) => {
    // Add shared content to the list
    setItems(prev => [content, ...prev])
  }

  return (
    <div className="app">
      {/* Handle shared content from other apps */}
      <ShareTargetHandler onContentShared={handleContentShared} />
      
      <header className="app-header">
        <h1>Universal Pocket</h1>
        <p>Save and organize content from anywhere</p>
      </header>

      <main className="app-main">
        <section className="app-save-section">
          <SaveForm onSave={handleSave} isLoading={isSaving} />
          <ShareGuide />
          <Bookmarklet />
        </section>

        <section className="app-content-section">
          <ContentList
            items={items}
            onDelete={handleDelete}
            onOpen={handleOpen}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* PWA Installation Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}