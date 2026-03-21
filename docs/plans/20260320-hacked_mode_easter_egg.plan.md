---
description: "Implementation plan for Hacked Mode Easter Egg"
created-date: 2026-03-20
---

# Implementation Plan for Hacked Mode Easter Egg

## OBJECTIVE

Implement a "Hacked Mode" Easter egg toggle in the administrator module. When enabled, the site
visually transforms to a hacker aesthetic (black background, green text, monospace font) and
changes select UI copy and behaviors:

1. Welcome page tagline → "Order the world's worst drinks!"
2. "Order Here" button → "Get Poisoned Here"
3. **Guest/order mode only**: Menu drink names get randomly-assigned dark/evil prefixes on each
   page load (e.g., "The Worst Espresso", "The Awful Cappuccino"). Admin views always show the
   original drink names — no prefixes in MenuManagement, OrderDashboard, or any admin component.
4. Customized option names are left unchanged
5. Auto-generated guest names use a hacker-themed name pool (e.g., "Shadow Hacker", "Poisonous
   Byte") instead of the coffee superhero pool

The theme change covers the **entire site** (welcome page, guest ordering flow, AND admin module).
The toggle persists the user's preference across visits via `localStorage` and takes effect
immediately (auto-save, no save button needed).

---

## IMPLEMENTATION PLAN

- [ ] Step 1: Create HackedModeContext
  - **Task**: Build a React context + provider that holds the `isHackedMode: boolean` state and
    a `toggleHackedMode()` action. Read the initial value from `localStorage` and persist any
    changes back. Apply/remove a CSS class (`hacked-mode`) on `document.documentElement` whenever
    the state changes so global CSS can override the theme.
  - **Files**:
    - `src/contexts/HackedModeContext.tsx`: New file — context, provider, and `useHackedMode()` hook.
  - **Pseudocode**:

    ```text
    const STORAGE_KEY = 'uy-kape-hacked-mode'
    HackedModeContext = createContext({ isHackedMode: false, toggleHackedMode: noop })

    HackedModeProvider:
      [isHackedMode, setHackedMode] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')
      useEffect([isHackedMode]):
        document.documentElement.classList.toggle('hacked-mode', isHackedMode)
      toggleHackedMode:
        next = !isHackedMode
        setHackedMode(next)
        localStorage.setItem(STORAGE_KEY, String(next))
      return <HackedModeContext.Provider value={{ isHackedMode, toggleHackedMode }}>

    export useHackedMode():
      ctx = useContext(HackedModeContext)
      if (!ctx) throw new Error('useHackedMode must be used within HackedModeProvider')
      return ctx
    ```

  - **Dependencies**: None (new file)
  - **Additional Instructions**:
    - Follow `/.github/instructions/reactjs.instructions.md` for TSX file conventions.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 2: Register HackedModeProvider in App.tsx
  - **Task**: Wrap the existing provider tree in `src/App.tsx` with `HackedModeProvider` so that
    all child components can access the hacked mode state.
  - **Files**:
    - `src/App.tsx`: Import `HackedModeProvider`; place it just inside `<ErrorBoundary>` alongside
      existing providers.
  - **Pseudocode**:

    ```text
    <ErrorBoundary>
      <HackedModeProvider>
        <ErrorContextProvider>
          ...existing tree...
        </ErrorContextProvider>
      </HackedModeProvider>
    </ErrorBoundary>
    ```

  - **Dependencies**: Step 1
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 3: Add hacked-mode global CSS styles
  - **Task**: Add a comprehensive `html.hacked-mode` CSS block to `src/index.css` that overrides
    the visual theme site-wide — covering both the guest ordering flow AND the admin module.
    Import the **Share Tech Mono** terminal font from Google Fonts (see Revision Note below —
    VT323 was replaced post-implementation due to readability concerns).

    **Approach decision — CSS class overrides (not separate stylesheets)**:
    Separate stylesheets would require duplicating every component's class usage. Since this is a
    single-toggle Easter egg (not a full theme system), targeted `html.hacked-mode` CSS overrides
    on Tailwind utility classes are the pragmatic choice. Tailwind follows predictable naming
    patterns (`bg-coffee-*`, `bg-gray-*`, `text-*`, `border-*`) so a small set of attribute
    selectors covers the majority of the site automatically. Any gaps discovered during visual
    testing (Step 10) can be patched as targeted additions to this same block.

  - **Files**:
    - `src/index.css`: Add a separate Google Fonts `@import` for VT323. Add the
      `html.hacked-mode` rule block covering backgrounds, text, borders, buttons, form inputs,
      navigation bars, tables, and the decorative scanline overlay.
  - **Pseudocode**:

    ```css
    /* Base — entire page */
    html.hacked-mode,
    html.hacked-mode body {
      background-color: #000 !important;
      color: #00ff41 !important;
      font-family: 'VT323', monospace !important;
    }

    /* Backgrounds — cards, panels, nav bars */
    html.hacked-mode .bg-white,
    html.hacked-mode [class*="bg-coffee"],
    html.hacked-mode [class*="bg-gray"],
    html.hacked-mode [class*="bg-slate"] {
      background-color: #0a0a0a !important;
      border-color: #00ff41 !important;
    }

    /* Text — all themed colours to green */
    html.hacked-mode [class*="text-coffee"],
    html.hacked-mode [class*="text-gray"],
    html.hacked-mode [class*="text-slate"],
    html.hacked-mode [class*="text-black"] {
      color: #00ff41 !important;
    }

    /* Borders */
    html.hacked-mode [class*="border-coffee"],
    html.hacked-mode [class*="border-gray"] {
      border-color: #003300 !important;
    }

    /* Buttons and primary actions */
    html.hacked-mode button,
    html.hacked-mode [class*="bg-coffee-6"],
    html.hacked-mode [class*="bg-coffee-7"] {
      background-color: #001a00 !important;
      border: 1px solid #00ff41 !important;
      color: #00ff41 !important;
    }
    html.hacked-mode button:hover {
      background-color: #003300 !important;
    }

    /* Form inputs */
    html.hacked-mode input,
    html.hacked-mode textarea,
    html.hacked-mode select {
      background-color: #0a0a0a !important;
      color: #00ff41 !important;
      border-color: #003300 !important;
    }
    html.hacked-mode input::placeholder,
    html.hacked-mode textarea::placeholder {
      color: #005500 !important;
    }

    /* Shadows — remove warm shadows, replace with green glow */
    html.hacked-mode [class*="shadow"] {
      box-shadow: 0 0 8px rgba(0, 255, 65, 0.2) !important;
    }

    /* Status badge colours (admin OrderDashboard) */
    html.hacked-mode [class*="bg-green"],
    html.hacked-mode [class*="bg-yellow"],
    html.hacked-mode [class*="bg-red"],
    html.hacked-mode [class*="bg-blue"] {
      background-color: #001a00 !important;
      color: #00ff41 !important;
      border: 1px solid #00ff41 !important;
    }

    /* Scanline overlay — purely decorative */
    html.hacked-mode body::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 2px,
        rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px
      );
      z-index: 9999;
    }
    ```

  - **Dependencies**: Step 2
  - **Additional Instructions**:
    - The scanline overlay must use `pointer-events: none` so it does not block interactivity.
    - The broad attribute selectors (`[class*="bg-gray"]`, etc.) should handle the admin module
      automatically. Use visual testing (Step 10) to find any missed elements and add targeted
      overrides as needed.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 4: Add hacker drink name prefix utility
  - **Task**: Create a utility module with an array of "terrible" prefixes and a function that
    returns a drink name with a randomly chosen prefix. Callers should memoize the result per
    drink to ensure prefix stability within a single page load.
  - **Files**:
    - `src/utils/hackedModeUtils.ts`: New file — `HACKED_PREFIXES` array, `getHackedDrinkName(name)`,
      and `HACKED_PREFIX_LIST` export for test assertions.
  - **Pseudocode**:

    ```text
    const HACKED_PREFIXES = [
      'The Worst', 'The Most Disgusting', 'The Awful', 'The Terrible',
      'The Horrible', 'The Putrid', 'The Wretched', 'The Foul',
      'The Vile', 'The Revolting', 'The Dreadful', 'The Sickening'
    ]

    export function getHackedDrinkName(originalName: string): string {
      prefix = HACKED_PREFIXES[Math.floor(Math.random() * HACKED_PREFIXES.length)]
      return `${prefix} ${originalName}`
    }

    export const HACKED_PREFIX_LIST = HACKED_PREFIXES  // for test assertions
    ```

  - **Dependencies**: None (new file)
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 5: Add hacker guest name generator
  - **Task**: Add hacker-themed name word lists and a `generateHackerGuestName()` export to the
    existing `nameGenerator.ts` utility. Also export a `generateGuestName(isHackedMode: boolean)`
    façade so callers do not need to branch themselves.
  - **Files**:
    - `src/utils/nameGenerator.ts`: Append `hackerAdjectives`, `hackerNouns`, `generateHackerGuestName`,
      and `generateGuestName` below the existing code.
  - **Pseudocode**:

    ```text
    const hackerAdjectives = [
      'Shadow', 'Phantom', 'Ghost', 'Null', 'Void', 'Cipher',
      'Vector', 'Binary', 'Rogue', 'Dark', 'Toxic', 'Stealth',
      'Cryptic', 'Silent', 'Viral', 'Proxy', 'Zero-Day', 'Malware',
      'Poisonous', 'Corrupted', 'Crashed', 'Infected'
    ]
    const hackerNouns = [
      'Hacker', 'Byte', 'Exploit', 'Daemon', 'Bot', 'Script',
      'Kernel', 'Root', 'Signal', 'Packet', 'Payload', 'Glitch',
      'Overflow', 'Cache', 'Loop', 'Stack', 'Register', 'Bit'
    ]
    export function generateHackerGuestName(): string {
      return `${randomFrom(hackerAdjectives)} ${randomFrom(hackerNouns)}`
    }
    export function generateGuestName(isHackedMode: boolean): string {
      return isHackedMode ? generateHackerGuestName() : generateFunnyGuestName()
    }
    ```

  - **Dependencies**: None (modifying existing file)
  - **Additional Instructions**:
    - Do not alter the existing `generateFunnyGuestName` function or its supporting arrays — only
      add new symbols.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 6: Wire hacked mode into the guest name hook
  - **Task**: Update `useGuestInfo.ts` to consume `useHackedMode()` and use `generateGuestName()`
    instead of calling `generateFunnyGuestName()` directly.
  - **Files**:
    - `src/hooks/useGuestInfo.ts`: Import `useHackedMode` and `generateGuestName`; update
      `generateNewFunnyName` callback.
  - **Pseudocode**:

    ```text
    const { isHackedMode } = useHackedMode()

    const generateNewFunnyName = useCallback(() => {
      const name = generateGuestName(isHackedMode)
      setGuestNameState(name)
      setIsGeneratedName(true)
      setUserHasClearedName(false)
    }, [isHackedMode])
    ```

  - **Dependencies**: Steps 1, 5
  - **Additional Instructions**:
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 7: Update WelcomePage for hacked mode text
  - **Task**: Update `WelcomePage.tsx` to read hacked mode context and swap the tagline and
    "Order Here" button label when hacked mode is active.
  - **Files**:
    - `src/pages/WelcomePage.tsx`: Import `useHackedMode`; replace hardcoded tagline and button
      text with conditional values.
  - **Pseudocode**:

    ```text
    const { isHackedMode } = useHackedMode()
    const tagline = isHackedMode ? "Order the world's worst drinks!" : APP_DESCRIPTION
    const orderButtonLabel = isHackedMode ? '☠️ Get Poisoned Here' : '🛍️ Order Here'
    // render tagline and orderButtonLabel in the JSX
    ```

  - **Dependencies**: Steps 1, 3
  - **Additional Instructions**:
    - The global CSS from Step 3 handles colour/font theme. Only toggle Tailwind classes where
      spacing or contrast differs beyond what the global rules cover.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 8: Apply hacked drink names in guest DrinkCard only
  - **Task**: Update `src/components/guest/DrinkCard.tsx` to display a prefixed drink name when
    hacked mode is active. Use `useMemo([isHackedMode, drink.name])` so the prefix only
    re-randomizes when the mode or drink name changes.

    **Scope — guest/order mode only**: Drink name prefixes must ONLY appear in the guest ordering
    flow. The following admin components must NOT be modified and must always show the original
    drink names regardless of hacked mode state:
    - `src/components/menu/DrinkList.tsx`
    - `src/components/menu/DrinkForm.tsx`
    - `src/components/menu/DrinkCard.tsx` (menu management card, distinct from guest DrinkCard)
    - `src/components/admin/OrderCard.tsx`
    - `src/components/admin/OrderDashboard.tsx`
    - Any other admin-side component that renders drink names

  - **Files**:
    - `src/components/guest/DrinkCard.tsx`: Import `useHackedMode` and `getHackedDrinkName`;
      add `displayName` memo; replace `drink.name` in JSX with `displayName`.
  - **Pseudocode**:

    ```text
    const { isHackedMode } = useHackedMode()
    const displayName = useMemo(
      () => isHackedMode ? getHackedDrinkName(drink.name) : drink.name,
      [isHackedMode, drink.name]
    )
    // use `displayName` everywhere drink.name appears in JSX
    ```

  - **Dependencies**: Steps 1, 4
  - **Additional Instructions**:
    - Any `aria-label`/`aria-describedby` that surfaces the drink name must use `displayName`.
    - `DrinkOptionsForm` option category names must remain unchanged — no edits needed there.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 9: Add hacked mode toggle in the admin dashboard
  - **Task**: Add a visible toggle to the `AdminDashboard` inner component in `BaristaModule.tsx`.
    Place it in a labelled "Easter Egg" section below the existing navigation cards.

    **UX decision — auto-save with toast notification**:
    The toggle takes effect immediately on click (auto-save to `localStorage`). No save button or
    confirmation modal is needed. The immediate visual transformation of the entire site is the
    fun feedback. Additionally, show a brief toast notification on toggle:
    - ON: `"☠️ SYSTEM COMPROMISED — Hacked Mode activated"`
    - OFF: `"☕ System restored"`

    This approach is better than a modal because: the Easter egg's delight is the instant visual
    shock; a modal would interrupt that moment. Auto-save also matches how the rest of the app
    handles preference-style settings.

  - **Files**:
    - `src/pages/BaristaModule.tsx`: Import `useHackedMode` and `useToast`; add a new section in
      `AdminDashboard` below the status grid.
  - **Pseudocode**:

    ```text
    const { isHackedMode, toggleHackedMode } = useHackedMode()
    const { showToast } = useToast()

    const handleToggle = () => {
      toggleHackedMode()
      showToast(isHackedMode
        ? '☕ System restored'
        : '☠️ SYSTEM COMPROMISED — Hacked Mode activated'
      )
    }

    <section aria-label="Easter Egg Settings" data-testid="easter-egg-section">
      <h4>🐣 Easter Egg</h4>
      <label htmlFor="hacked-mode-toggle">
        <input
          id="hacked-mode-toggle"
          data-testid="hacked-mode-toggle"
          type="checkbox"
          role="switch"
          aria-checked={isHackedMode}
          checked={isHackedMode}
          onChange={handleToggle}
        />
        Hacked Mode — {isHackedMode ? 'ON ☠️' : 'OFF ☕'}
      </label>
      <p>Unleash chaos on your guests. Everything looks terrible — intentionally.</p>
    </section>
    ```

  - **Dependencies**: Steps 1, 3
  - **Additional Instructions**:
    - `role="switch"` with `aria-checked` provides proper ARIA semantics for the toggle.
    - Check how `useToast` works in the existing codebase before wiring it — use the existing
      toast pattern rather than introducing a new notification mechanism.
    - Before proceeding with this step, check the conversation history and see if you already
      completed this step.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 10: Run the app and validate all hacked mode behaviors
  - **Task**: Start the dev server and manually walk through all hacked mode interactions using
    the Playwright MCP browser or a regular browser session.
  - **Checklist**:
    - Toggle hacked mode ON from admin dashboard → toast notification fires; page turns
      black/green with monospace font immediately (no save button required).
    - Verify admin module itself (nav, cards, forms, order list) renders in the hacked theme.
    - Navigate to `/` → tagline reads "Order the world's worst drinks!" and button reads
      "Get Poisoned Here".
    - Navigate to `/order` → drink cards show prefixed names (e.g., "The Worst Espresso").
    - Proceed to the name step → auto-generated name is a hacker name (e.g., "Shadow Hacker").
    - Navigate back to `/admin` → **drink names in MenuManagement and OrderDashboard show the
      ORIGINAL names (no prefixes)**.
    - Toggle hacked mode OFF → toast fires; all copy/style reverts to normal.
    - Refresh page with hacked mode ON → preference persists via `localStorage`.
    - Confirm option category/value names are unchanged in hacked mode.
    - Check admin views on mobile — hacked theme should work on small viewports.

  - **Files**: No code changes — validation only.
  - **Additional Instructions**:
    - Run the app following [npm-run-instructions](/.claude/prompt-snippets/npm-run-instructions.md).
    - If using Playwright MCP, follow
      [playwright-mcp-instructions](/.claude/prompt-snippets/playwright-mcp-instructions.md).
    - When done, mark this step as complete and summarize any issues found.

- [ ] Step 11: Write unit tests
  - **Task**: Add unit tests for all new and modified logic. Follow the
    [dual-testing-strategy](/docs/dual-strategy-testing.md). Run with mocks (default). Reset env
    variables back to default after testing.
  - **Files**:
    - `src/contexts/__tests__/HackedModeContext.test.tsx`: Test provider initial state from
      `localStorage`, toggle action, `localStorage` persistence, and class toggling on
      `document.documentElement`.
    - `src/utils/__tests__/hackedModeUtils.test.ts`: Test `getHackedDrinkName` returns the
      original name with a prefix from `HACKED_PREFIX_LIST`.
    - `src/utils/__tests__/nameGenerator.test.ts` (extend existing): Test
      `generateHackerGuestName` returns a non-empty string; `generateGuestName(true)` differs
      from `generateGuestName(false)` in character.
    - `src/hooks/__tests__/useGuestInfo.test.ts` (extend existing): Mock `useHackedMode` returning
      `isHackedMode: true` and verify `generateNewFunnyName` produces a name from the hacker pool.
    - `src/components/guest/__tests__/DrinkCard.test.tsx` (extend existing): When
      `useHackedMode` returns `true`, assert the rendered drink name contains one of the known
      hacked prefixes.

  - **Dependencies**: Steps 1–9
  - **Additional Instructions**:
    - Aim for ≥80% coverage on all new files.
    - If you are fixing issues that arise from automated tests, take a step back — consider whether
      the test itself is wrong before changing implementation code.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 12: Write Playwright E2E tests
  - **Task**: Add a focused E2E test spec for the hacked mode Easter egg. Keep assertions on UI
    behavior/copy rather than specific randomly-assigned values.
  - **Files**:
    - `tests/e2e/admin/hacked-mode.spec.ts`: New file.
      - Scenario 1: Admin enables Hacked Mode via toggle — verify toast fires and page background
        changes (black/dark); verify font changes to monospace.
      - Scenario 2: While still in admin — assert admin OrderDashboard or MenuManagement drink
        names do **not** contain any hacked prefix (original names shown).
      - Scenario 3: Navigate to `/` — assert tagline text and button label are the hacked variants.
      - Scenario 4: Navigate to `/order` — assert at least one drink card name contains any word
        from the prefix list (regex matching all possible prefixes with `|`).
      - Scenario 5: Disable Hacked Mode — assert toast fires and normal copy/style is restored.
      - Scenario 6: Reload page with Hacked Mode previously ON — assert preference was persisted.

  - **Dependencies**: Steps 1–11
  - **Additional Instructions**:
    - The `data-testid="hacked-mode-toggle"` attribute added in Step 9 should be used to locate
      the toggle.
    - Avoid asserting specific randomly-assigned drink name prefixes — use a regex covering all
      possible prefixes from `HACKED_PREFIX_LIST`.
    - When done, mark this step as complete and add a summary note before proceeding.

- [ ] Step 13: Definition of Done compliance check
  - **Task**: Verify the implementation meets all criteria in
    [definition_of_done](/docs/specs/definition_of_done.md).
  - **Checklist**:
    - [ ] All unit tests pass (`npm run test`).
    - [ ] All E2E tests pass (`npm run test:e2e`).
    - [ ] Zero ESLint errors (`npm run lint`).
    - [ ] No TypeScript `any` types introduced without justification.
    - [ ] Mobile responsive — hacked mode theme works on small viewports.
    - [ ] Accessible — toggle uses `role="switch"` + `aria-checked`; scanline overlay is
          `pointer-events: none` and does not break keyboard navigation.
    - [ ] No hardcoded secrets or sensitive data introduced.
    - [ ] `localStorage` key is documented with a comment in `HackedModeContext.tsx`.
    - [ ] `docs/file_structure.md` updated to reflect the new `HackedModeContext` if it
          represents a new architectural pattern.
    - [ ] `.env.example` unchanged (no new env vars introduced).

  - **Files**: Various — fix any items that fail the checklist above.
  - **Additional Instructions**:
    - When done, mark this step as complete and add a summary note.

---

## REVISION NOTES

### 2026-03-20 — CSS refinements (post-implementation)

After the initial implementation the hacked-mode visual theme was refined for better
readability and aesthetics while preserving the high-contrast hacker aesthetic:

| Aspect | Before | After | Reason |
| --- | --- | --- | --- |
| Font | VT323 (pixelated bitmap) | Share Tech Mono | More legible; still terminal-style |
| Primary green | `#00ff41` (Matrix neon) | `#39d353` (GitHub hacker green) | Reduces eye strain |
| Page background | `#000` (pure black) | `#0d0d0d` | Softer base |
| Panels / nav | `#0a0a0a` (flat) | `#111111` | Creates visual depth |
| Inner cards | `#0a0a0a` (flat) | `#161616` | Creates visual depth |
| Form inputs | `#0a0a0a` | `#1a1a1a` | Slightly elevated from card bg |
| Button background | `#001a00` (green-tinted) | `#0e1f12` (dark green-tinted) | Better layering |
| Button hover | `#003300` | `#1a3320` | Matches new depth scale |
| Borders | `#003300` | `#1d4a29` | Visible but not distracting |
| Scanline opacity | `rgba(0,255,65,0.03)` | `rgba(57,211,83,0.02)` | More subtle |
| Glow/shadow | `rgba(0,255,65,0.2)` | `rgba(57,211,83,0.12)` | Softer glow |
| Placeholder text | `#005500` | `#2a6b38` | More visible hint text |

Files changed: `src/index.css` (font import + entire `html.hacked-mode` CSS block).
