---
description: "Implementation plan for adding free-tier telemetry and monitoring capabilities"
created-date: 2025-08-28
---

# Implementation Plan for Free-Tier Telemetry Implementation

## OBJECTIVE

Implement comprehensive free-tier telemetry and monitoring capabilities for the Uy, Kape! React application to gain insights into performance, user experience, and system health without requiring paid monitoring services. This includes Vercel Speed Insights, client-side performance tracking, query performance logging, and enhanced error reporting.

## ENVIRONMENT VARIABLES ASSESSMENT

### Analysis of Required Configuration

- **Vercel Speed Insights**: No additional endpoints or API keys required - automatically detects Vercel environment
- **Supabase Connection**: Uses existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for query performance logging
- **Existing Telemetry Config**: `.env.ci` already contains telemetry variables, indicating some infrastructure exists
- **Open Source Friendly**: All telemetry features must be OPTIONAL and DISABLED by default to allow developers without Vercel accounts to run the app locally
- **Simplified Configuration**: Use master switches instead of individual feature toggles for easier management

### New Environment Variables Required

#### Production/Development (`.env.example`)

```bash
# =============================================================================
# TELEMETRY CONFIGURATION (OPTIONAL - DISABLED BY DEFAULT)
# =============================================================================

# Vercel telemetry master switch (controls Speed Insights, performance tracking, dev dashboard)
# Set to 'true' to enable all Vercel-related telemetry features
VITE_VERCEL_TELEMETRY_ENABLED=false

# Supabase telemetry master switch (controls query logging, connection monitoring)
# Set to 'true' to enable all Supabase-related telemetry features  
VITE_SUPABASE_TELEMETRY_ENABLED=false

# Optional configuration values (used only when telemetry is enabled)
# Query performance threshold in milliseconds (default: 500)
VITE_SLOW_QUERY_THRESHOLD=500

# Note: The app works perfectly without any telemetry configuration
# If these variables are not set, telemetry is automatically disabled
# These features are purely additive and do not affect core functionality
```

#### CI Environment (`.env.ci` additions)

```bash
# Telemetry disabled in CI (append to existing file)
VITE_VERCEL_TELEMETRY_ENABLED=false
VITE_SUPABASE_TELEMETRY_ENABLED=false
```

## IMPLEMENTATION PLAN

- [ ] **Step 1: Environment Configuration Setup**
  - **Task**: Set up comprehensive environment variable configuration for all telemetry features, ensuring all features are optional and disabled by default
  - **Files**:
    - `.env.example`: Add telemetry environment variables with documentation
    - `.env.ci`: Add telemetry-specific CI configuration (append to existing)
    - `src/vite-env.d.ts`: Add TypeScript definitions for all telemetry environment variables
    - `src/config/telemetryConfig.ts`: Create centralized telemetry configuration management
  - **Dependencies**: Existing environment configuration patterns
  - **Pseudocode**:

    ```typescript
    // telemetryConfig.ts
    export const telemetryConfig = {
      // Vercel telemetry master switch
      vercel: {
        enabled: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === 'true',
        speedInsights: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === 'true',
        performanceTracking: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === 'true',
        devDashboard: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === 'true' && !import.meta.env.PROD
      },
      
      // Supabase telemetry master switch
      supabase: {
        enabled: import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === 'true',
        queryLogging: import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === 'true',
        connectionMonitoring: import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === 'true'
      },
      
      // Configuration values with sensible defaults (only used when telemetry enabled)
      slowQueryThreshold: Number(import.meta.env.VITE_SLOW_QUERY_THRESHOLD) || 500,
      
      // Enhanced error reporting (enabled if either telemetry is enabled)
      enhancedErrorReporting: import.meta.env.VITE_VERCEL_TELEMETRY_ENABLED === 'true' || 
                             import.meta.env.VITE_SUPABASE_TELEMETRY_ENABLED === 'true'
    }
    ```

- [ ] **Step 2: Create Core Telemetry Infrastructure**
  - **Task**: Build foundational telemetry utilities and types that work gracefully when disabled
  - **Files**:
    - `src/types/telemetry.types.ts`: TypeScript definitions for all telemetry data structures
    - `src/utils/performanceTracker.ts`: Core performance tracking utilities
    - `src/utils/telemetryLogger.ts`: Safe logging utility that respects configuration
  - **Dependencies**: Browser Performance API (native), telemetry configuration from Step 1
  - **Pseudocode**:

    ```typescript
    // performanceTracker.ts
    import { telemetryConfig } from '../config/telemetryConfig'
    
    export const performanceTracker = {
      markStart: (name: string) => {
        if (!telemetryConfig.vercel.performanceTracking) return
        performance.mark(`${name}-start`)
      },
      markEnd: (name: string) => {
        if (!telemetryConfig.vercel.performanceTracking) return
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
      },
      // Graceful degradation when disabled
      getMetrics: () => telemetryConfig.vercel.performanceTracking ? 
                       performance.getEntriesByType('measure') : []
    }
    ```

- [ ] **Step 3: Install and Configure Vercel Speed Insights**
  - **Task**: Add optional Vercel Speed Insights that only loads when explicitly enabled
  - **Files**:
    - `package.json`: Add @vercel/speed-insights dependency
    - `src/main.tsx`: Conditionally integrate SpeedInsights component
    - `src/components/telemetry/SpeedInsightsWrapper.tsx`: Safe wrapper component
  - **Dependencies**: @vercel/speed-insights package, telemetry configuration
  - **Pseudocode**:

    ```typescript
    // SpeedInsightsWrapper.tsx
    import { SpeedInsights } from '@vercel/speed-insights/react'
    import { telemetryConfig } from '../../config/telemetryConfig'
    
    export const SpeedInsightsWrapper = () => {
      // Only render if Vercel telemetry is enabled and in production
      if (!telemetryConfig.vercel.speedInsights || !import.meta.env.PROD) {
        return null
      }
      
      return <SpeedInsights />
    }
    ```

- [ ] **Step 4: Enhance Supabase Query Performance Logging**
  - **Task**: Add optional performance instrumentation to database operations
  - **Files**:
    - `src/utils/supabasePerformanceLogger.ts`: Optional performance logging wrapper
    - `src/services/menuService.ts`: Add optional performance logging
    - `src/services/orderService.ts`: Add optional performance logging
    - `src/services/adminOrderService.ts`: Add optional performance logging
  - **Dependencies**: Existing Supabase services, telemetry configuration

- [ ] **Step 5: Create Performance Tracking Hooks**
  - **Task**: Implement React hooks for component-level performance monitoring
  - **Files**:
    - `src/hooks/usePerformanceTracking.ts`: React hook for performance monitoring
    - `src/hooks/useTelemetryContext.ts`: Hook for accessing telemetry context
  - **Dependencies**: Performance tracking utilities, React hooks

- [ ] **Step 6: Enhance Real-time Connection Monitoring**
  - **Task**: Add optional telemetry to existing real-time connection monitoring
  - **Files**:
    - `src/hooks/useMenuSubscriptions.ts`: Add optional connection telemetry
    - `src/utils/connectionQualityTracker.ts`: Optional connection quality tracking
  - **Dependencies**: Existing real-time hooks, telemetry configuration

- [ ] **Step 7: Create Optional Development Telemetry Dashboard**
  - **Task**: Build development-only dashboard for telemetry insights
  - **Files**:
    - `src/components/dev/TelemetryDashboard.tsx`: Development telemetry dashboard
    - `src/components/dev/PerformanceMetrics.tsx`: Performance metrics display
    - `src/components/dev/ConnectionStatus.tsx`: Connection status display
    - `src/App.tsx`: Conditionally render dashboard in development
  - **Dependencies**: All telemetry utilities, development environment detection

- [ ] **Step 8: Enhance Global Error Reporting**
  - **Task**: Add optional telemetry context to existing error handling
  - **Files**:
    - `src/utils/globalErrorHandler.ts`: Enhance with optional telemetry data
    - `src/contexts/ErrorContext.tsx`: Add optional telemetry context
  - **Dependencies**: Existing error handling system, telemetry utilities

- [ ] **Step 9: Integration Testing and Validation**
  - **Task**: Test telemetry implementation in both enabled and disabled states
  - **Testing Scenarios**:
    - Verify app works perfectly with all telemetry disabled (default state)
    - Test each telemetry feature can be enabled independently
    - Validate no external dependencies required for basic functionality
    - Ensure telemetry features fail gracefully when misconfigured
  - **Dependencies**: Completed telemetry implementation

- [ ] **Step 10: Write Unit Tests for Telemetry Components**
  - **Task**: Create comprehensive tests including disabled state scenarios
  - **Files**:
    - `src/config/__tests__/telemetryConfig.test.ts`: Test configuration logic
    - `src/utils/__tests__/performanceTracker.test.ts`: Test performance tracking
    - `src/utils/__tests__/supabasePerformanceLogger.test.ts`: Test database logging
    - `src/components/dev/__tests__/TelemetryDashboard.test.tsx`: Test dashboard
  - **Dependencies**: Vitest, React Testing Library, dual testing strategy

- [ ] **Step 11: Write Playwright E2E Tests**
  - **Task**: End-to-end tests for telemetry features and disabled states
  - **Files**:
    - `tests/e2e/system/telemetry-disabled.spec.ts`: Test app works with telemetry disabled
    - `tests/e2e/system/telemetry-enabled.spec.ts`: Test telemetry functionality
  - **Dependencies**: Playwright, existing E2E framework

- [ ] **Step 12: Documentation and Final Validation**
  - **Task**: Document telemetry system and validate compliance with open source requirements
  - **Files**:
    - `docs/telemetry.md`: Comprehensive telemetry documentation
    - `README.md`: Update with optional telemetry configuration
    - `CONTRIBUTING.md`: Add section about telemetry for contributors
  - **Validation**:
    - Confirm app runs perfectly for developers without any telemetry configuration
    - Verify no external accounts or services required for development
    - Test complete functionality with empty `.env` file

**DO NOT start implementation without my permission** - await user review and approval of this revised plan.
