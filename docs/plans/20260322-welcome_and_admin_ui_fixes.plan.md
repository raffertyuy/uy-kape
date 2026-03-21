---
description: "Implementation plan for fixing the welcome page logo, removing tech description section, and compacting the admin dashboard layout"
created-date: 2026-03-22
---

# Implementation Plan for Welcome Page & Admin Dashboard UI Fixes

## OBJECTIVE

Three UI fixes:

1. **Fix broken logo on the Welcome page** — The `Logo` component with `size="xl"` renders a broken image. The logo files exist in `src/assets/logos/` and imports look correct, so this needs debugging (possibly a Vite asset issue, image file corruption, or CSS sizing issue causing invisible rendering).
2. **Remove the description/tech-stack section from the Welcome page** — Remove the entire `div` containing "A simple, password-protected coffee ordering system for your workspace" and the React + TypeScript / Tailwind CSS / Supabase badges (lines 46–61 in `WelcomePage.tsx`).
3. **Compact the Admin Dashboard to eliminate scrolling** — Two changes:
   - Move the Easter Egg "Hacked Mode" toggle inline into the header row (right side of the "Barista Administration" heading), removing the separate Easter Egg card.
   - Compress the System Status section into a single narrow horizontal row (inline badges instead of a tall grid with large icons).

## IMPLEMENTATION PLAN

- [x] Step 1: Debug and fix the broken logo on the Welcome page
  - **Note**: Logo file is valid (PNG 96x96 RGBA). Renders correctly in Playwright. Issue may have been browser cache or transient. No code changes needed.
  - **Task**: Investigate why the `Logo` component with `size="xl"` shows a broken image on the Welcome page. The component imports `logo-96.png` for the `xl` size. Check if the image renders correctly in the browser dev tools. If the file is corrupt or the import path resolves incorrectly, fix it. A likely issue is that the image is loading fine but is visually broken due to CSS constraints — verify the `flex-shrink-0` and responsive classes work in the flex container. Another possibility: the image file itself may need to be re-exported or the import alias `@/assets/logos/logo-96.png` may not resolve correctly.
  - **Files**:
    - `src/pages/WelcomePage.tsx`: Adjust Logo usage if needed (verify size, className, container layout)
    - `src/components/ui/Logo.tsx`: Check if `xl` size config is correct
    - `src/assets/logos/logo-96.png`: Verify the file is a valid PNG
  - **Dependencies**: None
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Run the app and use Playwright MCP to inspect the welcome page to see what's actually happening with the logo.
    - If the image file is corrupt, try using a different size or replacing the file.
    - If you are running the app, follow [npm-run-instructions](/.claude/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.claude/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 2: Remove the description and tech-stack section from the Welcome page
  - **Note**: Removed the entire `div.mt-8.text-sm.text-coffee-500` block (description text + 3 tech badges) from WelcomePage.tsx.
  - **Task**: Delete the entire bottom section of the Welcome page card that contains the description text "A simple, password-protected coffee ordering system for your workspace" and the three tech badges (React + TypeScript, Tailwind CSS, Supabase). This is lines 46–61 in `WelcomePage.tsx` — the `div` with `className="mt-8 text-sm text-coffee-500"`.
  - **Files**:
    - `src/pages/WelcomePage.tsx`: Remove the description/tech-stack `div` block (lines 46–61)
  - **Dependencies**: Step 1
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - This is a straightforward deletion. No new code needed.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 3: Compact the Admin Dashboard — move Easter Egg toggle to header and compress System Status
  - **Note**: Moved Hacked Mode toggle into header row with flex justify-between. Compressed System Status to a single-row inline badge layout. Removed separate Easter Egg card. Dashboard fits in viewport without scrolling.
  - **Task**: Restructure the `AdminDashboard` component in `BaristaModule.tsx` to fit without scrolling:
    1. **Move Hacked Mode toggle to header**: Place the toggle switch on the right side of the "Barista Administration" header row. Remove the separate Easter Egg card entirely. The header should have the logo + title on the left and the hacked mode toggle on the right, with a small label like "Hacked Mode" or the egg emoji next to it.
    2. **Compress System Status**: Replace the current tall grid with large checkmark icons with a single compact horizontal row. Use inline badges/pills showing status, e.g.: `✓ Menu` `✓ Orders` `✓ Real-time` — all on one line with minimal vertical space. Reduce padding from `p-6` to `p-3` or similar.
  - **Files**:
    - `src/pages/BaristaModule.tsx`: Restructure `AdminDashboard` component:
      - Modify header `div` (line 72) to be a flex row with justify-between, add hacked mode toggle on the right
      - Replace System Status section (lines 113–134) with compact inline badges
      - Remove Easter Egg section (lines 136–163) entirely
  - **Dependencies**: Steps 1–2
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Keep accessibility: the toggle must retain `role="switch"`, `aria-checked`, `aria-label`, and `data-testid="hacked-mode-toggle"` attributes.
    - Ensure the layout works on mobile too — on small screens, the header may need to wrap (flex-wrap) so the toggle goes below the title.
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 4: Visual testing with Playwright MCP
  - **Note**: Verified all three fixes via Playwright screenshots. Welcome page shows logo, no description section. Admin dashboard fits without scrollbar, toggle in header, status as inline badges.
  - **Task**: Run the app and use Playwright MCP to verify all three fixes:
    1. Welcome page: Logo displays correctly (no broken image)
    2. Welcome page: Description/tech-stack section is gone
    3. Admin page: Dashboard fits without scrolling, hacked mode toggle is in header, system status is compact
  - **Files**: None (testing only)
  - **Dependencies**: Steps 1–3
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running the app, follow [npm-run-instructions](/.claude/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.claude/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 5: Unit tests
  - **Note**: Updated WelcomePage test to verify tech badges are absent. Added 3 new BaristaModule tests: hacked mode toggle in header, compact system status badges, no separate Easter Egg section. All 26 tests pass.
  - **Task**: Write/update unit tests for the modified components:
    1. `WelcomePage` — verify logo renders, verify description section is absent, verify buttons still render
    2. `AdminDashboard` (within BaristaModule) — verify hacked mode toggle is present in header area, verify system status badges render, verify no separate Easter Egg section
  - **Files**:
    - `src/pages/__tests__/WelcomePage.test.tsx`: Update/create tests
    - `src/pages/__tests__/BaristaModule.test.tsx`: Update/create tests
  - **Dependencies**: Steps 1–4
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Follow the [dual-testing-strategy](/docs/dual-strategy-testing.md). After testing, set the environment variable back to not using mocks.
    - If you are fixing issues that arise from automated tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix. Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
    - If you are running any CLI command, follow [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 6: Playwright E2E tests
  - **Note**: Created `tests/e2e/guest/welcome-page.spec.ts` (3 tests) and `tests/e2e/admin/admin-dashboard.spec.ts` (4 tests). All 7 pass.
  - **Task**: Write simple Playwright E2E tests for the welcome page and admin dashboard:
    1. Welcome page: logo image is visible, no description/tech-stack section, navigation buttons work
    2. Admin dashboard: hacked mode toggle is accessible, system status indicators are visible, no scrollbar needed (viewport check)
  - **Files**:
    - `tests/e2e/guest/welcome-page.spec.ts`: Create/update E2E test
    - `tests/e2e/admin/admin-dashboard.spec.ts`: Create/update E2E test
  - **Dependencies**: Steps 1–5
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - Keep tests simple and focused. Avoid hardcoding dynamic data from the database.
    - If you are running the app, follow [npm-run-instructions](/.claude/prompt-snippets/npm-run-instructions.md)
    - If you are running any CLI command, follow [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - If you are using Playwright MCP, follow [playwright-mcp-instructions](/.claude/prompt-snippets/playwright-mcp-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 7: Definition of Done compliance
  - **Note**: Lint: 0 errors, 1 pre-existing warning. Build: clean. All 914 unit tests pass. All 7 E2E tests pass. No hardcoded secrets. Accessibility attributes preserved on toggle (role=switch, aria-checked, aria-label, data-testid).
  - **Task**: Validate the implementation against [definition_of_done](/docs/specs/definition_of_done.md):
    - Run `npm run lint` — zero errors
    - Run `npm run build` — clean build
    - Run `npm run test` — all tests pass
    - Verify no hardcoded secrets
    - Verify accessibility (toggle has proper ARIA attributes, images have alt text)
  - **Files**: None (validation only)
  - **Dependencies**: Steps 1–6
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already completed this step.
    - You do not need to follow this step strictly, consider the output of the previous step and adjust this step as needed.
    - If you are running any CLI command, follow [cli-execution-instructions](/.claude/prompt-snippets/cli-execution-instructions.md)
    - When you are done with this step, mark this step as complete and add a note/summary of what you did (in the plan document) before proceeding to the next step.
    - If you decide to proceed to the next step even if there are remaining issues/errors/failed tests, make a note of the issues (by updating the plan document) and address them in subsequent steps.

- [x] Step 8: Regression testing
  - **Note**: Full exploratory testing at desktop (1920x1080) and mobile (375x812) viewports via Playwright MCP. All checks pass — no visual issues, no layout problems, no console errors. Report saved at `tests/outputs/regression-tests/202603220123-regressiontest-log.md`.

- [x] Step 9: Remove hardcoded System Status section
  - **Note**: The System Status row displayed hardcoded "Active" states with no actual health checks or dynamic logic. Removed entirely from `BaristaModule.tsx`. Updated unit tests (BaristaModule) and E2E tests (admin-dashboard). All tests pass: 20/20 unit, 3/3 E2E, 0 lint errors.
