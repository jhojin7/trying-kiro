# Project Overview

## Universal Pocket

Universal Pocket is a modern read-later bookmarking application designed for seamless content capture across all platforms and content types. Built as a Progressive Web App (PWA), it provides a native app-like experience while maintaining web accessibility.

## Core Purpose

Save and organize any type of content - articles, videos, social media posts, notes, images - with a single action from anywhere, on any device.

## Key Features

### 🌐 Universal Content Capture
- **Multi-format Support**: Text, URLs, videos, social media, files
- **Smart Detection**: Automatic content type identification
- **Metadata Extraction**: Rich preview generation with titles, descriptions, and thumbnails
- **Offline Capture**: Save content even without internet connection

### 📱 Cross-Platform Access
- **Progressive Web App**: Installable on any device
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Native Integration**: Web Share API support for seamless sharing
- **Raycast Extension**: Quick capture from macOS

### 🔄 Offline-First Architecture
- **Local Storage**: IndexedDB for reliable local data persistence
- **Background Sync**: Automatic metadata extraction when online
- **Queue Management**: Intelligent retry mechanisms for failed operations
- **Conflict Resolution**: Smart handling of offline/online state changes

### 🏷️ Smart Organization
- **Auto-tagging**: Platform and source-based tag generation
- **Content Types**: Automatic categorization (article, video, social, note, link, image)
- **Search**: Full-text search across titles and content
- **Filtering**: Filter by type, tags, and custom criteria

## Target Use Cases

1. **Research & Learning**
   - Save articles and blog posts for later reading
   - Organize academic papers and documentation
   - Collect reference materials across projects

2. **Media Consumption**
   - Bookmark YouTube videos and podcasts
   - Save social media posts and threads
   - Organize visual content and inspiration

3. **Note-Taking & Ideas**
   - Capture quick thoughts and ideas
   - Save text snippets and quotes
   - Organize personal knowledge base

4. **Cross-Device Workflow**
   - Save on mobile, read on desktop
   - Seamless synchronization across devices
   - Consistent experience everywhere

## Content Types Supported

| Type | Description | Examples |
|------|-------------|----------|
| `article` | Blog posts, news articles, web pages | Medium posts, news sites, documentation |
| `video` | Video content from major platforms | YouTube, Vimeo, Twitch streams |
| `social` | Social media posts and threads | Twitter/X posts, Instagram, LinkedIn |
| `note` | Plain text notes and ideas | Quick thoughts, meeting notes, reminders |
| `link` | General bookmarks and references | Tool links, resources, references |
| `image` | Photos and visual content | Screenshots, diagrams, inspiration |

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Strict typing for better development experience
- **Vite**: Fast build tool and development server
- **CSS**: Modern CSS with component-scoped styles

### PWA & Storage
- **Vite PWA Plugin**: Service worker and manifest generation
- **Workbox**: Advanced caching strategies
- **IndexedDB**: Client-side database for content storage
- **Web Share API**: Native sharing integration

### Development & Testing
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **ESLint**: Code quality and consistency
- **TypeScript ESLint**: TypeScript-specific linting rules

## Architecture Principles

### Service Layer Architecture
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data
- **Single Responsibility**: Each service handles one domain area
- **Dependency Injection**: Services depend on abstractions, not implementations

### Type Safety
- **Strict TypeScript**: No `any` types, comprehensive type coverage
- **Interface-Driven**: Clear contracts between components and services
- **Runtime Validation**: Type checking at service boundaries

### Offline-First Design
- **Local-First**: All operations work offline by default
- **Progressive Enhancement**: Online features enhance the offline experience
- **Resilient Sync**: Robust handling of network connectivity changes

### Performance & UX
- **Lazy Loading**: Components and routes loaded on demand
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Background Processing**: Non-blocking metadata extraction and sync
- **Responsive Design**: Optimized for all screen sizes and devices

## Integration Points

### Web Share API
- Native sharing from other apps
- File sharing support (images, PDFs, text)
- Cross-platform compatibility

### PWA Manifest
- App installation prompts
- Custom shortcuts and actions
- Share target registration

### Service Worker
- Offline functionality
- Background sync
- Push notifications (planned)
- Update management

## Future Roadmap

### Short Term
- Enhanced metadata extraction
- Improved search and filtering
- Bulk operations (import/export)
- Tag management interface

### Medium Term
- Cloud synchronization
- Collaboration features
- Browser extension
- Mobile app (React Native)

### Long Term
- AI-powered content analysis
- Smart recommendations
- Advanced organization tools
- Team and workspace features