# Universal Pocket

A read-later bookmarking application designed to seamlessly capture and organize content across all modalities - from blog posts and notes to YouTube videos and Instagram reels.

## Features

- **Universal Content Capture**: Save any type of content (text, URLs, videos, social media) with a single action
- **Cross-Platform Access**: Works on web, mobile, and integrates with Raycast
- **Offline-First**: Save content even without internet access
- **Smart Organization**: Automatic content type detection and tagging
- **Progressive Web App**: Install on any device, works like a native app

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # React components
├── services/       # Business logic and API services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── test/           # Test setup and utilities
```

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **PWA**: Vite PWA plugin with Workbox
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Storage**: IndexedDB (planned)
- **Styling**: CSS (planned: CSS Modules or Styled Components)

## License

MIT