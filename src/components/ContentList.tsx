import React, { useState, useMemo } from 'react'
import { ContentItem, ContentType, ContentFilter } from '../types'
import { ContentCard } from './ContentCard'
import './ContentList.css'

interface ContentListProps {
  items: ContentItem[]
  onDelete: (id: string) => void
  onOpen: (item: ContentItem) => void
  isLoading?: boolean
}

export const ContentList: React.FC<ContentListProps> = ({ 
  items, 
  onDelete, 
  onOpen, 
  isLoading = false 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<ContentFilter>({})
  const [searchQuery, setSearchQuery] = useState('')

  const contentTypes: (ContentType | 'all')[] = ['all', 'note', 'link', 'article', 'video', 'social', 'image']

  const filteredItems = useMemo(() => {
    let filtered = [...items]

    // Filter by type
    if (filter.type) {
      filtered = filtered.filter(item => item.type === filter.type)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.url?.toLowerCase().includes(query)
      )
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return filtered
  }, [items, filter, searchQuery])

  const getTypeCount = (type: ContentType | 'all') => {
    if (type === 'all') return items.length
    return items.filter(item => item.type === type).length
  }

  const getTypeIcon = (type: ContentType | 'all') => {
    switch (type) {
      case 'all': return '📚'
      case 'video': return '🎥'
      case 'article': return '📄'
      case 'social': return '💬'
      case 'note': return '📝'
      case 'image': return '🖼️'
      case 'link': return '🔗'
      default: return '📄'
    }
  }

  const handleTypeFilter = (type: ContentType | 'all') => {
    setFilter(prev => ({
      ...prev,
      type: type === 'all' ? undefined : type
    }))
  }

  if (isLoading) {
    return (
      <div className="content-list">
        <div className="content-list__loading">
          <div className="content-list__spinner"></div>
          <p>Loading your content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="content-list">
      <header className="content-list__header">
        <div className="content-list__search">
          <input
            type="text"
            className="content-list__search-input"
            placeholder="Search your content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="content-list__controls">
          <div className="content-list__view-toggle">
            <button
              className={`content-list__view-button ${viewMode === 'grid' ? 'content-list__view-button--active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              ⊞
            </button>
            <button
              className={`content-list__view-button ${viewMode === 'list' ? 'content-list__view-button--active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <nav className="content-list__filters">
        <div className="content-list__filter-tabs">
          {contentTypes.map(type => (
            <button
              key={type}
              className={`content-list__filter-tab ${
                (type === 'all' && !filter.type) || filter.type === type 
                  ? 'content-list__filter-tab--active' 
                  : ''
              }`}
              onClick={() => handleTypeFilter(type)}
            >
              <span className="content-list__filter-icon">
                {getTypeIcon(type)}
              </span>
              <span className="content-list__filter-label">
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <span className="content-list__filter-count">
                {getTypeCount(type)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <main className="content-list__main">
        {filteredItems.length === 0 ? (
          <div className="content-list__empty">
            {items.length === 0 ? (
              <>
                <div className="content-list__empty-icon">📚</div>
                <h3>No content saved yet</h3>
                <p>Start by saving your first URL, note, or file above!</p>
              </>
            ) : (
              <>
                <div className="content-list__empty-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        ) : (
          <div className={`content-list__grid content-list__grid--${viewMode}`}>
            {filteredItems.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                onDelete={onDelete}
                onOpen={onOpen}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </main>

      {filteredItems.length > 0 && (
        <footer className="content-list__footer">
          <p className="content-list__stats">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </footer>
      )}
    </div>
  )
}