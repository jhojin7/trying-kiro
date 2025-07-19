# Architecture

## System Overview

Universal Pocket follows a service-layer architecture pattern that separates concerns between UI components, business logic, and data persistence. This design ensures maintainability, testability, and scalability.

## Core Principles

### Service Layer Architecture
- **Components** handle UI and user interaction only
- **Services** contain all business logic and data operations
- **Clear boundaries** between presentation and business logic
- **Dependency injection** for service composition

### Type Safety
- Strict TypeScript configuration with no `any` types
- Comprehensive type definitions for all data structures
- Runtime type validation at service boundaries
- Interface-driven development
## D
irectory Structure

```
src/
├── components/     # React UI components
│   ├── ContentCard.tsx
│   ├── ContentList.tsx
│   ├── SaveForm.tsx
│   ├── PWAInstallPrompt.tsx
│   └── ShareTargetHandler.tsx
├── services/       # Business logic services
│   ├── content.ts      # Content management
│   ├── storage.ts      # Data persistence
│   ├── metadata.ts     # Metadata extraction
│   └── pwa.ts         # PWA functionality
├── types/          # TypeScript definitions
│   └── index.ts       # Core type definitions
├── utils/          # Pure utility functions
│   └── index.ts       # Helper functions
└── test/           # Test setup and utilities
    └── setup.ts       # Test configuration
```

## Service Layer Design

### Content Service (`content.ts`)
**Responsibility**: Content lifecycle management
- Content saving and validation
- Offline queue management
- Metadata extraction coordination
- Content type detection
- Tag generation and management

**Key Features**:
- Offline-first architecture with queue management
- Automatic retry mechanisms for failed operations
- Smart content type detection
- Metadata extraction with fallback strategies

### Storage Service (`storage.ts`)
**Responsibility**: Data persistence and retrieval
- IndexedDB operations
- Content CRUD operations
- Search and filtering
- Storage quota management
- Batch operations for performance

**Key Features**:
- IndexedDB wrapper with Promise-based API
- Storage quota monitoring and management
- Efficient batch operations
- Search and filtering capabilities### M
etadata Service (`metadata.ts`)
**Responsibility**: Content metadata extraction
- Web page metadata extraction
- Platform-specific extractors (YouTube, Instagram, etc.)
- Fallback strategies for failed extractions
- Rich preview generation

**Key Features**:
- Extensible extractor system
- Platform-specific optimizations
- Error handling and fallbacks
- Caching for performance

### PWA Service (`pwa.ts`)
**Responsibility**: Progressive Web App features
- Service worker management
- Installation prompts
- Update notifications
- Background sync coordination

## Component Architecture

### Component Hierarchy
```
App
├── ShareTargetHandler (handles shared content)
├── SaveForm (content input)
├── ContentList (content display)
│   └── ContentCard (individual items)
└── PWAInstallPrompt (installation UI)
```

### Component Design Patterns

#### Functional Components with Hooks
All components use React functional components with hooks for state management:

```typescript
interface ComponentProps {
  // Properly typed props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<StateType>(initialState)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  return <div>{/* JSX */}</div>
}
```

#### Service Integration
Components interact with services through dependency injection:

```typescript
import { contentService } from '@/services/content'

export function SaveForm() {
  const handleSave = async (request: SaveRequest) => {
    await contentService.saveContent(request)
  }
  
  // Component implementation
}
```
## 
Data Flow

### Content Saving Flow
1. **User Input** → SaveForm component receives content
2. **Validation** → Content service validates and processes request
3. **Type Detection** → Automatic content type identification
4. **Metadata Extraction** → Background metadata fetching
5. **Storage** → Persistent storage via storage service
6. **UI Update** → Optimistic UI updates

### Offline Handling
1. **Queue Management** → Failed operations queued for retry
2. **Background Sync** → Automatic processing when online
3. **Conflict Resolution** → Smart merging of offline/online changes

## Technology Stack

### Frontend Framework
- **React 18** with functional components and hooks
- **TypeScript** with strict configuration
- **Vite** for fast development and optimized builds
- **CSS** with component-scoped styling

### PWA Technologies
- **Vite PWA Plugin** for service worker generation
- **Workbox** for advanced caching strategies
- **Web Share API** for native sharing integration
- **IndexedDB** for client-side data persistence

### Development Tools
- **Vitest** for unit testing
- **React Testing Library** for component testing
- **ESLint** with TypeScript rules
- **Path aliases** for clean imports

## Performance Considerations

### Lazy Loading
- Components loaded on demand
- Service initialization deferred until needed
- Metadata extraction performed in background

### Caching Strategy
- **Service Worker** caches static assets
- **IndexedDB** provides offline data access
- **Memory caching** for frequently accessed data

### Optimization Techniques
- **Debounced search** to reduce API calls
- **Batch operations** for multiple content items
- **Optimistic updates** for immediate UI feedback