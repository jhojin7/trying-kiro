import React from 'react'
import { ContentItem, ContentType } from '../types'
import './ContentCard.css'

interface ContentCardProps {
  item: ContentItem
  onDelete: (id: string) => void
  onOpen: (item: ContentItem) => void
  viewMode?: 'grid' | 'list'
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  item, 
  onDelete, 
  onOpen, 
  viewMode = 'grid' 
}) => {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'video': return '🎥'
      case 'article': return '📄'
      case 'social': return '💬'
      case 'note': return '📝'
      case 'image': return '🖼️'
      case 'link': return '🔗'
      default: return '📄'
    }
  }

  const getThumbnail = () => {
    if (item.thumbnail) {
      return (
        <img 
          src={item.thumbnail} 
          alt={item.title}
          className="content-card__thumbnail"
          loading="lazy"
        />
      )
    }
    
    return (
      <div className="content-card__thumbnail-placeholder">
        <span className="content-card__type-icon">
          {getTypeIcon(item.type)}
        </span>
      </div>
    )
  }

  const getPreviewText = () => {
    if (item.content) {
      return item.content.length > 150 
        ? `${item.content.substring(0, 150)}...`
        : item.content
    }
    
    if (item.metadata.description) {
      const desc = String(item.metadata.description)
      return desc.length > 150 
        ? `${desc.substring(0, 150)}...`
        : desc
    }
    
    return item.url || 'No preview available'
  }

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on delete button
    if ((e.target as HTMLElement).closest('.content-card__delete')) {
      return
    }
    onOpen(item)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete(item.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(item)
    }
  }

  return (
    <article 
      className={`content-card content-card--${viewMode} content-card--${item.type}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${item.title}`}
    >
      <div className="content-card__thumbnail-container">
        {getThumbnail()}
        <div className="content-card__type-badge">
          {item.type}
        </div>
        <div className="content-card__sync-status">
          {item.syncStatus === 'pending' && (
            <span className="content-card__sync-indicator" title="Syncing...">⏳</span>
          )}
          {item.syncStatus === 'local' && (
            <span className="content-card__sync-indicator" title="Local only">📱</span>
          )}
        </div>
      </div>

      <div className="content-card__content">
        <header className="content-card__header">
          <h3 className="content-card__title">{item.title}</h3>
          <button
            className="content-card__delete"
            onClick={handleDelete}
            aria-label={`Delete ${item.title}`}
            title="Delete item"
          >
            ✕
          </button>
        </header>

        <p className="content-card__preview">
          {getPreviewText()}
        </p>

        <footer className="content-card__footer">
          <time className="content-card__date" dateTime={item.createdAt.toISOString()}>
            {formatDate(item.createdAt)}
          </time>
          
          {item.tags.length > 0 && (
            <div className="content-card__tags">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="content-card__tag">
                  #{tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="content-card__tag-more">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </footer>
      </div>
    </article>
  )
}