import { describe, it, expect } from 'vitest'
import { generateId, isValidUrl, formatDate, truncateText } from './index'

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('isValidUrl', () => {
    it('validates correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://test.org')).toBe(true)
      expect(isValidUrl('https://youtube.com/watch?v=123')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('just text')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Jan 15, 2024/)
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated'
      const truncated = truncateText(longText, 20)
      expect(truncated).toBe('This is a very long...')
      expect(truncated.length).toBeLessThanOrEqual(23) // 20 + '...'
    })

    it('keeps short text unchanged', () => {
      const shortText = 'Short text'
      const result = truncateText(shortText, 20)
      expect(result).toBe(shortText)
    })
  })
})