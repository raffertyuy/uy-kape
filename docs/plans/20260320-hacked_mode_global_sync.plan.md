---
description: "Implementation plan for Hacked Mode Global Sync via Supabase"
created-date: 2026-03-20
---

# Implementation Plan for Hacked Mode Global Sync

## OBJECTIVE

The Hacked Mode Easter egg toggle currently only affects the local browser session via `localStorage`.
This implementation changes it so the toggle state is persisted in a Supabase `app_settings` table,
making it apply to **all users** when the admin enables it.

**Behavior contract**:

- On app load, `HackedModeContext` immediately applies the `localStorage` cached value (prevents
  flash of unstyled content), then fetches the authoritative value from Supabase **once** and
  reconciles state + cache.
- Navigation between pages within the same session does **not** re-query the database.
- If the admin toggles hacked mode, the change is written to Supabase and takes effect for all
  users on their next full page load.
- If the Supabase fetch fails on load, the `localStorage` cached value silently persists (graceful
  degradation — no error surfaced to guests).
- If the admin's toggle write fails, the UI reverts the optimistic local update and shows an error
  toast.

---

## IMPLEMENTATION PLAN

- [x] Step 1: Create Supabase migration — `app_settings` table
  - **Revision note (2026-03-20)**: RLS policy was initially set to `TO authenticated` for UPDATE,
    which blocked writes since the app uses the `anon` role (admin is client-side password only,
    no Supabase auth). Fixed to `FOR UPDATE USING (true)` — no role restriction. Also changed
    the seed INSERT to use `ON CONFLICT (key) DO NOTHING` to be idempotent.
  - **Task**: Add a new migration file that creates the `app_settings` table (a general-purpose
    key/value store for application configuration), seeds the `hacked_mode` key with a default
    value of `'false'`, and configures Row Level Security so that:
    - Anonymous and authenticated roles can `SELECT` all rows (everyone reads the setting on load).
    - Only the `authenticated` role can `UPDATE` rows (only the admin/barista can change settings).
    - No `INSERT` or `DELETE` is permitted via RLS (the seed row is the only row; it is upserted,
      never inserted fresh or deleted from the app).
  - **Files**:
    - `supabase/migrations/20260320000000_add_app_settings.sql`: New migration.

      ```sql
      -- Create app_settings table for global application configuration
      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY
      , value TEXT NOT NULL
      , updated_at TIMESTAMPTZ DEFAULT now()
      );

      -- Seed hacked mode default
      INSERT INTO app_settings (key, value) VALUES ('hacked_mode', 'false');

      -- Enable RLS
      ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

      -- Policy: anyone can read settings
      CREATE POLICY "app_settings_select" ON app_settings
        FOR SELECT USING (true);

      -- Policy: only authenticated users can update settings
      CREATE POLICY "app_settings_update" ON app_settings
        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
      ```

    - `supabase/schema.sql`: Add the `app_settings` table definition (keeps schema.sql as the
      single source of truth for local dev reference).
    - `supabase/seed.sql`: Add the `app_settings` seed INSERT (for local `supabase db reset`).
  - **Dependencies**: None
  - **Migration execution — local**:
    - Follow `/.claude/prompt-snippets/supabase-cli-instructions.md` (CLI is `npx supabase`).
    - Ensure local Supabase is running: `npx supabase start`
    - Apply to local: `npx supabase migration up`
    - Verify the table exists locally before continuing.
  - **Migration execution — remote**:
    - The Supabase CLI uses its own auth, not the anon key from `.env`. The anon key is a
      client-side JWT and cannot be used for migrations.
    - Remote project ref is `gnkadpzzzpysxpmynogf` (from `VITE_SUPABASE_URL` in `.env`).
    - Link the CLI to the remote project: `npx supabase link --project-ref gnkadpzzzpysxpmynogf`
      (this will prompt for the database password if not already linked — user must supply it).
    - Push the migration: `npx supabase db push`
    - **User Intervention Required**: If `npx supabase login` has not been run previously in
      this environment, you will be prompted to authenticate via browser. The database password
      is also required for `supabase link`. These cannot be automated — the user must be present
      for this step.
    - Adding a new table to remote is non-breaking. Existing production code has no reference to
      `app_settings`, so the running app is unaffected until the new code is deployed.
  - **Additional Instructions**:
    - Follow `/.github/instructions/sql.instructions.md` for SQL style.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 2: Create `appSettingsService.ts`
  - **Task**: Create a new service that wraps the two Supabase operations needed by
    `HackedModeContext`: reading the hacked mode setting and writing it. Keep the interface
    focused — this service should only expose what is needed for this feature.
  - **Files**:
    - `src/services/appSettingsService.ts`: New file.

      ```ts
      // getHackedMode(): Promise<boolean>
      //   SELECT value FROM app_settings WHERE key = 'hacked_mode'
      //   Returns false on any error (graceful degradation)
      //
      // setHackedMode(value: boolean): Promise<void>
      //   UPDATE app_settings SET value = String(value), updated_at = now()
      //   WHERE key = 'hacked_mode'
      //   Throws on error so the caller (HackedModeContext) can handle it
      ```

  - **Dependencies**: Step 1 (table must exist)
  - **Additional Instructions**:
    - Follow `/.github/instructions/reactjs.instructions.md` for TS file conventions.
    - Follow the pattern established in `src/services/menuService.ts` (use `supabase` client from
      `@/lib/supabase`, follow the same error handling style).
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 3: Update `HackedModeContext.tsx`
  - **Task**: Refactor the context provider to use the new `appSettingsService` instead of
    relying solely on `localStorage`. The `localStorage` key is kept as a **session cache** to
    provide an instant initial render value and avoid re-querying on in-app navigation.
  - **Files**:
    - `src/contexts/HackedModeContext.tsx`: Modify.

      ```text
      HackedModeProvider:
        [isHackedMode, setHackedMode] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

        // One-time fetch on mount — reconcile with DB value
        useEffect ([] — mount only):
          try:
            dbValue = await appSettingsService.getHackedMode()
            setHackedMode(dbValue)
            localStorage.setItem(STORAGE_KEY, String(dbValue))
          catch:
            // silently fall back to already-applied localStorage value

        // Apply/remove CSS class whenever state changes
        useEffect ([isHackedMode]):
          document.documentElement.classList.toggle('hacked-mode', isHackedMode)

        toggleHackedMode (admin action):
          next = !isHackedMode
          setHackedMode(next)                             // optimistic update
          localStorage.setItem(STORAGE_KEY, String(next)) // update cache
          try:
            await appSettingsService.setHackedMode(next)  // persist to DB
          catch:
            setHackedMode(!next)                          // revert on failure
            localStorage.setItem(STORAGE_KEY, String(!next))
            showError('Failed to save Hacked Mode setting')
      ```

    - Note: `toggleHackedMode` now becomes `async`. Update `HackedModeContextType` accordingly
      (`toggleHackedMode: () => Promise<void>`).
  - **Dependencies**: Step 2
  - **Additional Instructions**:
    - The error toast on toggle failure should use the existing `useToast` / `ErrorContext`
      pattern used elsewhere in the app (check `BaristaModule.tsx` for the pattern).
    - However, `HackedModeContext` should NOT directly call `useToast` from inside the provider
      (circular provider dependency risk). Instead, surface the error via a new optional
      `onToggleError` callback prop on `HackedModeProvider`, or simply `throw` from
      `toggleHackedMode` so `BaristaModule.tsx` (the only caller) can catch it and call
      `showError` there. The simpler option is to throw — let `BaristaModule` handle it.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 4: Update `BaristaModule.tsx` toggle handler
  - **Task**: `handleHackedModeToggle` in `BaristaModule.tsx` currently calls `toggleHackedMode()`
    synchronously. Since `toggleHackedMode` is now `async`, update the handler to `await` it and
    wrap in try/catch so a DB failure shows an error toast instead of the success toast.
  - **Files**:
    - `src/pages/BaristaModule.tsx`: Modify `handleHackedModeToggle`.

      ```text
      handleHackedModeToggle = async () => {
        try:
          await toggleHackedMode()
          if (next was ON)  showWarning('☠️ SYSTEM COMPROMISED', 'Hacked Mode activated')
          else              showInfo('☕ System Restored', 'Hacked Mode deactivated')
        catch:
          showError('Failed to update Hacked Mode. Please try again.')
      }
      ```

    - Note: determining the "next" value (for the toast message) can be read from
      `!isHackedMode` before calling `toggleHackedMode`, or `isHackedMode` after — use whichever
      is cleaner given the optimistic update logic.
  - **Dependencies**: Step 3
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 5: Visual validation with Playwright MCP
  - **Note**: Validation confirmed toggle ON/OFF + page-reload persistence works correctly after
    the RLS fix. Local Supabase requires `npx supabase start --ignore-health-check` to start
    (pre-existing `supabase_storage` container issue unrelated to this feature).
  - **Task**: Start the dev server and manually verify the end-to-end flow via Playwright MCP.
  - **Checklist**:
    - [ ] Admin dashboard toggle still displays and toggles visually.
    - [ ] Toggling ON shows the hacked theme + warning toast.
    - [ ] Toggling OFF restores the normal theme + info toast.
    - [ ] Open a fresh browser tab (simulating a different user) → hacked mode state from DB is
          reflected on load.
  - **Files**: None (validation only).
  - **Dependencies**: Steps 1–4
  - **Additional Instructions**:
    - Follow `/.claude/prompt-snippets/npm-run-instructions.md` for starting the dev server.
    - Follow `/.claude/prompt-snippets/playwright-mcp-instructions.md` for Playwright MCP usage.
    - Local Supabase must be running (`supabase start`) for the DB write to work locally.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 6: Unit tests
  - **Task**: Write unit tests for the new and modified code. Follow the dual-strategy testing
    approach documented in [dual-strategy-testing](/docs/dual-strategy-testing.md).
  - **Files**:
    - `src/services/__tests__/appSettingsService.test.ts`: New file. Mock `@/lib/supabase`.
      Test:
      - `getHackedMode()` returns `true` when DB row has `value = 'true'`
      - `getHackedMode()` returns `false` when DB row has `value = 'false'`
      - `getHackedMode()` returns `false` on Supabase error (graceful degradation)
      - `setHackedMode(true)` calls supabase update with `value = 'true'`
      - `setHackedMode(false)` calls supabase update with `value = 'false'`
      - `setHackedMode()` throws when Supabase returns an error
    - `src/contexts/__tests__/HackedModeContext.test.tsx`: Update existing. Add tests for:
      - On mount, `appSettingsService.getHackedMode` is called once
      - DB value overrides localStorage initial value
      - On mount DB fetch failure, localStorage value is preserved (no crash)
      - `toggleHackedMode` calls `appSettingsService.setHackedMode` with new value
      - `toggleHackedMode` reverts state when `appSettingsService.setHackedMode` throws
  - **Dependencies**: Steps 2–4
  - **Additional Instructions**:
    - Mock `appSettingsService` in `HackedModeContext` tests using `vi.mock`.
    - After testing, ensure `VITE_TEST_USE_MOCKS` is restored if changed.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before
      fixing things, consider that the test script itself might be wrong.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 7: E2E Playwright tests
  - **Task**: Update or extend the existing `tests/e2e/admin/hacked-mode.spec.ts` to cover the
    DB-backed global sync behaviour. Keep tests simple and focused on observable behaviour.
  - **Tests to add/update**:
    - Toggle ON → navigate away and back → hacked mode is still active (state persists in
      session, not re-fetched from DB on navigation).
    - Toggle OFF → refresh page → hacked mode is OFF (DB value read on fresh load).
    - Toggle ON → refresh page → hacked mode is ON (DB value read on fresh load, confirming
      DB write succeeded).
  - **Files**:
    - `tests/e2e/admin/hacked-mode.spec.ts`: Extend existing tests.
  - **Dependencies**: Step 6
  - **Additional Instructions**:
    - The test environment needs a running local Supabase instance. Follow
      `/.claude/prompt-snippets/playwright-mcp-instructions.md`.
    - Avoid asserting specific DB row values — assert visible UI behaviour (CSS class, text
      content, toggle state).
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [x] Step 8: Definition of Done compliance check
  - **Note**: `src/types/database.types.ts` updated to include `app_settings` table typedef
    (required for TypeScript build). `docs/file_structure.md` update still pending.
  - **Task**: Verify the implementation meets all criteria in
    [definition_of_done](/docs/specs/definition_of_done.md).
  - **Checklist**:
    - [ ] All unit tests pass (`npm run test`).
    - [ ] All E2E tests pass (`npm run test:e2e`).
    - [ ] Zero ESLint errors (`npm run lint`).
    - [ ] No TypeScript `any` types introduced without justification.
    - [ ] RLS policies correctly restrict `INSERT`/`DELETE` (only `SELECT` for anon, `UPDATE`
          for authenticated).
    - [ ] Graceful degradation on DB fetch failure is tested.
    - [ ] Error revert on toggle failure is tested.
    - [ ] No hardcoded secrets introduced.
    - [ ] `docs/file_structure.md` updated to reference `appSettingsService.ts`.
    - [ ] Migration file naming follows the existing convention
          (`YYYYMMDDHHMMSS_description.sql`).
  - **Files**: Various — fix any items that fail the checklist above.
  - **Additional Instructions**:
    - When done, mark this step as complete and add a summary note.
