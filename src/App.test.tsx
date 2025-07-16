import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Universal Pocket')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<App />)
    expect(screen.getByText('Save and organize content from anywhere')).toBeInTheDocument()
  })

  it('shows ready for implementation message', () => {
    render(<App />)
    expect(screen.getByText('Ready for implementation...')).toBeInTheDocument()
  })
})