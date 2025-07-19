# Component Documentation

This directory contains documentation for all React components in Universal Pocket.

## Component Architecture

Universal Pocket uses a functional component architecture with React hooks for state management and TypeScript for type safety.

## Component Categories

### Core Components
- [App](./App.md) - Main application component
- [SaveForm](./SaveForm.md) - Content input and saving
- [ContentList](./ContentList.md) - Content display and management
- [ContentCard](./ContentCard.md) - Individual content item display

### PWA Components
- [PWAInstallPrompt](./PWAInstallPrompt.md) - App installation prompt
- [ShareTargetHandler](./ShareTargetHandler.md) - Web Share API integration

## Design Patterns

### Functional Components with Hooks

All components follow this pattern:

```typescript
interface ComponentProps {
  // Typed props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // State management with hooks
  const [state, setState] = useState<StateType>(initialValue)
  
  // Side effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])
  
  // Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies])
  
  return (
    <div className="component">
      {/* JSX content */}
    </div>
  )
}
```

### Service Integration

Components interact with services through dependency injection:

```typescript
import { contentService } from '@/services/content'

export function MyComponent() {
  const handleAction = async () => {
    try {
      await contentService.performAction()
    } catch (error) {
      // Error handling
    }
  }
  
  return <button onClick={handleAction}>Action</button>
}
```

### Props and State Management

- **Props** are fully typed with TypeScript interfaces
- **State** uses React hooks with proper typing
- **Event handlers** are memoized with useCallback
- **Side effects** are managed with useEffect

## Styling Approach

Each component has its own CSS file:

```
src/components/
├── Component.tsx
└── Component.css
```

CSS follows these conventions:
- **BEM methodology** for class naming
- **Component-scoped** styles
- **Responsive design** with mobile-first approach
- **CSS custom properties** for theming

## Testing Components

Components are tested using React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Component } from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', () => {
    const mockHandler = vi.fn()
    render(<Component onAction={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

## Accessibility

All components follow accessibility best practices:
- **Semantic HTML** elements
- **ARIA labels** and roles
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management**

## Performance Considerations

- **Memoization** with React.memo for expensive renders
- **Callback memoization** with useCallback
- **Effect optimization** with proper dependencies
- **Lazy loading** for large components