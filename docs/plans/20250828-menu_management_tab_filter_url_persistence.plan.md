---
description: "Implementation plan for URL persistence in Menu Management tabs and filters"
created-date: 2025-08-28
---

# Implementation Plan for Menu Management Tab and Filter URL Persistence

## OBJECTIVE

Extend URL persistence in the Barista Admin Module to include:

1. Menu Management navigation tabs: "Drink Categories", "Drinks", and "Option Categories"
2. Menu Management Drinks "Filter by Categories" dropdown (currently resets to "All Categories" on refresh)

This will complete the URL persistence implementation across the entire Barista Admin Module, ensuring that baristas don't lose their current tab selection or applied filters when refreshing the page.

## IMPLEMENTATION PLAN

- [ ] Step 1: Add URL Parameter Support for Menu Management Tabs
  - **Task**: Extend the existing URL parameter structure to include Menu Management tab persistence
  - **Files**:
    - `src/pages/MenuManagement.tsx`: Add `useSearchParams` hook and URL parameter logic for tab persistence
    - `src/components/menu/MenuTabs.tsx`: Update tab change handler to work with URL parameters
  - **Dependencies**: React Router DOM `useSearchParams` hook (already available)
  - **Changes**:
    - Import `useSearchParams` from `react-router-dom` in MenuManagement component
    - Replace `useState` for `activeTab` with URL parameter-based state management
    - Add logic to read initial tab from URL parameter `tab` (e.g., `/admin?view=menu&tab=drinks`)
    - Update tab change handlers to set URL parameters when changing tabs
    - Handle invalid tab parameters by defaulting to `'categories'`
    - Ensure tab parameter is cleared when navigating away from Menu Management

  - **Pseudocode**:

    ```typescript
    import { useSearchParams } from 'react-router-dom'
    
    export const MenuManagement: React.FC = () => {
      const [searchParams, setSearchParams] = useSearchParams()
      const tabParam = searchParams.get('tab') as MenuTab | null
      const activeTab: MenuTab = tabParam && ['categories', 'drinks', 'options'].includes(tabParam) ? tabParam : 'categories'
      
      const setActiveTab = (tab: MenuTab) => {
        const newParams = new URLSearchParams(searchParams)
        if (tab === 'categories') {
          newParams.delete('tab') // Default tab, no parameter needed
        } else {
          newParams.set('tab', tab)
        }
        setSearchParams(newParams)
      }
      
      // Pass setActiveTab to MenuTabs component
    }
    ```

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 2: Add URL Parameter Support for Drinks Filter
  - **Task**: Implement URL parameter persistence for the category filter in the Drinks tab
  - **Files**:
    - `src/pages/MenuManagement.tsx`: Add URL parameter logic for filter persistence
    - `src/components/menu/MenuSearch.tsx`: Update filter change handler to work with URL parameters
  - **Dependencies**: Step 1 completion
  - **Changes**:
    - Extend URL parameter handling to include filter state (e.g., `/admin?view=menu&tab=drinks&categoryId=abc123`)
    - Replace `useState` for `filters` with URL parameter-based state management
    - Add logic to read initial filters from URL parameters
    - Update filter change handlers to set URL parameters when applying filters
    - Handle invalid filter parameters by defaulting to empty filters
    - Ensure filter parameters are cleared when switching tabs or navigating away
    - Preserve other filter types (status, sortBy, sortOrder) in URL parameters

  - **Pseudocode**:

    ```typescript
    const MenuManagement: React.FC = () => {
      // ... existing tab logic from Step 1
      
      const filtersFromUrl = useMemo(() => {
        const filters: MenuFilters = {}
        const categoryId = searchParams.get('categoryId')
        const isActive = searchParams.get('isActive')
        const sortBy = searchParams.get('sortBy')
        const sortOrder = searchParams.get('sortOrder')
        
        if (categoryId) filters.categoryId = categoryId
        if (isActive !== null) filters.isActive = isActive === 'true'
        if (sortBy) filters.sortBy = sortBy as MenuFilters['sortBy']
        if (sortOrder) filters.sortOrder = sortOrder as MenuFilters['sortOrder']
        
        return filters
      }, [searchParams])
      
      const handleFilter = (newFilters: MenuFilters) => {
        const newParams = new URLSearchParams(searchParams)
        
        // Clear existing filter parameters
        newParams.delete('categoryId')
        newParams.delete('isActive')
        newParams.delete('sortBy')
        newParams.delete('sortOrder')
        
        // Set new filter parameters
        if (newFilters.categoryId) newParams.set('categoryId', newFilters.categoryId)
        if (newFilters.isActive !== undefined) newParams.set('isActive', String(newFilters.isActive))
        if (newFilters.sortBy) newParams.set('sortBy', newFilters.sortBy)
        if (newFilters.sortOrder) newParams.set('sortOrder', newFilters.sortOrder)
        
        setSearchParams(newParams)
      }
    }
    ```

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 3: Handle URL Parameter Cleanup and Edge Cases
  - **Task**: Ensure proper cleanup of URL parameters when navigating between tabs and implement edge case handling
  - **Files**:
    - `src/pages/MenuManagement.tsx`: Add parameter cleanup logic
  - **Dependencies**: Steps 1-2 completion
  - **Changes**:
    - Clear filter parameters when switching from drinks tab to other tabs
    - Handle invalid tab/filter combinations gracefully
    - Ensure URL parameters don't accumulate unnecessarily
    - Add proper parameter validation and sanitization
    - Handle tab-specific filter visibility (category filter only shows on drinks tab)

  - **Pseudocode**:

    ```typescript
    const setActiveTab = (tab: MenuTab) => {
      const newParams = new URLSearchParams(searchParams)
      
      // Clear tab parameter for default tab
      if (tab === 'categories') {
        newParams.delete('tab')
      } else {
        newParams.set('tab', tab)
      }
      
      // Clear filters that don't apply to the current tab
      if (tab !== 'drinks') {
        newParams.delete('categoryId') // Category filter only applies to drinks
      }
      
      setSearchParams(newParams)
    }
    ```

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 4: Update Search Query Persistence
  - **Task**: Extend URL parameter support to include search query persistence
  - **Files**:
    - `src/pages/MenuManagement.tsx`: Add search query URL parameter handling
  - **Dependencies**: Steps 1-3 completion
  - **Changes**:
    - Add URL parameter for search query (e.g., `&search=coffee`)
    - Replace `useState` for `searchQuery` with URL parameter-based state management
    - Update search handlers to set URL parameters
    - Clear search parameter when switching tabs if desired
    - Handle URL encoding/decoding for search queries

  - **Pseudocode**:

    ```typescript
    const searchQueryFromUrl = searchParams.get('search') || ''
    
    const handleSearch = (query: string) => {
      const newParams = new URLSearchParams(searchParams)
      if (query.trim()) {
        newParams.set('search', query.trim())
      } else {
        newParams.delete('search')
      }
      setSearchParams(newParams)
    }
    ```

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 5: Manual Testing and Validation
  - **Task**: Manually test the implemented URL persistence features using the application
  - **Files**: N/A (manual testing)
  - **Dependencies**: Steps 1-4 completion and running application
  - **Changes**:
    - Navigate to Menu Management and test tab switching with browser refresh
    - Apply filters in Drinks tab and test browser refresh preserves filters
    - Test search query persistence across browser refresh
    - Test URL parameter cleanup when switching tabs
    - Test deep linking to specific tab/filter combinations
    - Verify invalid URL parameters gracefully default to expected states

  - **Expected Outcomes**:
    - `/admin?view=menu` shows Menu Management with Categories tab (default)
    - `/admin?view=menu&tab=drinks` shows Menu Management with Drinks tab
    - `/admin?view=menu&tab=options` shows Menu Management with Option Categories tab
    - `/admin?view=menu&tab=drinks&categoryId=123` shows Drinks tab with category filter applied
    - Browser refresh preserves current tab and filter state in all cases
    - Invalid tab/filter parameters default to safe values
    - URL parameters are properly cleaned when switching tabs

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 6: Write Unit Tests for Menu Management URL Persistence
  - **Task**: Create comprehensive unit tests to verify URL parameter handling for tabs and filters
  - **Files**:
    - `src/pages/__tests__/MenuManagement.test.tsx`: New test file for Menu Management URL persistence
    - `src/components/menu/__tests__/MenuTabs.test.tsx`: Update or create tests for tab URL integration
  - **Dependencies**: Steps 1-5 completion
  - **Changes**:
    - Test default tab behavior with no URL parameters
    - Test tab selection with valid URL parameters (`?tab=drinks`, `?tab=options`)
    - Test invalid tab parameters default to categories
    - Test filter parameter handling for drinks tab
    - Test URL parameter cleanup when switching tabs
    - Test search query parameter persistence
    - Test component re-render with maintained state

  - **Pseudocode**:

    ```typescript
    describe('MenuManagement URL Parameter Handling', () => {
      it('defaults to categories tab when no URL parameters', () => {
        render(<MenuManagement />, { initialEntries: ['/admin?view=menu'] })
        expect(activeTabElement).toHaveTextContent('Drink Categories')
      })
      
      it('shows drinks tab when URL parameter is tab=drinks', () => {
        render(<MenuManagement />, { initialEntries: ['/admin?view=menu&tab=drinks'] })
        expect(activeTabElement).toHaveTextContent('Drinks')
      })
      
      it('preserves category filter on drinks tab refresh', () => {
        render(<MenuManagement />, { initialEntries: ['/admin?view=menu&tab=drinks&categoryId=123'] })
        expect(categoryFilterElement).toHaveValue('123')
      })
    }
    ```

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 7: Write Playwright E2E Tests for URL Persistence
  - **Task**: Create end-to-end tests to verify Menu Management URL persistence in browser environment
  - **Files**:
    - `tests/e2e/admin/menu-management-url-persistence.spec.ts`: New E2E test file for URL persistence
  - **Dependencies**: Steps 1-6 completion
  - **Changes**:
    - Test navigation to Menu Management and tab switching with URL updates
    - Test browser refresh preserves tab and filter state
    - Test deep linking to specific tab/filter combinations
    - Test URL parameter validation and fallback behavior
    - Test search query persistence across refresh

  - **Pseudocode**:

    ```typescript
    test.describe('Menu Management URL Persistence', () => {
      test('preserves drinks tab on browser refresh', async ({ page }) => {
        await page.goto('/admin?view=menu&tab=drinks')
        await page.reload()
        await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Drinks')
      })
      
      test('preserves category filter on refresh', async ({ page }) => {
        await page.goto('/admin?view=menu&tab=drinks&categoryId=123')
        await page.reload()
        await expect(page.locator('#category-filter')).toHaveValue('123')
      })
    })
    ```

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 8: Compliance with Definition of Done
  - **Task**: Ensure implementation meets all Definition of Done criteria
  - **Files**: Multiple files for validation
  - **Dependencies**: Steps 1-7 completion
  - **Changes**:
    - Run all tests and ensure they pass
    - Run linting and ensure code quality standards
    - Test accessibility with screen readers and keyboard navigation
    - Verify mobile responsiveness of URL persistence features
    - Check performance impact of URL parameter changes
    - Validate that existing functionality remains unchanged
    - Ensure proper error handling and edge cases are covered
    - Verify documentation is updated if needed

  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running the app, follow [npm-run-instructions](/.github/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.github/prompt-snippets/cli-execution-instructions.md)
    - If you are using Supabase CLI, follow [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.github/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

## TECHNICAL NOTES

### Implementation Approach

- Use React Router's `useSearchParams` hook for URL parameter management (consistent with existing Barista Module implementation)
- Extend the existing URL parameter schema: `/admin?view=menu&tab=drinks&categoryId=123&search=coffee`
- Maintain existing component structure and props for minimal disruption
- Replace component-level `useState` with URL parameter-based state management
- Preserve all existing functionality and styling

### URL Parameter Schema

- `view=menu`: Menu Management view (already implemented)
- `tab=categories|drinks|options`: Active tab selection (default: categories)
- `categoryId=<uuid>`: Selected category filter for drinks tab
- `isActive=true|false`: Active/inactive status filter
- `sortBy=name|created_at|display_order`: Sort field selection
- `sortOrder=asc|desc`: Sort direction
- `search=<query>`: Search query string

### Error Handling

- Invalid tab parameters gracefully default to categories
- Invalid filter parameters are ignored with fallback to defaults
- Missing search parameters default to empty string
- Maintain type safety with MenuTab and MenuFilters type checking

### Performance Considerations

- URL parameter changes trigger minimal re-renders
- No impact on existing Supabase real-time subscriptions
- Navigation remains instant and responsive
- Debounced search handling preserves existing performance

### Backward Compatibility

- Existing URLs without tab parameters continue to work
- All existing Menu Management functionality preserved
- No breaking changes to component APIs
- Maintain existing analytics tracking

## VALIDATION STEPS

After implementation, verify the following behaviors:

1. **Tab Persistence**: Navigate to each tab (Categories, Drinks, Options), refresh browser, verify tab selection persists
2. **Filter Persistence**: Apply category filter in Drinks tab, refresh browser, verify filter selection persists
3. **Search Persistence**: Enter search query, refresh browser, verify search query persists
4. **Tab Switching**: Switch between tabs, verify URL updates correctly and filter parameters are cleaned appropriately
5. **Deep Linking**: Direct navigation to `/admin?view=menu&tab=drinks&categoryId=123` works correctly
6. **Invalid Parameters**: URLs with invalid tab/filter values default to safe states
7. **Mobile Compatibility**: URL persistence works correctly on mobile devices
8. **Navigation Integration**: URL parameters work seamlessly with existing Barista Admin navigation

## EXPECTED OUTCOMES

- Complete URL persistence for Menu Management tabs and filters
- Improved user experience for baristas managing menu items
- Consistent behavior with existing Barista Module URL persistence
- No breaking changes to existing functionality
- Enhanced deep linking capabilities for Menu Management
- Reduced frustration from losing tab/filter state on browser refresh
