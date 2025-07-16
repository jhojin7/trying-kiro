# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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