# API Documentation

This directory contains comprehensive API documentation for Universal Pocket's service layer.

## Service APIs

### Core Services
- [Content Service](./content-service.md) - Content management and lifecycle
- [Storage Service](./storage-service.md) - Data persistence and retrieval
- [Metadata Service](./metadata-service.md) - Content metadata extraction
- [PWA Service](./pwa-service.md) - Progressive Web App features

### Service Architecture

All services follow a consistent pattern:
- **Singleton instances** exported from each service module
- **Promise-based APIs** for asynchronous operations
- **TypeScript interfaces** for all parameters and return types
- **Error handling** with meaningful error messages

### Usage Example

```typescript
import { contentService } from '@/services/content'
import { SaveRequest } from '@/types'

// Save content
const request: SaveRequest = {
  url: 'https://example.com/article',
  title: 'Example Article',
  source: 'web'
}

try {
  const savedContent = await contentService.saveContent(request)
  console.log('Content saved:', savedContent.id)
} catch (error) {
  console.error('Failed to save content:', error)
}
```

## Type Definitions

All services use shared type definitions from `@/types`:

- `ContentItem` - Core content data structure
- `SaveRequest` - Content saving parameters
- `ContentType` - Supported content types
- `ContentFilter` - Search and filtering options

## Error Handling

Services implement consistent error handling:
- **Validation errors** for invalid input
- **Network errors** for failed API calls
- **Storage errors** for persistence issues
- **Quota errors** for storage limitations

## Testing

All services include comprehensive test suites:
- **Unit tests** for individual methods
- **Integration tests** for service interactions
- **Mock implementations** for external dependencies