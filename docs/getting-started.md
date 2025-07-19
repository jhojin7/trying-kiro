# Getting Started

This guide will help you set up Universal Pocket for development and understand the basic workflows.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Recommended Tools

- **VS Code** with TypeScript and React extensions
- **Chrome DevTools** for PWA debugging
- **React Developer Tools** browser extension

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd universal-pocket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## Development Scripts

### Core Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing Commands

```bash
# Run all tests once
npm run test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test -- --coverage
```

### Code Quality Commands

```bash
# Run ESLint to check code quality
npm run lint

# Run TypeScript type checking
npm run type-check

# Fix auto-fixable ESLint issues
npm run lint -- --fix
```

## Project Structure

```
universal-pocket/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   └── *.png             # PWA icons
├── src/
│   ├── components/        # React UI components
│   ├── services/         # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── test/            # Test setup and utilities
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── docs/                # Documentation (this directory)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── vitest.config.ts     # Test configuration
└── .eslintrc.cjs        # ESLint configuration
```

## Development Workflow

### 1. Feature Development

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Make your changes**
   - Follow the [Architecture Guidelines](./architecture.md)
   - Write tests for new functionality
   - Update documentation as needed

4. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### 2. Testing Your Changes

#### Unit Testing
```bash
# Run specific test file
npm run test -- src/services/content.test.ts

# Run tests matching a pattern
npm run test -- --grep "content service"

# Run tests in watch mode
npm run test:watch
```

#### PWA Testing
1. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test PWA features**
   - Open Chrome DevTools → Application tab
   - Check Service Worker registration
   - Test offline functionality
   - Verify manifest and installability

#### Cross-Browser Testing
- Test in Chrome, Firefox, Safari, and Edge
- Verify PWA features work across browsers
- Check responsive design on different screen sizes

### 3. Code Quality

#### TypeScript
- Use strict typing - no `any` types
- Define interfaces for all data structures
- Use path aliases for clean imports:
  ```typescript
  import { ContentItem } from '@/types'
  import { contentService } from '@/services/content'
  ```

#### React Components
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Follow the component structure:
  ```typescript
  interface ComponentProps {
    // Define props here
  }

  export function Component({ prop1, prop2 }: ComponentProps) {
    // Component implementation
  }
  ```

#### Services
- Keep business logic in services, not components
- Use dependency injection pattern
- Export singleton instances:
  ```typescript
  class MyService {
    // Service implementation
  }

  export const myService = new MyService()
  ```

## Environment Setup

### VS Code Configuration

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "files.associations": {
    "*.css": "css"
  }
}
```

### Browser Extensions

Install these helpful extensions:
- **React Developer Tools** - Debug React components
- **Redux DevTools** - If using Redux (future enhancement)
- **Lighthouse** - PWA and performance auditing

## Common Development Tasks

### Adding a New Component

1. **Create component files**
   ```bash
   touch src/components/MyComponent.tsx
   touch src/components/MyComponent.css
   ```

2. **Implement the component**
   ```typescript
   // src/components/MyComponent.tsx
   import './MyComponent.css'

   interface MyComponentProps {
     title: string
     onAction: () => void
   }

   export function MyComponent({ title, onAction }: MyComponentProps) {
     return (
       <div className="my-component">
         <h2>{title}</h2>
         <button onClick={onAction}>Action</button>
       </div>
     )
   }
   ```

3. **Add tests**
   ```typescript
   // src/components/MyComponent.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react'
   import { MyComponent } from './MyComponent'

   describe('MyComponent', () => {
     it('renders title and handles click', () => {
       const mockAction = vi.fn()
       render(<MyComponent title="Test" onAction={mockAction} />)
       
       expect(screen.getByText('Test')).toBeInTheDocument()
       fireEvent.click(screen.getByText('Action'))
       expect(mockAction).toHaveBeenCalled()
     })
   })
   ```

### Adding a New Service

1. **Create service file**
   ```bash
   touch src/services/my-service.ts
   ```

2. **Implement the service**
   ```typescript
   // src/services/my-service.ts
   class MyService {
     async doSomething(): Promise<string> {
       // Implementation
       return 'result'
     }
   }

   export const myService = new MyService()
   ```

3. **Add tests**
   ```typescript
   // src/services/my-service.test.ts
   import { describe, it, expect } from 'vitest'
   import { myService } from './my-service'

   describe('MyService', () => {
     it('should do something', async () => {
       const result = await myService.doSomething()
       expect(result).toBe('result')
     })
   })
   ```

### Adding New Types

1. **Update type definitions**
   ```typescript
   // src/types/index.ts
   export interface NewType {
     id: string
     name: string
     createdAt: Date
   }
   ```

2. **Use throughout the application**
   ```typescript
   import { NewType } from '@/types'
   ```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

#### Test Failures
```bash
# Clear test cache
npm run test -- --clearCache

# Run tests with verbose output
npm run test -- --verbose
```

#### PWA Issues
1. Clear browser cache and storage
2. Unregister service worker in DevTools
3. Rebuild and test again

### Getting Help

- Check the [Architecture Documentation](./architecture.md)
- Review [API Documentation](./api/README.md)
- Look at existing tests for examples
- Check the browser console for errors
- Use React DevTools for component debugging

## Next Steps

Once you have the development environment set up:

1. Read the [Architecture Guide](./architecture.md) to understand the codebase
2. Explore the [API Documentation](./api/README.md) to understand the services
3. Check out the [Component Documentation](./components/README.md) for UI patterns
4. Review the [Testing Guide](./testing.md) for testing best practices