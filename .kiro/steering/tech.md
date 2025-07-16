# Technology Stack & Build System

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.x for fast development and optimized builds
- **PWA**: Vite PWA plugin with Workbox for service worker management
- **Testing**: Vitest + React Testing Library + jsdom
- **Linting**: ESLint with TypeScript and React plugins
- **Module System**: ES Modules (type: "module" in package.json)

## TypeScript Configuration
- Target: ES2020 with strict mode enabled
- Path aliases configured for clean imports:
  - `@/*` → `src/*`
  - `@/components/*` → `src/components/*`
  - `@/services/*` → `src/services/*`
  - `@/types/*` → `src/types/*`
  - `@/utils/*` → `src/utils/*`

## PWA Features
- Auto-updating service worker
- Web Share API integration for content capture
- Offline caching with runtime caching for images
- Installable with proper manifest configuration

## Common Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run preview      # Preview production build
```

### Building & Testing
```bash
npm run build        # TypeScript compilation + Vite build
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
```

### Code Quality
```bash
npm run lint         # ESLint with TypeScript rules
npm run type-check   # TypeScript type checking without emit
```

## Development Guidelines
- Use TypeScript strict mode - all code must be properly typed
- Follow React 18 patterns with hooks and functional components
- Leverage path aliases for clean imports
- Write tests for services and utilities
- Use ESLint recommended rules with React-specific plugins