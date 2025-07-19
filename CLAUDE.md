# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Web App
- `npm run dev` - Start development server (Vite) on http://localhost:5173
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

### API Server
- `npm run server:dev` - Start API server for Raycast integration on http://localhost:3001
- `npm run server:build` - Build API server for production
- `npm run server:start` - Start production API server
- `npm run dev:full` - Start both web app and API server together

### Testing & Quality
- `npm run test` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode for development
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking without emitting files

## Project Architecture

**Universal Pocket** is a PWA-first read-later bookmarking application built with React + TypeScript + Vite.

### Core Architecture Patterns

- **Services Layer**: Business logic is centralized in `/src/services/`
  - `content.ts` - Content management with offline-first architecture
  - `storage.ts` - Local storage abstraction (IndexedDB)
  - `metadata.ts` - URL metadata extraction for different platforms
  - `pwa.ts` - PWA-specific functionality and service worker management

- **API Server**: Local HTTP server for external tool integration (`/server/`)
  - `index.ts` - Express.js server with REST endpoints and WebSocket support
  - `services/content-bridge.ts` - Server-compatible content management
  - Runs on `localhost:3001` for Raycast and other external integrations

- **Offline-First Design**: The app prioritizes offline functionality
  - Content can be saved without internet connection
  - Metadata extraction is queued and processed when online
  - Sync status tracking (`local`, `synced`, `pending`)

- **Content Types**: Type-aware content handling
  - Automatic content type detection based on URL patterns
  - Platform-specific metadata extraction (YouTube, Instagram, generic web pages)
  - File upload support for images/videos

### Key Components Structure

- **SaveForm**: Main content input with URL/text/file support
- **ContentList/ContentCard**: Content display with type-specific rendering
- **ShareTargetHandler**: PWA share target integration
- **PWAInstallPrompt**: Installation prompt management

### Path Aliases (configured in tsconfig.json and vite.config.ts)

```
@/* → src/*
@/components/* → src/components/*
@/services/* → src/services/*
@/types/* → src/types/*
@/utils/* → src/utils/*
```

### PWA Configuration

The app is configured as a full PWA with:
- Share target API for receiving content from other apps
- Service worker with caching strategies for images and API calls
- App shortcuts and manifest configuration
- Offline functionality with background sync

### Testing Setup

- **Framework**: Vitest with jsdom environment
- **Testing Library**: React Testing Library with jest-dom matchers
- **Test Files**: Co-located with source files using `.test.ts` suffix
- **Setup**: Test configuration in `src/test/setup.ts`

### TypeScript Configuration

- Strict mode enabled with comprehensive type checking
- Path mapping configured for clean imports
- ESNext module resolution for modern bundling

## Important Development Notes

- Always run `npm run type-check` and `npm run lint` after making changes
- The offline queue in ContentService requires careful handling during development
- PWA features may not work fully in development mode - use `npm run preview` for testing PWA functionality
- Content metadata extraction has fallback mechanisms for offline scenarios

### API Server Development
- Use `npm run dev:full` to run both web app and API server together
- API server uses in-memory storage for development (separate from web app storage)
- WebSocket connections provide real-time updates between server and potential clients
- API endpoints are documented in `docs/api/server-api.md`