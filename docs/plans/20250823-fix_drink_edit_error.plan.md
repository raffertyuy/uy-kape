---
description: "Implementation plan for fixing 'Cannot coerce the result to a single JSON object' error in menu management editing functionality"
created-date: 2025-08-23
---

# Implementation Plan for Fixing Menu Management Edit Errors

## OBJECTIVE

Fix the "Cannot coerce the result to a single JSON object" error that occurs when updating/editing **all menu management entities** in the barista admin module. This error affects:

1. **Drinks editing** - Cannot update drink details
2. **Drink Categories editing** - Cannot update category details  
3. **Option Categories editing** - Cannot update option category details

This error started appearing after the recent implementation that removed the "Ready" order status.

**Error Details:**

- **Error Message**: `Cannot coerce the result to a single JSON object`
- **Supabase Error Code**: `PGRST116` (The result contains 0 rows)
- **HTTP Status**: `406 (Not Acceptable)`
- **Affected Operations**:
  - Drinks update (via DrinkForm → drinksService.update)
  - Drink Categories update (via DrinkCategoryForm → drinkCategoriesService.update)
  - Option Categories update (via OptionCategoryForm → optionCategoriesService.update)
- **Context**: User attempts to edit and save any menu entity, but all updates fail with identical error pattern

**Root Cause Analysis:**

The error occurs because all three service update functions use `.single()` expecting exactly one result, but the queries return 0 rows. This suggests a **systemic issue** affecting all menu entity update operations, likely:

1. The entity IDs being passed don't exist in the database
2. The update queries have incorrect syntax or joins
3. There's a foreign key constraint issue affecting all entities
4. Recent database changes (ready status removal) affected the query structure across all menu services

## IMPLEMENTATION PLAN

- [ ] Step 1: Investigate Database State and Data Integrity
  - **Task**: Check the database for any data inconsistencies or missing records that might cause the update to fail
  - **Files**: Database investigation (no file changes needed)
  - **Dependencies**: Supabase database access
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Activities**:

    ```bash
    # Connect to Supabase and verify drink data integrity
    # Check for orphaned records, missing foreign keys, etc.
    # Verify the specific drink being tested (Espresso) exists and has valid references
    ```

- [ ] Step 2: Analyze All menuService.ts Update Functions
  - **Task**: Review all three update functions to identify the common issue affecting all menu entity updates
  - **Files**:
    - `src/services/menuService.ts`: Examine all update function implementations
      - `drinkCategoriesService.update()`
      - `drinksService.update()`
      - `optionCategoriesService.update()`
  - **Dependencies**: Step 1 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Focus Areas**:

    ```typescript
    // Check all three update implementations for common pattern:
    
    // 1. Drink Categories Service
    drinkCategoriesService.update: async (id: string, updates: UpdateDrinkCategoryDto): Promise<DrinkCategory> => {
      const { data, error } = await supabase
        .from('drink_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single() // ← This is where all three fail
    }
    
    // 2. Drinks Service  
    drinksService.update: async (id: string, updates: UpdateDrinkDto): Promise<Drink> => {
      const { data, error } = await supabase
        .from('drinks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          category:drink_categories(*)
        `)
        .single() // ← This is where all three fail
    }
    
    // 3. Option Categories Service
    optionCategoriesService.update: async (id: string, updates: UpdateOptionCategoryDto): Promise<OptionCategory> => {
      const { data, error } = await supabase
        .from('option_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single() // ← This is where all three fail
    }
    
    // Analyze: Why are all .single() calls returning 0 rows?
    ```

- [ ] Step 3: Test Direct Database Update Operations for All Entity Types
  - **Task**: Test update operations directly in Supabase for all three entity types to isolate whether the issue is in the queries or the data
  - **Files**: No files (database testing only)
  - **Dependencies**: Step 2 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Test Queries**:

    ```sql
    -- Test 1: Drink Categories
    UPDATE drink_categories SET description = 'Test description' WHERE id = '<actual-category-id>';
    UPDATE drink_categories 
    SET description = 'Test description', updated_at = now() 
    WHERE id = '<actual-category-id>'
    RETURNING *;
    
    -- Test 2: Drinks  
    UPDATE drinks SET description = 'Test description' WHERE id = '<actual-drink-id>';
    UPDATE drinks 
    SET description = 'Test description', updated_at = now() 
    WHERE id = '<actual-drink-id>'
    RETURNING *;
    
    -- Test 3: Option Categories
    UPDATE option_categories SET description = 'Test description' WHERE id = '<actual-option-category-id>';
    UPDATE option_categories 
    SET description = 'Test description', updated_at = now() 
    WHERE id = '<actual-option-category-id>'
    RETURNING *;
    
    -- Test 4: Check if records actually exist
    SELECT id, name FROM drink_categories;
    SELECT id, name FROM drinks; 
    SELECT id, name FROM option_categories;
    
    -- Test 5: Test the full query structure used by the services
    -- (Include the complex joins to see if that's the issue)
    ```

- [ ] Step 4: Fix Query Structure Issues for All Menu Services
  - **Task**: Implement fixes based on findings from previous steps across all three menu entity services
  - **Files**:
    - `src/services/menuService.ts`: Update all three service update implementations
      - `drinkCategoriesService.update()`
      - `drinksService.update()`
      - `optionCategoriesService.update()`
  - **Dependencies**: Step 3 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Potential Fixes**:

    ```typescript
    // Option 1: Simplify all update queries (remove complex joins)
    // For Drink Categories
    drinkCategoriesService.update: async (id: string, updates: UpdateDrinkCategoryDto): Promise<DrinkCategory> => {
      const { data, error } = await supabase
        .from('drink_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) handleSupabaseError(error)
      if (!data) throw new Error('Failed to update drink category')
      return data as DrinkCategory
    }
    
    // For Drinks (remove the join)
    drinksService.update: async (id: string, updates: UpdateDrinkDto): Promise<Drink> => {
      const { data, error } = await supabase
        .from('drinks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) handleSupabaseError(error)
      if (!data) throw new Error('Failed to update drink')
      
      // Fetch the complete data with joins separately if needed
      return await this.getById(id)
    }
    
    // For Option Categories  
    optionCategoriesService.update: async (id: string, updates: UpdateOptionCategoryDto): Promise<OptionCategory> => {
      const { data, error } = await supabase
        .from('option_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) handleSupabaseError(error)
      if (!data) throw new Error('Failed to update option category')
      return data as OptionCategory
    }
    
    // Option 2: Add better error handling and validation for all services
    // Option 3: Fix the join syntax if that's the issue
    // Option 4: Investigate data integrity issues
    ```

- [ ] Step 5: Enhance Error Handling and Validation
  - **Task**: Add comprehensive error handling and validation to prevent similar issues
  - **Files**:
    - `src/services/menuService.ts`: Enhance error handling in drinks service
    - `src/hooks/useMenuData.ts`: Add validation in mutation hooks
    - `src/components/menu/DrinkForm.tsx`: Add client-side validation
  - **Dependencies**: Step 4 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Enhancements**:
    ```typescript
    // Add validation for drink existence before update
    const validateDrinkExists = async (id: string): Promise<boolean> => {
      const { data } = await supabase
        .from('drinks')
        .select('id')
        .eq('id', id)
        .single()
      return !!data
    }
    
    // Enhanced error handling with specific error types
    const handleUpdateError = (error: any, context: string) => {
      if (error.code === 'PGRST116') {
        throw new Error(`Drink not found: ${context}`)
      }
      // Handle other specific error codes
      handleSupabaseError(error)
    }
    ```

- [ ] Step 6: Test the Fix with UI Interaction for All Entity Types
  - **Task**: Test the fixed functionality through the user interface for all three menu entity types to ensure the issue is resolved
  - **Files**: No files (testing only)
  - **Dependencies**: Step 5 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Test Scenarios**:

    ```text
    1. Test Drink Categories:
       - Navigate to Barista Admin > Menu Management > Drink Categories
       - Click Edit on the "Coffee" category (or any other category)
       - Modify the description
       - Click "Update Category"
       - Verify the update succeeds without errors
       - Verify the changes are reflected in the UI
    
    2. Test Drinks:
       - Navigate to Barista Admin > Menu Management > Drinks
       - Click Edit on the "Espresso" drink (or any other drink)
       - Modify the description
       - Click "Update Drink"
       - Verify the update succeeds without errors
       - Verify the changes are reflected in the UI
    
    3. Test Option Categories:
       - Navigate to Barista Admin > Menu Management > Option Categories
       - Click Edit on the "Number of Shots" category (or any other option category)
       - Modify the description
       - Click "Update Category"
       - Verify the update succeeds without errors
       - Verify the changes are reflected in the UI
    
    4. Test all three with different field combinations (name, display order, active status)
    ```

- [ ] Step 7: Run All Tests to Ensure No Regressions
  - **Task**: Execute the complete test suite to ensure the fix doesn't break existing functionality
  - **Files**: All test files
  - **Dependencies**: Step 6 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Commands**:
    ```bash
    npm run test        # Run unit tests
    npm run lint        # Run linting
    npm run build       # Verify build still works
    npm run test:e2e    # Run end-to-end tests (if time permits)
    ```

- [ ] Step 8: Write Unit Tests for Fixed Functionality
  - **Task**: Create or update unit tests to cover all three fixed update functionalities and prevent future regressions
  - **Files**:
    - `src/services/__tests__/menuService.test.ts`: Add tests for all three update scenarios
    - `src/hooks/__tests__/useMenuData.test.ts`: Add tests for all three update mutation hooks
  - **Dependencies**: Step 7 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Test Cases**:

    ```typescript
    describe('Menu Services Update Functions', () => {
      describe('Drink Categories Service', () => {
        test('should update drink category successfully', async () => {
          // Test successful update for drink categories
        })
        
        test('should handle non-existent drink category gracefully', async () => {
          // Test PGRST116 error handling for drink categories
        })
      })
      
      describe('Drinks Service', () => {
        test('should update drink successfully', async () => {
          // Test successful update for drinks
        })
        
        test('should handle non-existent drink gracefully', async () => {
          // Test PGRST116 error handling for drinks
        })
        
        test('should preserve category relationships after update', async () => {
          // Test that joins work correctly for drinks
        })
      })
      
      describe('Option Categories Service', () => {
        test('should update option category successfully', async () => {
          // Test successful update for option categories
        })
        
        test('should handle non-existent option category gracefully', async () => {
          // Test PGRST116 error handling for option categories
        })
      })
    })
    ```

- [ ] Step 9: Update Documentation
  - **Task**: Update any relevant documentation to reflect the fix and any changes made
  - **Files**:
    - `docs/error-handling-system.md`: Document the error handling improvements
    - Update plan document with final results
  - **Dependencies**: Step 8 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [ ] Step 10: Definition of Done Compliance Check
  - **Task**: Verify implementation meets all Definition of Done criteria
  - **Files**: Review against `/docs/specs/definition_of_done.md`
  - **Dependencies**: Step 9 completion
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, check if it is already running before attempting to do so. The app runs locally on port 5173 by default. If this port is in use, that means the app is already running and you do not need to run the app anymore. Think and assess if you need to kill/restart the process as needed.
    - If you are running any CLI command, check if if the existing terminal is ready to accept new commands first.
      - For example, it might be running a foreground process and is not ready. In this situation, launch a new terminal to run the CLI command.
    - If you are running any CLI command, run as a background process as much as possible.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.
  - **Checklist**:
    - [ ] All tests pass (unit, integration, e2e)
    - [ ] Code follows established patterns
    - [ ] No regressions in existing functionality
    - [ ] Error handling is comprehensive
    - [ ] Documentation is updated
    - [ ] Performance is preserved
    - [ ] Security standards maintained

---

## EXPECTED OUTCOME

After completing this implementation plan:

1. **Fixed Functionality**: All three menu management editing operations should work without the "Cannot coerce the result to a single JSON object" error:
   - Drink Categories editing
   - Drinks editing  
   - Option Categories editing
2. **Improved Error Handling**: Better error messages and handling for edge cases across all menu services
3. **Test Coverage**: Comprehensive tests to prevent similar issues in the future
4. **Documentation**: Updated documentation reflecting the fix and any architectural changes

## SUCCESS CRITERIA

- [ ] User can successfully edit and update **drink categories** in the menu management interface
- [ ] User can successfully edit and update **drinks** in the menu management interface  
- [ ] User can successfully edit and update **option categories** in the menu management interface
- [ ] No "Cannot coerce the result to a single JSON object" errors occur during any menu entity updates
- [ ] All existing functionality continues to work without regressions
- [ ] Comprehensive error handling provides clear feedback to users
- [ ] All tests pass, including new tests for the fixed functionality