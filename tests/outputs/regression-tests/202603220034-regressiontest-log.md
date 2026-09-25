# Regression Test Report — 2026-03-22 00:34

## Summary

Regression testing for **Performance Optimization** implementation — verifying that route-level
code splitting, N+1 query fixes, option batch fetching, context memoization, subscription
consolidation, resource hints, and CSS selector optimization haven't broken any functionality.

### Result: PASS

All performance optimizations function correctly. No regressions introduced. All pre-existing
E2E test failures are unrelated to this change (caused by hacked mode being active in DB,
which changes link text that older tests hardcode).

---

## Scope of Changes

| File | Change |
|------|--------|
| `src/App.tsx` | Route-level code splitting with `React.lazy` + `Suspense` for GuestModule, BaristaModule, NotFound, ServerError |
| `src/services/adminOrderService.ts` | Eliminated N+1 queries — batch options fetch + precomputed completion times (101+ queries → 3) |
| `src/services/optionService.ts` | Reduced option fetching from 2N queries to 2 bulk queries |
| `src/contexts/HackedModeContext.tsx` | Deferred DB fetch (skip re-render when cache matches) + memoized provider value |
| `src/contexts/ErrorContext.tsx` | Stable `addError` callback via ref, memoized `isGlobalError` + context value |
| `src/hooks/useToast.tsx` | Memoized context value |
| `src/hooks/useMenuSubscriptions.ts` | Consolidated 5 Supabase channels into 1 |
| `index.html` | Resource hints (preconnect/dns-prefetch) for Google Fonts, GA, Clarity |
| `src/index.css` | Replaced ~20 wildcard CSS attribute selectors with explicit class lists |
| `src/hooks/__tests__/useMenuSubscriptions.test.ts` | Updated for consolidated channel pattern |
| `src/pages/__tests__/MenuManagement.test.tsx` | Fixed mock timing with dynamic import |
| `tests/e2e/system/performance-smoke.spec.ts` | New — 3 E2E smoke tests |

---

## Test Results

### Unit Tests

- **Status**: PASS
- **Result**: 911/911 tests pass across 58 test files
- **Duration**: ~55s

### Lint

- **Status**: PASS
- **Result**: 0 errors, 1 warning (pre-existing — `react-refresh/only-export-components` in `HackedModeContext.tsx`)

### Build

- **Status**: PASS
- **Code-split chunks**: GuestModule 70.6KB, BaristaModule 164.2KB, NotFound 1.6KB, ServerError 2.8KB
- **Duration**: 2.29s

### Playwright E2E Tests

- **Status**: 113 passed, 8 skipped, 15 failed (all failures pre-existing)
- **New tests** (3 in `performance-smoke.spec.ts`): All PASS
- **Pre-existing failures** (not caused by this change):
  - 6 in `hacked-mode.spec.ts` — tests hardcode "🛍️ Order Here" link text which changes to "☠️ Get Poisoned Here" when hacked mode is active
  - 6 in `telemetry-disabled.spec.ts` — same hacked-mode link text issue
  - 2 in `wait-time-configuration.spec.ts` — same hacked-mode link text issue
  - 1 in `mobile-responsiveness.spec.ts` — pre-existing selector issue

---

## Exploratory Testing — Desktop (1920x1080)

### Welcome Page

- **Status**: PASS
- Logo, heading, CTA links render correctly
- Hacked mode active (expected — DB state is ON): shows "Order the world's worst drinks!"

### Guest Module — Full Ordering Flow

- **Status**: PASS
- **Step 1 (Drink Selection)**: All 19 drinks load across 4 categories. Tabs work. Hacked mode prefixes applied.
- **Step 2 (Customization)**: Radio buttons for options render with defaults. Progress at 50%.
- **Step 3 (Guest Info)**: Auto-generated hacker name "Malicious Kernel" (correct for hacked mode). Special request field works.
- **Step 4 (Review)**: Order summary displays name, drink, customizations correctly.
- **Order Submission**: Successfully created order. Confirmation page shows Order ID, queue number (#1), estimated wait (4 min), live updates indicator, barista quote, and next steps.

### Admin Module

- **Status**: PASS
- **Login**: Password form works, access granted with correct password.
- **Dashboard**: Shows Order Management, Menu Management, System Status (all Active), Hacked Mode toggle (ON).
- **Order Management**: Displays the test order with all details (guest name, drink, options, queue position, estimated time, priority level). Batch query optimization confirmed via network requests — exactly 3 Supabase queries.

### Console Errors

- **Status**: PASS — 0 errors across all pages

---

## Exploratory Testing — Mobile (375×812)

### Welcome Page

- **Status**: PASS — Layout adapts correctly, CTA links stack vertically

### Guest Module

- **Status**: PASS — Drink cards render in full-width layout, tabs horizontally scrollable, all 19 drinks accessible

### Console Errors

- **Status**: PASS — 0 errors

---

## Performance Analysis

### Navigation Timing (Welcome Page — localhost)

| Metric | Value |
|--------|-------|
| First Byte (TTFB) | 6ms |
| DOM Interactive | 18ms |
| DOM Content Loaded | 86ms |
| Load Complete | 429ms |
| Resource Count | 61 |

### Navigation Timing (Guest Module — localhost)

| Metric | Value |
|--------|-------|
| First Byte (TTFB) | 6ms |
| DOM Interactive | 14ms |
| DOM Content Loaded | 75ms |
| Load Complete | 448ms |
| Resource Count | 99 |

### Network Query Analysis (Admin Order Dashboard)

| Before Optimization | After Optimization |
|---------------------|-------------------|
| 1 orders query + 50 options queries + 50 completion time queries = **101+ queries** | 1 orders query + 1 batch options query + 1 pending orders query = **3 queries** |

### Bundle Size (Code Splitting)

| Chunk | Size | Gzip |
|-------|------|------|
| `index.js` (main) | 46.9 KB | 18.2 KB |
| `GuestModule.js` (lazy) | 70.6 KB | 17.9 KB |
| `BaristaModule.js` (lazy) | 164.2 KB | 36.4 KB |
| `NotFound.js` (lazy) | 1.6 KB | 0.7 KB |
| `ServerError.js` (lazy) | 2.8 KB | 1.2 KB |
| `vendor.js` (React) | 142.3 KB | 45.6 KB |
| `supabase.js` | 123.2 KB | 34.2 KB |

Guest users no longer download the 164KB BaristaModule. Admin users no longer download the 70KB GuestModule on initial load.

---

## Issues Found & Fixed

No new issues were found during regression testing. All functionality works as expected.
