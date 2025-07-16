# Project Structure & Organization

## Directory Layout
```
src/
├── components/     # React UI components
├── services/       # Business logic and data services
├── types/          # TypeScript type definitions
├── utils/          # Pure utility functions
└── test/           # Test setup and shared utilities
```

## Architecture Patterns

### Service Layer Architecture
- **Services** handle all business logic and data operations
- **Components** focus purely on UI and user interaction
- Services are exported as singleton instances (e.g., `contentService`)
- Services use dependency injection pattern for other services

### Component Organization
- Each component has its own `.tsx` and `.css` files
- Components are functional with React hooks
- Props are properly typed with TypeScript interfaces
- Components handle UI state, services handle business logic

### Type System
- All types centralized in `src/types/index.ts`
- Core domain types: `ContentItem`, `SaveRequest`, `ContentType`
- Metadata types for different content sources
- Strict typing with no `any` types allowed

## File Naming Conventions
- Components: PascalCase (e.g., `ContentCard.tsx`)
- Services: camelCase (e.g., `content.ts`)
- Types: PascalCase for interfaces, camelCase for files
- Tests: `*.test.ts` or `*.test.tsx`
- CSS: matches component name (e.g., `ContentCard.css`)

## Import Patterns
- Use path aliases for clean imports: `@/components/ContentCard`
- Services import from other services using relative paths
- Components import types from `@/types`
- Utilities imported from `@/utils`

## Testing Structure
- Test files co-located with source files
- Shared test setup in `src/test/setup.ts`
- Service tests focus on business logic
- Component tests use React Testing Library
- Integration tests for service interactions

## Key Architectural Principles
- **Separation of Concerns**: UI, business logic, and data access are separate
- **Single Responsibility**: Each service handles one domain area
- **Type Safety**: Everything is properly typed with TypeScript
- **Testability**: Services and utilities are easily unit testable
- **Modularity**: Clear boundaries between different parts of the application