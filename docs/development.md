# Development Guide

This guide covers development workflows, best practices, and coding standards for Universal Pocket.

## Development Workflow

### Setting Up Your Environment

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd universal-pocket
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests in Watch Mode**
   ```bash
   npm run test:watch
   ```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Critical bug fixes

### Commit Convention

Use conventional commits for clear history:

```bash
feat: add content sharing functionality
fix: resolve offline sync issue
docs: update API documentation
test: add content service tests
refactor: improve metadata extraction
```

## Coding Standards

### TypeScript Guidelines

#### Strict Typing
```typescript
// ✅ Good - Explicit typing
interface UserData {
  id: string
  name: string
  email: string
}

// ❌ Bad - Using any
const userData: any = fetchUserData()
```

#### Interface Definitions
```typescript
// ✅ Good - Clear interface
interface SaveFormProps {
  onSave: (request: SaveRequest) => Promise<void>
  isLoading: boolean
  initialData?: Partial<SaveRequest>
}

// ❌ Bad - Inline types
function SaveForm(props: {
  onSave: (request: any) => void
  isLoading: boolean
}) {
  // Component implementation
}
```

#### Path Aliases
```typescript
// ✅ Good - Use path aliases
import { ContentItem } from '@/types'
import { contentService } from '@/services/content'

// ❌ Bad - Relative imports
import { ContentItem } from '../../../types'
import { contentService } from '../../services/content'
```

### React Component Guidelines

#### Functional Components
```typescript
// ✅ Good - Functional component with hooks
export function ContentCard({ item, onDelete }: ContentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      await onDelete(item.id)
    } finally {
      setIsDeleting(false)
    }
  }, [item.id, onDelete])
  
  return (
    <div className="content-card">
      {/* Component JSX */}
    </div>
  )
}
```

#### Props Interface
```typescript
// ✅ Good - Separate props interface
interface ContentCardProps {
  item: ContentItem
  onDelete: (id: string) => Promise<void>
  onOpen: (item: ContentItem) => void
  className?: string
}

export function ContentCard(props: ContentCardProps) {
  // Component implementation
}
```

### Service Layer Guidelines

#### Service Structure
```typescript
// ✅ Good - Service class with singleton export
class ContentService {
  private offlineQueue: QueuedSave[] = []
  
  async saveContent(request: SaveRequest): Promise<ContentItem> {
    // Implementation
  }
  
  async getContent(id: string): Promise<ContentItem | null> {
    // Implementation
  }
}

export const contentService = new ContentService()
```

#### Error Handling
```typescript
// ✅ Good - Comprehensive error handling
async saveContent(request: SaveRequest): Promise<ContentItem> {
  try {
    const contentItem = await this.processContent(request)
    return await storageService.saveContent(contentItem)
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Invalid content: ${error.message}`)
    } else if (error instanceof NetworkError) {
      // Queue for offline processing
      return this.saveOffline(request)
    } else {
      throw new Error(`Failed to save content: ${error.message}`)
    }
  }
}
```

## Testing Best Practices

### Unit Testing Services

```typescript
// ✅ Good - Comprehensive service testing
describe('ContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('saveContent', () => {
    it('should save content with metadata', async () => {
      const request: SaveRequest = {
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const result = await contentService.saveContent(request)
      
      expect(result.id).toBeDefined()
      expect(result.title).toBe('Test Article')
      expect(result.type).toBe('article')
    })
    
    it('should handle offline saving', async () => {
      // Mock offline state
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      
      const request: SaveRequest = { url: 'https://example.com' }
      const result = await contentService.saveContent(request)
      
      expect(result.syncStatus).toBe('pending')
    })
  })
})
```

### Component Testing

```typescript
// ✅ Good - Component testing with user interactions
describe('SaveForm', () => {
  it('should submit form with valid data', async () => {
    const mockSave = vi.fn().mockResolvedValue({})
    
    render(<SaveForm onSave={mockSave} isLoading={false} />)
    
    await user.type(screen.getByLabelText('URL'), 'https://example.com')
    await user.type(screen.getByLabelText('Title'), 'Test Title')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    
    expect(mockSave).toHaveBeenCalledWith({
      url: 'https://example.com',
      title: 'Test Title',
      source: 'web'
    })
  })
})
```

## Performance Guidelines

### Component Optimization

```typescript
// ✅ Good - Memoized component
export const ContentCard = React.memo(function ContentCard({ 
  item, 
  onDelete, 
  onOpen 
}: ContentCardProps) {
  const handleDelete = useCallback(() => {
    onDelete(item.id)
  }, [item.id, onDelete])
  
  return (
    <div className="content-card">
      {/* Component content */}
    </div>
  )
})
```

### Service Optimization

```typescript
// ✅ Good - Batch operations
async saveMultipleContent(requests: SaveRequest[]): Promise<ContentItem[]> {
  // Process in batches to avoid overwhelming the system
  const batchSize = 10
  const results: ContentItem[] = []
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(request => this.saveContent(request))
    )
    results.push(...batchResults)
  }
  
  return results
}
```

## Code Review Checklist

### Before Submitting PR

- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code follows established patterns
- [ ] New features have tests
- [ ] Documentation updated if needed

### Review Criteria

- **Functionality** - Does the code work as intended?
- **Type Safety** - Are all types properly defined?
- **Performance** - Are there any performance concerns?
- **Testing** - Is the code adequately tested?
- **Maintainability** - Is the code easy to understand and modify?
- **Security** - Are there any security vulnerabilities?

## Debugging

### Browser DevTools

1. **React DevTools** - Component inspection and profiling
2. **Application Tab** - Service worker and storage inspection
3. **Network Tab** - API calls and caching behavior
4. **Console** - Error messages and debugging output

### Common Issues

#### Service Worker Problems
```bash
# Clear service worker cache
# In DevTools: Application → Storage → Clear Storage
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

#### Test Failures
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- src/services/content.test.ts
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### PWA Verification

1. **Lighthouse Audit** - Check PWA score
2. **Service Worker** - Verify registration and caching
3. **Manifest** - Validate PWA manifest
4. **Installation** - Test app installation flow

### Environment Variables

```bash
# Development
VITE_API_URL=http://localhost:3000

# Production
VITE_API_URL=https://api.universalpocket.com
```