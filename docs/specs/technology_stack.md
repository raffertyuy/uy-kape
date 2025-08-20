# Technology Stack

This document provides a comprehensive overview of the technology stack used in the Uy, Kape! project, including versions, configurations, and architectural decisions.

## **Quick Summary**

**Uy, Kape!** is built with modern web technologies optimized for performance, developer experience, and real-time collaboration:

- **Frontend**: React 18 + TypeScript + Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom coffee-themed design system
- **Database**: Supabase (PostgreSQL) with real-time subscriptions and authentication
- **Testing**: Vitest + React Testing Library for comprehensive test coverage
- **Deployment**: Vercel with Node.js 20.x runtime for seamless hosting
- **CI/CD**: GitHub Actions for automated testing, security scanning, and quality checks

*For detailed version information and architectural decisions, see the sections below.*

## **Frontend Stack**

### **Core Framework**

- **React**: v18.2.0
  - Modern functional components with hooks
  - TypeScript integration for type safety
  - Component-based architecture

### **Build Tool & Development**

- **Vite**: v5.0.8
  - Fast development server with Hot Module Replacement (HMR)
  - Optimized production builds with code splitting
  - Native ES modules support
- **TypeScript**: v5.2.2
  - Strict type checking enabled
  - Enhanced developer experience and code reliability

### **Styling & UI**

- **Tailwind CSS**: v3.3.6
  - Utility-first CSS framework
  - Custom coffee-themed design system
  - Responsive design patterns
- **PostCSS**: v8.4.32
  - CSS processing and optimization
  - Tailwind CSS integration

### **Routing**

- **React Router DOM**: v6.20.1
  - Client-side routing
  - Nested routes and protected routes

## **Backend & Database**

### **Database**

- **Supabase**: v2.34.3 (CLI)
  - PostgreSQL database with real-time subscriptions
  - Row Level Security (RLS) policies
  - Real-time multiplayer features

### **Database Client**

- **@supabase/supabase-js**: v2.55.0
  - Official Supabase JavaScript client
  - Real-time subscriptions and presence
  - Authentication and authorization

## **Runtime Environment**

### **Node.js**

- **Version**: 20.x (LTS)
  - Specified in `package.json` engines field
  - Consistent across all environments (local, CI, Vercel)
  - LTS support until April 2026

### **Package Management**

- **npm**: Standard package manager
  - Lock file (`package-lock.json`) for consistent installs
  - Scripts for development, build, and testing

## **Testing Framework**

### **Core Testing**

- **Vitest**: v3.2.4
  - Fast unit test runner (Vite-native)
  - Jest-compatible API
  - Coverage reporting with v8

### **React Testing**

- **@testing-library/react**: v16.3.0
- **@testing-library/jest-dom**: v6.7.0
- **@testing-library/user-event**: v14.6.1
- **jsdom**: v26.1.0 (browser environment simulation)

### **Coverage**

- **@vitest/coverage-v8**: v3.2.4
- **@vitest/ui**: v3.2.4 (test UI interface)

## **Code Quality & Linting**

### **ESLint Configuration**

- **@eslint/js**: v9.33.0
- **@typescript-eslint/eslint-plugin**: v6.14.0
- **@typescript-eslint/parser**: v6.14.0
- **eslint-plugin-react**: v7.37.5
- **eslint-plugin-react-hooks**: v4.6.0
- **eslint-plugin-react-refresh**: v0.4.5
- **eslint-plugin-jsx-a11y**: v6.10.2 (accessibility)

### **Code Quality Rules**

- Maximum 5 warnings allowed in CI
- Accessibility checks enabled
- React hooks rules enforced
- TypeScript strict checking

## **Deployment & Hosting**

### **Platform**

- **Vercel**: Frontend hosting and serverless functions
  - Zero-configuration deployment
  - Automatic HTTPS and CDN
  - Serverless function support
  - Edge network optimization

### **Environment Configuration**

- **Node.js Runtime**: 20.x (specified in package.json)
- **Build Command**: `tsc && vite build`
- **Output Directory**: `dist/`

## **CI/CD Pipeline**

### **GitHub Actions**

- **Build & Test**: Node.js 20.x matrix
- **Security Scanning**: Automated vulnerability checks
- **Code Quality**: Linting and type checking
- **Coverage Reporting**: Codecov integration

### **Workflow Triggers**

- Pull requests to main branch
- Pushes to main branch
- Manual workflow dispatch

## **Development Tools**

### **Type Definitions**

- **@types/react**: v18.2.43
- **@types/react-dom**: v18.2.17

### **Vite Plugins**

- **@vitejs/plugin-react**: v4.2.1
  - React Fast Refresh support
  - JSX transformation

## **Architecture Decisions**

### **Module System**

- **ES Modules**: Native ES module support throughout
- **Type**: "module" in package.json
- **Import/Export**: ES6 syntax exclusively

### **Bundle Optimization**

- **Manual Chunks**: Vendor libraries separated
  - `vendor`: React and React DOM
  - `supabase`: Supabase client library
  - `router`: React Router DOM

### **Development Experience**

- **Path Aliases**: `@/` mapped to `/src` for cleaner imports
- **Hot Module Replacement**: Instant feedback during development
- **TypeScript Strict Mode**: Enhanced type safety

## **Real-time Features**

### **Supabase Realtime**

- WebSocket-based real-time subscriptions
- Live menu updates across connected clients
- Presence awareness for collaborative features
- Conflict resolution for concurrent edits

## **Security Considerations**

### **Environment Variables**

- Sensitive data in `.env` (git-ignored)
- Public variables prefixed with `VITE_`
- Example configuration in `.env.example`

### **Database Security**

- Row Level Security (RLS) policies
- API key rotation best practices
- Client-side security validations

## **Performance Optimizations**

### **Build Optimizations**

- Code splitting by routes and vendors
- Tree shaking for unused code elimination
- Asset optimization and compression

### **Runtime Performance**

- React.memo for component memoization
- Efficient re-render patterns
- Lazy loading where appropriate

## **Browser Support**

### **Target Browsers**

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### **Polyfills**

- Minimal polyfill strategy (modern baseline)
- Vite handles necessary transformations

## **Future Considerations**

### **Planned Updates**

- Regular dependency updates following security advisories
- Node.js LTS version migrations when available
- React 19 evaluation when stable

### **Monitoring**

- Performance monitoring integration planned
- Error tracking and analytics
- Real-time usage metrics

---

## **Version History**

- **2025-08-20**: Initial technology stack documentation
  - Node.js standardized to 20.x across all environments
  - Updated CI/CD pipeline configuration
  - Documented current package versions and architecture decisions

---

*This document should be updated when major technology decisions are made or significant version upgrades are performed.*
