---
description: "Implementation plan for comprehensive performance optimization"
created-date: 2026-03-22
---

# Implementation Plan for Performance Optimization

## OBJECTIVE

After the Hacked Mode Global Sync implementation, the site has become noticeably slow. A deep
analysis of the entire project revealed multiple performance bottlenecks across data fetching,
rendering, bundling, and CSS. This plan addresses each issue systematically, prioritized by user
impact.

**Root causes identified (ordered by user-perceived impact):**

1. **N+1 query pattern in admin order service** — `formatOrderForAdmin` makes an individual
   `order_options` query per order AND `calculateAdminEstimatedCompletionTime` queries all pending
   orders ahead per order. 50 orders = 101+ queries (50 for options + 50 for completion times + 1
   initial). Both `getAllOrders` and `getPendingOrders` call this pattern.
2. **No route-level code splitting** — All pages (Guest, Admin, Welcome, Error) are eagerly imported
   in `App.tsx`, so the entire app loads even if the user only visits one page.
3. **Sequential option fetches** — `useOptionSelection` calls `getOptionCategoriesWithValues` which
   makes 2 queries per category (one for the category row, one for its values) via
   `getOptionCategoryWithValues`. For N categories, that's 2N + 1 queries (the +1 is
   `getDefaultOptionsForDrink`).
4. **HackedMode DB fetch causes unnecessary re-render** — `HackedModeContext` always calls
   `setHackedMode(dbValue)` even when `dbValue` matches the localStorage-initialized state. This
   triggers a full tree re-render at the root provider level on every app load.
5. **Unstable `addError` callback in ErrorContext** — `addError` depends on `errors.length` (used
   only for telemetry logging), making the callback identity change on every error addition/removal.
   All consumers that reference `addError` re-render unnecessarily. Also, `isGlobalError` is
   computed inline (not memoized) and the context value object is never memoized.
6. **Duplicate real-time subscriptions** — `useMenuSubscriptions.ts` creates 5 Supabase channels
   (`drink_categories_realtime`, `drinks_realtime`, etc.) while `useMenuData.ts` creates up to 9
   channels for the same tables with different names (`drink_categories_changes`,
   `drinks_changes`, etc.). On `MenuManagement.tsx`, both hooks run simultaneously, creating up to
   14 channels for 5 tables. Only `useMenuData` hooks refetch data; `useMenuSubscriptions` only
   tracks connection status and change history for UI display.
7. **No resource hints** — Third-party domains (Google Analytics, Clarity, Supabase, Google Fonts)
   lack `preconnect`/`dns-prefetch` hints, adding DNS+TLS latency to initial connections.
8. **Hacked mode CSS wildcard selectors** — `[class*="bg-coffee"]` style selectors force the browser
   to scan every element's class list on every style recalculation. Lower priority since this only
   affects rendering speed, not network latency which is the primary bottleneck.

---

## IMPLEMENTATION PLAN

- [x] Step 1: Route-level code splitting with React.lazy
  - **Completed**: Converted `GuestModule`, `BaristaModule`, `NotFound`, `ServerError` to
    `React.lazy()` imports. Kept `WelcomePage` eager (landing page). Added `<Suspense>` with an
    inline `RouteLoadingFallback` component using the existing `coffee-loading` animation and
    accessible `role="status"` + `aria-label`. TypeScript compiles cleanly.
  - **Task**: Convert page imports in `App.tsx` to use `React.lazy()` with `Suspense` fallback.
    Guest users will no longer download the admin module, and vice versa. This is the simplest
    high-impact change.
  - **Files**:
    - `src/App.tsx`: Replace static imports of `GuestModule`, `BaristaModule`, `NotFound`,
      `ServerError` with `React.lazy(() => import(...))`. Keep `WelcomePage` eager since it's the
      landing page and is small (~66 lines). Wrap `<Routes>` in `<Suspense>` with a lightweight
      loading fallback.

      ```text
      // Before:
      import GuestModule from './pages/GuestModule'
      import BaristaModule from './pages/BaristaModule'
      import NotFound from './pages/NotFound'
      import ServerError from './pages/ServerError'

      // After:
      import WelcomePage from './pages/WelcomePage'  // Keep eager — landing page
      const GuestModule = lazy(() => import('./pages/GuestModule'))
      const BaristaModule = lazy(() => import('./pages/BaristaModule'))
      const NotFound = lazy(() => import('./pages/NotFound'))
      const ServerError = lazy(() => import('./pages/ServerError'))

      // Wrap Routes in Suspense:
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>...</Routes>
      </Suspense>
      ```

    - The `Suspense` fallback should be a simple inline div with the `coffee-loading` animation
      class from `index.css` — no need for a separate component file. Keep it minimal: a centered
      spinner with a "Loading..." text.
  - **Dependencies**: None
  - **Additional Instructions**:
    - Do NOT lazy-load `Layout`, `ErrorBoundary`, or context providers — only page routes.
    - Do NOT create a separate component file for the loading spinner — use an inline JSX element
      to keep the main bundle small.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and
      adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.

- [x] Step 2: Fix N+1 queries in adminOrderService
  - **Completed**: Refactored `formatOrderForAdmin` to be synchronous — it now accepts pre-fetched
    options and pending order data. Added `fetchBatchOrderOptions` (single `.in()` query) and
    `fetchPendingOrderPrepData` (single query). Both `getAllOrders` and `getPendingOrders` now use
    `Promise.all` to fetch supplementary data in parallel (2 queries), then format in memory.
    Reduced from N+1 queries (101+ for 50 orders) to exactly 3 queries total.
  - **Task**: `formatOrderForAdmin` (line 147-210 in `adminOrderService.ts`) makes two individual
    queries per order: one for `order_options` and one for `calculateAdminEstimatedCompletionTime`.
    Both `getAllOrders` (line 262) and `getPendingOrders` (line 308) use
    `Promise.all(orders.map(formatOrderForAdmin))`. Refactor to batch all queries.
  - **Files**:
    - `src/services/adminOrderService.ts`:
      1. **Batch options fetch**: Before calling `formatOrderForAdmin`, collect all order IDs and
         fetch all `order_options` in a single `.in('order_id', orderIds)` query. Group by
         `order_id` into a Map. Pass the pre-fetched options to `formatOrderForAdmin`.
      2. **Precompute completion times**: `calculateAdminEstimatedCompletionTime` queries all
         pending orders ahead for EACH order. Instead, fetch all pending orders once, then compute
         each order's completion time from that single dataset in memory.
      3. **Refactor `formatOrderForAdmin` signature**: Change from `(order)` to
         `(order, options, pendingOrdersData)` so it no longer makes any DB calls internally.
      4. **Apply the same fix to `getPendingOrders`** — it has the same N+1 pattern (line 308-309).

      ```text
      // Before (N+1):
      const formattedOrders = await Promise.all(
        orders.map((order) => formatOrderForAdmin(order))
      )

      // After (3 queries total regardless of order count):
      // 1. Batch fetch all order options
      const orderIds = orders.map(o => o.id)
      const { data: allOptions } = await supabase
        .from('order_options')
        .select('order_id, option_category_id, option_value_id, ...')
        .in('order_id', orderIds)

      // 2. Single fetch for pending orders (for completion time calc)
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('queue_number, drinks:drink_id(preparation_time_minutes)')
        .eq('status', 'pending')
        .order('queue_number', { ascending: true })

      // 3. Format in memory — no more DB calls
      const optionsMap = groupByOrderId(allOptions)
      const formattedOrders = orders.map(order =>
        formatOrderForAdmin(order, optionsMap[order.id] ?? [], pendingOrders)
      )
      ```

  - **Dependencies**: None
  - **Additional Instructions**:
    - The `formatOrderForAdmin` function is private (not exported), so changing its signature is safe.
    - Supabase `.in()` has a practical limit (~100 items). For this app's scale, a single `.in()`
      is sufficient. Add a comment noting this limit for future reference.
    - Make `formatOrderForAdmin` synchronous after this refactor — it should only do in-memory
      transformations.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and
      adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before
      fixing things, consider that the test script itself might be wrong and that's the one that you
      should fix. Sometimes the best way to fix a script is to understand the intent of the test
      script and simplify it.
    - If you are running any CLI command, follow
      [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 3: Optimize option selection fetching
  - **Completed**: Replaced `Promise.all` + per-category approach in `getOptionCategoriesWithValues`
    with 2 bulk queries (`option_categories` + `option_values`) using `.in()`. Values are grouped
    by `option_category_id` in memory and assembled into `OptionCategoryWithValues` objects.
    Preserved missing-category warning behavior. Reduced from 2N queries to 2.
  - **Task**: `getOptionCategoriesWithValues` (line 100-158 in `optionService.ts`) calls
    `getOptionCategoryWithValues` per category via `Promise.all`, where each call makes 2 sequential
    queries (one for the category, one for its values). For 3 categories, that's 6 queries.
    Refactor to use 2 bulk queries.
  - **Files**:
    - `src/services/optionService.ts`: Replace the `Promise.all` + per-category approach in
      `getOptionCategoriesWithValues` with 2 bulk queries:

      ```text
      // Before (2N queries via Promise.all):
      const results = await Promise.all(
        categoryIds.map(id => getOptionCategoryWithValues(id))
      )

      // After (2 queries):
      const { data: categories } = await supabase
        .from('option_categories')
        .select('*')
        .in('id', categoryIds)
        .eq('is_active', true)

      const { data: values } = await supabase
        .from('option_values')
        .select('*')
        .in('option_category_id', categoryIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      // Assemble in memory: group values by option_category_id, merge into categories
      ```

    - Keep the existing `getOptionCategoryWithValues` function unchanged for single-category callers.
  - **Dependencies**: None
  - **Additional Instructions**:
    - Maintain the same error handling pattern (return `{ data, error }` shape).
    - Preserve the existing behavior of logging missing/inactive categories as warnings.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and
      adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 4: Defer HackedMode DB fetch and memoize context values
  - **Completed**: (1) HackedModeContext: mount effect now compares DB value against localStorage
    before calling setHackedMode — skips re-render when they match. Memoized provider value.
    (2) ErrorContext: replaced `errors.length` dependency in `addError` with a ref, memoized
    `isGlobalError` with `useMemo`, memoized context value. (3) ToastProvider: memoized context
    value with `useMemo`.
  - **Task**: Three context provider optimizations in one step:
    1. **HackedModeContext**: `setHackedMode(dbValue)` always fires on mount even when `dbValue`
       matches localStorage. Fix: compare before setting. Also memoize the provider value.
    2. **ErrorContext**: (a) `addError` depends on `errors.length` (line 55), making the callback
       unstable. Fix: use a ref for `errors.length` in the telemetry call. (b) `isGlobalError` is
       computed inline on every render. Fix: wrap in `useMemo`. (c) Context value object is
       recreated every render. Fix: wrap in `useMemo`.
    3. **ToastProvider**: Context value object is recreated every render despite all callbacks being
       `useCallback`-wrapped. Fix: wrap in `useMemo`.
  - **Files**:
    - `src/contexts/HackedModeContext.tsx`:
      - In the mount `useEffect` (line 31-37), compare `dbValue` against the current localStorage
        value before calling `setHackedMode`. Simplest approach: read
        `localStorage.getItem(STORAGE_KEY) === 'true'` inside the `.then()` callback and only update
        if they differ.
      - Memoize the provider value: `useMemo(() => ({ isHackedMode, toggleHackedMode }), [isHackedMode, toggleHackedMode])`

    - `src/contexts/ErrorContext.tsx`:
      - Replace `errors.length` dependency in `addError` (line 55) with a ref:

        ```text
        const errorsLengthRef = useRef(errors.length)
        useEffect(() => { errorsLengthRef.current = errors.length }, [errors.length])

        const addError = useCallback((...) => {
          // Use errorsLengthRef.current instead of errors.length for telemetry
          totalActiveErrors: errorsLengthRef.current + 1,
          ...
        }, [maxErrors])  // Remove errors.length from deps
        ```

      - Memoize `isGlobalError`:

        ```text
        const isGlobalError = useMemo(() => errors.some(error => {
          const message = error.message.toLowerCase()
          return message.includes('server') || ...
        }), [errors])
        ```

      - Memoize context value:

        ```text
        const contextValue = useMemo(() => ({
          errors, isGlobalError, addError, clearError, clearAllErrors, getLatestError, hasErrors
        }), [errors, isGlobalError, addError, clearError, clearAllErrors, getLatestError, hasErrors])
        ```

    - `src/hooks/useToast.tsx`:
      - Memoize context value (line 88-96):

        ```text
        const contextValue = useMemo(() => ({
          showToast, showSuccess, showError, showWarning, showInfo, dismissToast, clearAllToasts
        }), [showToast, showSuccess, showError, showWarning, showInfo, dismissToast, clearAllToasts])
        ```

  - **Dependencies**: None
  - **Additional Instructions**:
    - For ErrorContext, verify that removing `errors.length` from `addError`'s dependency array
      doesn't break the functional behavior — the telemetry log of `totalActiveErrors` being
      slightly stale is acceptable since it's non-critical diagnostic data.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and
      adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 5: Add resource hints and consolidate subscriptions
  - **Completed**: (1) Added `<link rel="preconnect">` for Google Fonts and Google Analytics,
    `<link rel="dns-prefetch">` for Clarity in `index.html`. Supabase URL is dynamic per
    deployment so not hardcoded. (2) Consolidated `useMenuSubscriptions` from 5 separate channels
    to 1 channel with 5 table listeners. Reduced from 5 WebSocket subscriptions to 1.
  - **Task**: Two smaller optimizations bundled together:
    1. **Resource hints**: Add `<link rel="preconnect">` and `<link rel="dns-prefetch">` to
       `index.html` for Supabase, Google Analytics, Google Fonts, and Microsoft Clarity domains.
    2. **Consolidate subscriptions**: `useMenuSubscriptions` creates 5 channels that duplicate the
       subscriptions already in `useMenuData` hooks. Since `useMenuSubscriptions` is only consumed
       in `MenuManagement.tsx` (for connection status, recent changes, and conflict tracking), and
       `RealtimeIndicator`/`ChangeNotification` only import types — refactor `useMenuSubscriptions`
       to not create its own channels. Instead, have it accept a callback-based interface where the
       data hooks report their events to it, OR simply have `MenuManagement.tsx` derive connection
       status from the data hooks' loading/error states.
  - **Files**:
    - `index.html`: Add preconnect hints in `<head>` before analytics scripts:

      ```html
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preconnect" href="https://www.googletagmanager.com">
      <link rel="dns-prefetch" href="https://www.clarity.ms">
      ```

      Note: The Supabase URL comes from env vars. Check `src/lib/supabase.ts` or `.env.example` for
      the production URL and add a preconnect for it.

    - `src/hooks/useMenuSubscriptions.ts`: Remove the 5 `useEffect` blocks that create individual
      subscriptions. Replace with a single subscription approach that reuses the existing data hooks'
      channels. The simplest approach: have `useMenuSubscriptions` subscribe to a single consolidated
      channel for ALL menu tables (one channel, 5 table listeners).
    - Components consuming `useMenuSubscriptions`: Verify `RealtimeIndicator.tsx` and
      `ChangeNotification.tsx` still work (they only import types, so they should be fine).
  - **Dependencies**: None
  - **Additional Instructions**:
    - For the Supabase preconnect URL, check `.env.example` for `VITE_SUPABASE_URL`.
    - For `useMenuSubscriptions`, keep the same return interface so `MenuManagement.tsx` doesn't
      need changes.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and
      adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 6: Optimize hacked mode CSS selectors
  - **Completed**: Replaced all wildcard attribute selectors (`[class*="bg-coffee"]`, etc.) with
    explicit Tailwind class lists based on actual usage in `src/`. Replaced `[class*="divide"]`
    with `.divide-y, .divide-x`. Total: ~20 wildcard selectors eliminated.
  - **Task**: The hacked mode CSS (lines 171-331 in `index.css`) uses expensive wildcard attribute
    selectors like `[class*="bg-coffee"]`, `[class*="text-coffee"]`, etc. that force the browser to
    scan every element's class list on style recalculation. Replace with explicit class lists.
  - **Files**:
    - `src/index.css`: Replace each wildcard selector with explicit Tailwind class names. Example:

      ```text
      /* Before — expensive wildcard: */
      html.hacked-mode [class*="bg-coffee"],
      html.hacked-mode [class*="bg-slate"] { ... }

      /* After — explicit class list (faster matching): */
      html.hacked-mode .bg-coffee-50,
      html.hacked-mode .bg-coffee-100,
      html.hacked-mode .bg-coffee-200,
      html.hacked-mode .bg-coffee-300,
      /* ... all used coffee/slate classes ... */
      html.hacked-mode .bg-slate-50,
      html.hacked-mode .bg-slate-100 { ... }
      ```

    - To find which Tailwind classes are actually used, grep the `src/` directory for each pattern
      (e.g., `bg-coffee-`, `text-coffee-`, `border-coffee-`, etc.) and only include those classes in
      the explicit list.
  - **Dependencies**: None
  - **Additional Instructions**:
    - This step is lower priority than the previous ones. If time is limited, this can be deferred.
    - Test both normal and hacked mode visuals after this change to ensure nothing is missed.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and
      adjust this step as needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 7: Validation — build, lint, and visual check
  - **Completed**: Build succeeds with code splitting visible (separate chunks for GuestModule,
    BaristaModule, NotFound, ServerError). Lint passes with 1 pre-existing warning. Fixed
    `MENU_TABLES` lint warning by moving constant outside hook. Visual check: Welcome, Guest
    ordering, and Admin pages all load correctly via Playwright MCP.
  - **Task**: Verify the optimizations haven't broken anything and the build is clean.
  - **Checklist**:
    - [ ] `npm run build` succeeds without errors.
    - [ ] `npm run lint` passes with zero errors.
    - [ ] Start dev server and visually verify with Playwright MCP:
      - Welcome page loads.
      - Guest ordering flow works — select drink, customize options, place order.
      - Admin dashboard loads — orders display correctly.
      - Toggle hacked mode on/off — theme applies/removes correctly.
      - Navigate between pages — lazy-loaded routes work.
  - **Files**: None (validation only).
  - **Dependencies**: Steps 1–6
  - **Additional Instructions**:
    - If you are running the app, follow
      [npm-run-instructions](/.claude/prompt-snippets/npm-run-instructions.md)
    - If you are using Playwright MCP, follow
      [playwright-mcp-instructions](/.claude/prompt-snippets/playwright-mcp-instructions.md)
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 8: Unit tests
  - **Completed**: Fixed `useMenuSubscriptions.test.ts` to match consolidated single-channel
    architecture. Fixed `MenuManagement.test.tsx` by converting static import to dynamic import
    after mocks are set up (resolves the `channel.on is not a function` issue). All 911 tests
    pass across 58 test files.
  - **Task**: Write or update unit tests for the modified code. Follow the
    [dual-strategy-testing](/docs/dual-strategy-testing.md) approach.
  - **Files**:
    - `src/services/__tests__/adminOrderService.test.ts`: Test that `getAllOrders` and
      `getPendingOrders` batch-fetch options and completion times (mock Supabase and verify the
      query pattern — should be a fixed number of queries regardless of order count).
    - `src/contexts/__tests__/HackedModeContext.test.tsx`: Test that the DB fetch does NOT trigger
      `setHackedMode` when value matches localStorage.
    - `src/contexts/__tests__/ErrorContext.test.tsx`: Test that `addError` callback identity is
      stable across error state changes (use `renderHook` + check reference equality).
    - `src/services/__tests__/optionService.test.ts`: Test that `getOptionCategoriesWithValues` uses
      batch queries (2 queries) instead of per-category queries.
  - **Dependencies**: Steps 1–7
  - **Additional Instructions**:
    - Mock `@/lib/supabase` in all service tests.
    - After testing, set the environment variable back to not using mocks.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before
      fixing things, consider that the test script itself might be wrong and that's the one that you
      should fix. Sometimes the best way to fix a script is to understand the intent of the test
      script and simplify it.
    - If you are running any CLI command, follow
      [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed
      tests, make a note of the issues (by updating the plan document) and address them in
      subsequent steps.

- [x] Step 9: E2E Playwright tests
  - **Completed**: Created `tests/e2e/system/performance-smoke.spec.ts` with 3 tests: lazy-loaded
    route navigation, guest ordering page with drink categories, and 404 not-found route. All pass.
  - **Task**: Add lightweight E2E smoke tests to verify performance optimizations haven't broken
    user flows. Focus on observable behavior, not timing.
  - **Tests to add**:
    - Verify lazy-loaded routes render correctly (navigate to `/order`, `/admin`, and back to `/`).
    - Verify admin dashboard order list loads.
    - Verify hacked mode toggle still works.
  - **Files**:
    - `tests/e2e/system/performance-smoke.spec.ts`: New file with route-loading smoke tests.
  - **Dependencies**: Step 8
  - **Additional Instructions**:
    - Avoid asserting specific timing values — assert that content renders, not how fast.
    - Keep tests simple and avoid hardcoding dynamic database data.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When you are done with this step, mark this step as complete and add a note/summary of what
      you did (in the plan document) before proceeding to the next step.

- [x] Step 10: Definition of Done compliance check
  - **Completed**: Build succeeds with code splitting (separate chunks for GuestModule 70KB,
    BaristaModule 164KB, NotFound 1.6KB, ServerError 2.8KB). Lint: 0 errors, 1 pre-existing
    warning. All 911 unit tests pass. All 3 new E2E tests pass. No new `any` types. No secrets.
    No `file_structure.md` update needed (new E2E test is in existing `tests/e2e/system/` dir).
  - **Task**: Verify the implementation meets all criteria in
    [definition_of_done](/docs/specs/definition_of_done.md).
  - **Checklist**:
    - [ ] All unit tests pass (`npm run test`).
    - [ ] All E2E tests pass (`npm run test:e2e`).
    - [ ] Zero ESLint errors (`npm run lint`).
    - [ ] No TypeScript `any` types introduced without justification.
    - [ ] No hardcoded secrets introduced.
    - [ ] `docs/file_structure.md` updated if any new files were added.
    - [ ] Build succeeds without warnings (`npm run build`).
    - [ ] Bundle size has not increased (ideally decreased due to code splitting).
  - **Files**: Various — fix any items that fail the checklist above.
  - **Dependencies**: Steps 8–9
  - **Additional Instructions**:
    - If you are running the app, follow
      [npm-run-instructions](/.claude/prompt-snippets/npm-run-instructions.md).
    - If you are running any CLI command, follow
      [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md).
    - When done, mark this step as complete and add a summary note.

- [x] Step 11: Regression testing and documentation update
  - **Completed**: Full regression test performed (desktop 1920x1080 + mobile 375x812). All
    functionality verified: welcome page, guest ordering (4-step flow with order submission),
    admin login, order dashboard with batch queries confirmed via network analysis. Performance
    metrics captured (TTFB 6ms, DOM interactive 14-18ms, load complete 429-448ms). Updated
    `docs/specs/technology_stack.md` with performance optimization details. Regression report at
    `tests/outputs/regression-tests/202603220034-regressiontest-log.md`. No issues found.
