---
description: 'ReactJS development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# ReactJS Development Instructions

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev.

## Project Context
- React 19+ with TypeScript-first development approach
- Modern React features: Actions, useOptimistic, useActionState, enhanced useReducer
- Strict TypeScript configuration with enhanced type safety
- Functional components with hooks as default pattern
- Vite build tool with explicit file extensions (.tsx/.ts) for optimal TypeScript support
- Component composition and interface-based design patterns
- Server/client state distinction with proper typing

## Development Standards

### Code Formatting & Organization
- Use 2 spaces per indentation level for JavaScript/TypeScript/React code
- Enforce formatting with Prettier + ESLint (no manual style debates)
- Limit lines to 100 characters when practical
- Place opening curly braces on the same line as the statement
- Keep one React component per file (except tiny presentational helpers)
- Order imports: (1) React/stdlib, (2) third-party, (3) alias/internal modules, (4) relative (parent to child), (5) styles
- Avoid deeply nested JSX; extract child components
- Group related Tailwind utility classes logically (layout | spacing | typography | color | states)
- Prefer explicit file extensions on relative imports in Vite when beneficial for clarity (.tsx/.ts)

### Architecture
- Use functional components with hooks as the primary pattern (no class components)
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration
- Use TypeScript interfaces and types for all props, state, and component definitions
- Define proper types for event handlers, refs, and callback functions
- Implement generic components with proper type constraints where appropriate
- Use strict mode in `tsconfig.json` with `noImplicitAny`, `strictNullChecks`, and `noImplicitReturns`
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, `React.PropsWithChildren`, etc.)
- Create union types for component variants and states
- Use `as const` assertions for literal types and readonly arrays
- Implement proper type guards for runtime type checking
- Use `Partial<T>`, `Pick<T>`, `Omit<T>` for type transformations
- Define custom utility types for common patterns
- Use module declaration merging when extending third-party types
- Implement discriminated unions for state management

### Modern TypeScript Patterns for React
- **State Typing**: `useState<User | null>(null)` for explicit nullable state
- **Type Assertions**: `useState<User>({} as User)` only when state is set immediately after
- **Event Handlers**: Use specific event types like `React.ChangeEvent<HTMLInputElement>`
- **Ref Typing**: `useRef<HTMLDivElement>(null)` for DOM elements, `useRef<number | null>(null)` for mutable values
- **Custom Hook Returns**: Use `as const` for tuple inference: `return [value, setter] as const`
- **Context with Custom Hooks**: Create hooks that throw when context is null to eliminate optional chaining
- **Generic Components**: Use `ComponentProps<typeof SomeComponent>` to infer props from existing components
- **Form Handling**: Type assertions for uncontrolled forms: `(e.target as HTMLFormElement & {email: {value: string}})`
- **Error Boundaries**: Implement with proper TypeScript error and errorInfo typing
- **Portal Components**: Use `ReactNode` for children and proper DOM element typing

### Component Design
- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions (PascalCase for components, camelCase for hooks like `useXyz`)
- Define TypeScript interfaces for all component props with proper JSDoc documentation
- Design components to be testable and reusable with strong type contracts
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions) with proper typing
- Keep components pure; side effects only in `useEffect`/event handlers/Actions
- Co-locate component + styles (and test) in same folder when they are tightly scoped
- Prefer composition over inheritance; keep prop interfaces small and focused
- Handle loading, empty, and error states explicitly in UI with proper TypeScript types
- Use `React.forwardRef` with proper generic typing when forwarding refs
- Implement default props using ES6 default parameters rather than `defaultProps`

### React 19 Features
- **Actions**: Use React 19 Actions for asynchronous operations with automatic error handling and pending states
- **useActionState**: Manage form state and submission with built-in error handling and loading states
- **useOptimistic**: Implement optimistic updates for immediate UI feedback while server requests process
- **Enhanced useReducer**: Leverage improved useReducer with better TypeScript inference for action types
- **Server Components Integration**: Structure components for server/client boundary with proper TypeScript exports
- **Improved Suspense**: Use enhanced Suspense boundaries with better TypeScript error handling
- **Automatic Error Boundaries**: Implement error handling with React 19's improved error boundary patterns

### State Management
- Use `useState` with explicit typing for local component state: `useState<User | null>(null)`
- Implement `useReducer` with discriminated unions for complex state logic
- Use React 19's `useActionState` for form state management with server actions
- Leverage `useOptimistic` for optimistic UI updates with proper TypeScript interfaces
- Implement `useContext` with custom hooks for type-safe context consumption
- Consider external state management (Redux Toolkit, Zustand) for complex applications
- Use React Query or SWR for server state management with generated types
- Start with local + server state; add context only when duplication emerges
- Avoid global stores until real cross-cutting concerns appear (auth/session acceptable)
- Prefer controlled inputs for forms; use React 19 Actions for form handling

### Hooks and Effects
- Use `useEffect` with proper dependency arrays and explicit return types for cleanup
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` with explicit type parameters when performance benefits are measured
- Create custom hooks with `as const` return types for tuple inference: `return [value, setValue] as const`
- Use `useRef<HTMLDivElement>(null)` for DOM element references with specific element types
- Use `useRef<number | null>(null)` for mutable values with proper type annotations
- Type `useState` explicitly when initial value doesn't provide sufficient type information
- Use `useReducer` with discriminated union action types for type-safe state transitions
- Implement React 19's `useOptimistic` for immediate UI feedback with proper TypeScript interfaces
- Use `useActionState` for form submissions with server actions and proper error handling
- Return `void` explicitly from `useEffect` callbacks to avoid accidental return values

### Styling
- Use CSS Modules, Styled Components, or modern CSS-in-JS solutions
- Implement responsive design with mobile-first approach
- Follow BEM methodology or similar naming conventions for CSS classes
- Use CSS custom properties (variables) for theming
- Implement consistent spacing, typography, and color systems
- Ensure accessibility with proper ARIA attributes and semantic HTML

### Performance Optimization
- Use `React.memo` for component memoization when appropriate (only after measuring; premature memoization adds noise)
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks
- Avoid unnecessary re-renders: memoize expensive derived data with `useMemo`
- Split code with dynamic imports for admin-only modules
- Batch state updates; avoid sequential `setState` calls when they can be merged
- Use Suspense cautiously; ensure fallback UI clarity
- Profile before optimizing; rely on React DevTools + network tab

### Data Fetching
- Use modern data fetching libraries (React Query, SWR, Apollo Client)
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies
- Handle offline scenarios and network errors gracefully

### Supabase Integration
- Create a single Supabase client instance (e.g., `lib/supabaseClient.ts`) and reuse
- Generate and use Supabase's TypeScript types (`supabase gen types typescript ...`) for all database operations
- Create strongly-typed domain models that extend or transform Supabase types
- Always specify columns you need (`select('id,name,status')`) with proper TypeScript return types
- Use `upsert` only when required; prefer explicit `insert`/`update` for clarity and better type inference
- Clean up real-time channel subscriptions in `useEffect` return handlers
- Debounce rapid write operations (e.g., live form editing) to avoid rate issues
- Prefer server-side filtering (`.eq()`, `.in()`, `.lte()`) over client filtering for performance
- Handle pagination for potentially growing tables (orders history) using `range` with proper typing
- Treat timestamps as UTC; format at render time with a utility function
- Wrap Supabase calls (`.from()...`) in try/catch; log structured context (table, operation, params)
- Surface user-friendly messages; never expose raw Supabase error details in UI
- For real-time channel subscriptions, handle disconnect/reconnect events explicitly
- Use type narrowing and type guards for `PostgrestError` objects
- Create custom hooks for common Supabase operations with proper TypeScript return types
- Use generic types for reusable Supabase query functions

### Error Handling
- Implement Error Boundaries with proper TypeScript error types for component-level error handling
- Use proper error states in data fetching with discriminated union types
- Implement fallback UI for error scenarios with proper TypeScript props
- Log errors appropriately for debugging with structured error objects
- Handle async errors in effects and event handlers with proper type safety
- Provide meaningful error messages to users
- Create custom error types that extend built-in Error class
- Use Result/Either patterns for functions that can fail
- Implement proper error boundaries with TypeScript generics for different error types

### Forms and Validation
- Use React 19 Actions for form handling with `useActionState` and proper TypeScript action types
- Implement controlled components with explicit event typing: `React.ChangeEvent<HTMLInputElement>`
- Use React Hook Form with TypeScript schema validation (Zod integration recommended)
- Handle form submission with `React.FormEvent<HTMLFormElement>` and prevent default
- Use type assertions for uncontrolled form access: `(e.target as HTMLFormElement).email.value`
- Implement proper error states with discriminated unions: `{type: 'idle'} | {type: 'error', message: string}`
- Create reusable form components with generic interfaces and proper constraint typing
- Use `useOptimistic` for immediate form feedback while server processes requests
- Implement accessibility with proper ARIA attributes and TypeScript interface documentation
- Debounce validation functions with proper TypeScript callback signatures

### Routing
- Use React Router for client-side routing
- Implement nested routes and route protection
- Handle route parameters and query strings properly
- Implement lazy loading for route-based code splitting
- Use proper navigation patterns and back button handling
- Implement breadcrumbs and navigation state management

### Testing
- Write unit tests for components using React Testing Library with TypeScript
- Test component behavior, not implementation details, with proper type safety
- Use Jest with TypeScript configuration for test runner and assertion library
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls with proper TypeScript interfaces
- Test accessibility features and keyboard navigation
- Use `@testing-library/jest-dom` with TypeScript for enhanced matchers
- Create typed test utilities and custom render functions
- Mock Supabase operations with proper TypeScript types
- Use TypeScript's strict mode in test configuration
- Type test props and mock data properly to catch type errors in tests

### Security
- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

### Accessibility
- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles with TypeScript interfaces
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools
- All interactive elements must have accessible names (aria-label, proper semantics)
- Use `<button>` not clickable `<div>`
- Provide focus states even when using Tailwind (do not remove outlines without replacement)
- Ensure color contrast meets WCAG AA
- Associate form inputs with `<label htmlFor>`; announce submission success messages to screen readers (aria-live region)
- Type ARIA props properly using React's built-in ARIA types

### TypeScript Configuration
- Use strict TypeScript configuration optimized for React 19:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "exactOptionalPropertyTypes": true
    }
  }
  ```
- Enable path mapping with explicit extensions: `@/components/Button.tsx`
- Use `.tsx` for React components, `.ts` for utilities and hooks
- Configure Vite for optimal TypeScript support with explicit file extensions
- Enable React 19 type definitions and JSX runtime configuration
- Set up proper type checking in build process with React-specific rules
- Use TypeScript project references for component libraries

## Implementation Process
1. Plan component architecture and data flow with TypeScript interfaces
2. Set up project structure with proper folder organization and TypeScript configuration
3. Define TypeScript interfaces and types for all data models and component props
4. Generate Supabase TypeScript types and create domain models
5. Implement core components with proper TypeScript typing and styling
6. Add state management and data fetching logic with strong typing
7. Implement routing and navigation with typed route parameters
8. Add form handling and validation with TypeScript-first libraries
9. Implement error handling and loading states with proper type safety
10. Add comprehensive testing coverage with TypeScript test utilities
11. Optimize performance and bundle size while maintaining type safety
12. Ensure accessibility compliance with typed ARIA implementations
13. Add documentation and code comments with JSDoc TypeScript syntax

## Additional Guidelines
- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies with TypeScript
- Document complex components and custom hooks with JSDoc TypeScript syntax
- Use ESLint and Prettier with TypeScript rules for consistent code formatting
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis
- Enable TypeScript strict mode in development and CI/CD pipeline
- Use TypeScript's built-in utility types (`Partial`, `Pick`, `Omit`, `Record`) effectively
- Implement type-safe environment variable handling
- Use const assertions and readonly modifiers appropriately

## Common TypeScript Patterns for React 19
- **Action-based Form Handling**: Use `useActionState` with typed server actions for form state management
- **Optimistic Updates**: Implement `useOptimistic` with proper TypeScript interfaces for immediate UI feedback
- **Enhanced useReducer**: Leverage React 19's improved useReducer with discriminated union action types
- **Type-safe Context**: Create custom hooks that throw when context is null, eliminating optional chaining
- **Generic Components**: Use interface constraints for reusable components: `<T extends Record<string, unknown>>`
- **Event Handler Typing**: Explicit event types for better IntelliSense: `React.MouseEvent<HTMLButtonElement>`
- **Ref Forwarding**: Use `forwardRef<HTMLButtonElement, ButtonProps>` with proper generic parameters
- **Custom Hook Returns**: Use `as const` for tuple inference in custom hooks
- **Form Type Assertions**: Type-safe form field access with intersection types
- **Discriminated Unions**: Model component states and API responses with tagged unions
- **Utility Type Composition**: Combine `Pick`, `Omit`, and `Partial` for prop interface transformations