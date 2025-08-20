# Coding Standards

## Language-Specific Guidelines

### ReactJS & TypeScript

For comprehensive ReactJS, TypeScript, and frontend development standards, refer to:
**[ReactJS Instructions](../.github/instructions/reactjs.instructions.md)**

Key areas covered:

- React 19+ features and modern patterns
- TypeScript-first development approach
- Component design and architecture
- State management and hooks
- Performance optimization
- Supabase integration patterns

### PostgreSQL & Database

For comprehensive PostgreSQL and database development standards, refer to:
**[SQL Instructions](../.github/instructions/sql.instructions.md)**

Key areas covered:

- PostgreSQL 15+ best practices
- Security-first with Row Level Security (RLS)
- Performance optimization and indexing
- Schema design and migrations
- Supabase platform integration

## General Guidelines

- Use descriptive variable, function, and class names. Avoid abbreviations.
- Follow consistent casing: camelCase for variables/functions, PascalCase for classes/components/types/interfaces, ALL_CAPS for constants.
- Avoid magic numbers and strings; define them as typed constants.
- Write small, single-purpose functions and classes with proper TypeScript signatures.
- Place imports at the top of the file, grouped logically with proper TypeScript import syntax.
- Use explicit return types for functions, especially exported ones.
- Prefer `interface` over `type` for object shapes that might be extended.
- Use `type` for unions, intersections, and computed types.

## TypeScript Guidelines

- Enable strict mode in `tsconfig.json` (`"strict": true`) for enhanced type safety.
- Use explicit typing over `any` - prefer `unknown` when the type is truly unknown.
- Create custom error types that extend the built-in Error class.
- Use Result/Either patterns for functions that can fail, with proper TypeScript typing.
- Handle async errors with proper type safety in Promise chains and async/await.
- Use type guards for runtime type validation and narrowing.
- Prefer `interface` for object shapes that might be extended; use `type` for unions and computed types.
- Use `const` assertions (`as const`) for immutable data structures and literal types.
- Leverage utility types like `Partial<T>`, `Pick<T, K>`, `Omit<T, K>` for type transformations.

## Formatting

- Use 2 spaces per indentation level for JavaScript/TypeScript/React code (retain 4 spaces for other languages if present).
- Enforce formatting with Prettier + ESLint with TypeScript rules (no manual style debates).
- Limit lines to 100 characters in frontend code when practical.
- Place opening curly braces on the same line as the statement.
- Keep one React component per file (except tiny presentational helpers).
- Order imports: (1) React/stdlib, (2) third-party, (3) alias/internal modules (4) relative (parent to child), (5) styles.
- Avoid deeply nested JSX; extract child components.
- Group related Tailwind utility classes logically (layout | spacing | typography | color | states).
- Always use explicit file extensions (.tsx/.ts) on relative imports in Vite for clarity.

## Error Handling

- Always catch specific exceptions, not generic ones.
- Log error messages and stack traces for debugging with structured error objects.
- Clean up resources properly in all cases (success, error, early return).
- Wrap Supabase calls (`.from()...`) in try/catch; log structured context (table, operation, params).
- Surface user-friendly messages; never expose raw Supabase error details in UI.
- For real-time channel subscriptions, handle disconnect/reconnect events explicitly.
- Use TypeScript type narrowing and type guards for `PostgrestError` objects.
- Create custom error types that extend the built-in Error class.
- Use Result/Either patterns for functions that can fail, with proper TypeScript typing.
- Handle async errors with proper type safety in Promise chains and async/await.

## Documentation

- Add comments/docstrings to all public classes, functions, and methods with TypeScript JSDoc syntax.
- Document parameters, return values, and exceptions with proper TypeScript annotations.
- Use comments to explain complex logic or business rules.
- Document TypeScript interfaces and types with JSDoc comments.
- Use `@param`, `@returns`, `@throws` JSDoc tags with TypeScript types.
- Document generic type parameters and constraints clearly.

## Security

- Never hardcode sensitive information (passwords, API keys, service_role keys).
- Rely on Supabase Row Level Security (RLS); assume all client calls are untrusted.
- Keep service_role key ONLY on the server (edge functions / backend), never shipped to the browser.
- Use environment variables via Vite `import.meta.env` prefixed with `VITE_` only for harmless public values (project URL, anon key).
- Validate and sanitize all external input (form fields) before sending to Supabase.
- Apply least-privilege policies; model writes to narrow columns when possible.
- Use parameterized queries (Supabase client already does; do not build SQL strings manually).
- Strip PII from logs; never log access tokens.
- Regenerate and rotate keys if exposure is suspected.

## Windows Compatibility

- Use cross-platform path handling (e.g., os.path, path module).
- Avoid hardcoding file separators or drive letters.
- Ensure CLI commands work in Windows environments.

## Additional Guidelines

- Refer to the language-specific instruction files in `.github/instructions/` for detailed coding standards.
- Follow the patterns and examples provided in the respective instruction files.

## Supabase Integration Guidelines

- Create a single supabase client instance (e.g., `lib/supabaseClient.ts`) and reuse.
- Define TypeScript types using Supabase’s generated types (`supabase gen types typescript ...`) and map to domain models if needed.
- Always specify columns you need (`select('id,name,status')`) to reduce payload size.
- Use `upsert` only when required; prefer explicit `insert`/`update` for clarity.
- Clean up real-time channel subscriptions in `useEffect` return handlers.
- Debounce rapid write operations (e.g., live form editing) to avoid rate issues.
- Prefer server-side filtering (`.eq()`, `.in()`, `.lte()`) over client filtering for performance.
- Handle pagination for potentially growing tables using `range`.
- Treat timestamps as UTC; format at render time with a utility.
- Wrap Supabase calls in try/catch; surface user-friendly error messages.
- Use type guards for Supabase response validation.

## Environment Variables

- Prefix only non-sensitive values with `VITE_` for frontend use.
- Document required env vars in README (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- Never log env values at runtime.
- Keep service_role key ONLY on the server, never shipped to the browser.