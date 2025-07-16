import React, { useState, useRef } from 'react'
import { SaveRequest, ContentType } from '../types'
import './SaveForm.css'

interface SaveFormProps {
  onSave: (request: SaveRequest) => Promise<void>
  isLoading?: boolean
}

export const SaveForm: React.FC<SaveFormProps> = ({ onSave, isLoading = false }) => {
  const [input, setInput] = useState('')
  const [title, setTitle] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detectContentType = (content: string): ContentType => {
    const urlPattern = /^https?:\/\//i
    if (!urlPattern.test(content)) return 'note'
    
    if (content.includes('youtube.com') || content.includes('youtu.be')) return 'video'
    if (content.includes('instagram.com')) return 'social'
    if (content.includes('twitter.com') || content.includes('x.com')) return 'social'
    
    return 'link'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return

    const isUrl = /^https?:\/\//i.test(input.trim())
    const saveRequest: SaveRequest = {
      [isUrl ? 'url' : 'content']: input.trim(),
      title: title.trim() || undefined,
      source: 'web'
    }

    try {
      await onSave(saveRequest)
      setInput('')
      setTitle('')
      setShowAdvanced(false)
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const saveRequest: SaveRequest = {
      files,
      title: title.trim() || undefined,
      source: 'web'
    }

    try {
      await onSave(saveRequest)
      setTitle('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to save files:', error)
    }
  }

  const contentType = input ? detectContentType(input) : null

  return (
    <form className="save-form" onSubmit={handleSubmit}>
      <div className="save-form__main">
        <div className="save-form__input-group">
          <textarea
            className="save-form__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a URL, write a note, or share your thoughts..."
            rows={3}
            disabled={isLoading}
          />
          {contentType && (
            <div className="save-form__type-indicator">
              <span className={`save-form__type-badge save-form__type-badge--${contentType}`}>
                {contentType}
              </span>
            </div>
          )}
        </div>

        <div className="save-form__actions">
          <button
            type="button"
            className="save-form__toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isLoading}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
          
          <button
            type="button"
            className="save-form__file-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            📎 Files
          </button>

          <button
            type="submit"
            className="save-form__submit"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="save-form__advanced">
          <input
            type="text"
            className="save-form__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Custom title (optional)"
            disabled={isLoading}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="save-form__file-input"
        onChange={handleFileSelect}
        multiple
        accept="image/*,video/*,.pdf,.txt,.md"
        disabled={isLoading}
      />
    </form>
  )
}