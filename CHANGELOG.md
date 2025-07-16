# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete Progressive Web App (PWA) implementation with native app-like experience
  - PWA manifest configuration in `public/manifest.json` with app metadata, icons, and share target support (lines 1-55)
  - Share target integration for receiving shared content from other apps via Web Share API (lines 24-39)
  - App shortcuts for quick access to save functionality (lines 40-54)
  - PWA service implementation in `src/services/pwa.ts` for installation and sharing features
    - Installation state detection and management (lines 35-77)
    - Platform detection for iOS, Android, and desktop (lines 79-93)
    - Install prompt handling with beforeinstallprompt event (lines 95-107)
    - Web Share API integration for native sharing capabilities (lines 165-180)
    - Platform-specific installation instructions (lines 182-194)
  - PWA install prompt component in `src/components/PWAInstallPrompt.tsx`
    - Smart install prompt with dismissal persistence (lines 18-30)
    - Platform-aware installation instructions (lines 67-69)
    - Loading states and error handling during installation (lines 32-50)
  - Share target handler component in `src/components/ShareTargetHandler.tsx`
    - Automatic processing of shared URLs and text content (lines 15-45)
    - Success and error notifications with custom styling (lines 47-95)
    - Loading overlay during content processing (lines 98-135)
  - PWA component integration in main App component (lines 6-7)
- Installable app experience with offline capabilities and home screen access
- Native sharing integration allowing content to be shared TO Universal Pocket from other apps
- Cross-platform PWA support for iOS, Android, and desktop environments
- Complete IndexedDB storage service implementation in `src/services/storage.ts`
  - Database initialization with proper schema setup (lines 12-32)
  - Content saving with auto-generated IDs and timestamps (lines 34-52)
  - Content retrieval by ID with null handling (lines 54-66)
  - Filtered content listing with search, type, and tag filtering (lines 68-102)
  - Content updates with existence validation (lines 104-122)
  - Content deletion functionality (lines 124-134)
  - Database clearing for development/testing (lines 136-148)
  - Singleton service instance export for app-wide usage (line 153)
- IndexedDB indexes for efficient querying by type, creation date, and tags (lines 26-29)
- Comprehensive error handling for all database operations
- Support for offline-first content storage and retrieval

- Complete metadata extraction service implementation in `src/services/metadata.ts`
  - Web page metadata extraction with Open Graph and Twitter Card support (lines 86-119)
  - YouTube-specific metadata extraction including video duration and channel info (lines 121-140)
  - Instagram metadata extraction with username and post type detection (lines 142-159)
  - Robust error handling with configurable retry logic and exponential backoff (lines 390-410)
  - CORS proxy integration for browser-based metadata fetching (lines 77-84)
  - Support for multiple URL patterns and fallback extraction methods
- MetadataExtractor interface defining extraction contracts (lines 3-7)
- ExtractorOptions interface for configurable timeout and retry behavior (lines 9-13)
- Utility methods for URL parsing, duration conversion, and view count parsing (lines 285-350)
- Factory methods and type detection for different content sources (lines 415-441)

- Complete main application implementation in `src/App.tsx`
  - React state management for content items, loading, and saving states (lines 9-11)
  - Content loading on app initialization with error handling (lines 18-27)
  - Save functionality with optimistic UI updates (lines 29-40)
  - Delete functionality with state synchronization (lines 42-49)
  - Content opening with external link handling (lines 51-58)
  - Integration with SaveForm and ContentList components (lines 65-76)
  - Proper error handling and loading state management throughout

- UI component implementations for content management
  - SaveForm component in `src/components/SaveForm.tsx` for content input
  - ContentList component in `src/components/ContentList.tsx` for displaying saved items
  - ContentCard component in `src/components/ContentCard.tsx` for individual item display
  - Associated CSS files for component styling

### Technical Details
- Uses IndexedDB for reliable browser-based storage
- Implements proper TypeScript typing with ContentItem and ContentFilter interfaces
- Includes automatic database schema migration handling
- Provides filtering capabilities for content type, tags, and search queries
- Sorts content by creation date (newest first) for optimal user experience
- Comprehensive metadata extraction with platform-specific parsers for YouTube and Instagram
- Configurable retry mechanisms with exponential backoff for network resilience
- DOM parsing for extracting structured metadata from HTML content
- Support for multiple metadata formats (Open Graph, Twitter Cards, standard HTML tags)
- React-based UI with proper state management and component composition
- Optimistic UI updates for better user experience during save operations
- External link handling with security best practices (noopener, noreferrer)