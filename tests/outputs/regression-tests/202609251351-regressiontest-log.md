# Regression Test Report — 2026-09-25 13:51

## Summary

Regression testing after **consolidated Dependabot updates** (PR #164, commit `230dccb`), run locally against a real Supabase database on **Podman** (replacing Docker Desktop).

### Result: PASS after fixes — one production regression found and fixed

- **Production regression found and fixed.** The supabase-js upgrade in PR #164 broke guest ordering: `/order` showed "Something went wrong" in both dev and production builds. Vercel deployed the broken build to Production at 05:49 UTC. The fix (PR #165, commit `24988d0`) was deployed to Production at 09:18 UTC. CI missed it because unit tests mock Supabase; only a run against a real database showed it.
- **React Router v7 upgrade works.** Navigation, URL search params, browser back and reload persistence all behave as before, with no router warnings.
- **Local development now runs on Podman 6.1+.** Podman 6.0.x cannot forward ports on Windows/WSL. README, script and docs are updated.
- **Six E2E tests were already failing before the upgrade** (confirmed on commit `3d1178f`). They are now fixed.

| Check | Result |
| --- | --- |
| Unit tests (mocks / CI config) | 918/918 pass |
| Unit tests (local DB, no mocks) | 918/918 pass |
| Lint | 0 errors, 1 pre-existing warning |
| Build | Pass |
| Playwright E2E | 134 passed, 0 failed, 8 skipped by config |
| Exploratory (desktop 1920x1080 + mobile 375px, dev + production build) | 32/32 checks pass, no console errors |

---

## Scope of Changes

### Dependency updates (PR #164, already merged)

| Change | Details |
| --- | --- |
| react-router-dom 6.30.2 → 7.18.4 | Removed v6 `future` flags from `BrowserRouter`/`MemoryRouter` |
| `vite.config.ts` | `manualChunks` switched to function form so React stays in the `vendor` chunk |
| @supabase/supabase-js → 2.117.1 | Minor |
| @types/node ^20 | Added explicitly (was only transitive) |
| Others | lucide-react, tailwindcss, autoprefixer, @vercel/speed-insights, @testing-library/react, 7 transitive packages |

### Realtime regression fix (this session)

| File | Change |
| --- | --- |
| `src/utils/realtimeChannel.ts` | New `createChannelTopic(base)` — returns a unique topic per subscriber |
| `src/hooks/useMenuData.ts`, `useMenuSubscriptions.ts`, `useQueueStatus.ts`, `src/services/adminOrderService.ts` | All 14 `supabase.channel()` calls use `createChannelTopic()` |
| `src/utils/__tests__/realtimeChannel.test.ts` | New — 3 tests |
| `src/hooks/__tests__/useQueueStatus.test.ts`, `useMenuSubscriptions.test.ts` | Match topic prefix; new test for distinct topics per hook instance |

### Local environment: Docker Desktop → Podman (this session)

| File | Change |
| --- | --- |
| `README.md` | Podman 6.1+ prerequisite; new "Start the local Supabase database" step |
| `scripts/test-local-db.ps1` | Detects Podman (Docker fallback); fixed pre-existing `-Verbose` param conflict and wrong health URL |
| `supabase/snippets/.gitkeep` | Studio bind-mounts this path; Podman fails if it does not exist |
| `docs/dual-strategy-testing.md` | Podman prerequisite for local DB testing |
| `docs/specs/technology_stack.md` | Podman entry, Supabase CLI version |
| `.claude/prompt-snippets/supabase-cli-instructions.md` | Podman note for AI agents |

### E2E test fixes (pre-existing failures)

| File | Change |
| --- | --- |
| `tests/e2e/admin/hacked-mode.spec.ts` | Drive and reset hacked mode through the admin toggle (DB); session-aware `loginToAdmin`; run tests in order |
| `tests/e2e/mobile-responsiveness.spec.ts` | Select drink cards by test id; assert the wizard advances |

---

## Environment Setup Log

| Step | Result |
| --- | --- |
| Podman 6.0.2 + `supabase start` | FAIL — images pulled, but `connection refused` on 127.0.0.1:54322 |
| Diagnosis | Container reachable at VM IP but not Windows localhost; no `conmon` listener in VM. Podman 6.1.0 release notes: `force_port_listen` "required ... on WSL to support port forwarding from the Windows host", auto-set on new machines only |
| Upgrade Podman CLI 6.0.2 → 6.1.2, recreate machine (rootful, 4 GB) | PASS — localhost port forwarding works |
| `supabase start` | FAIL — `statfs .../supabase/snippets: no such file or directory` (Podman does not auto-create bind-mount sources) |
| Create `supabase/snippets/` | PASS — all 12 containers healthy, migrations + seed applied (19 drinks, 4 categories) |
| `npm run db:status` | FAIL (pre-existing) — `-Verbose` defined twice; after fix, health check hit `/health` (404) |
| Fix script | PASS — reports Podman running and local instance OK |

---

## Test Results

### Unit Tests (local DB, no mocks)

- **Status**: PASS
- **Command**: `npm run test:local-db` (setup log confirms "Using real database in local environment")
- **Result**: 914/914 before the Realtime fix; 918/918 across 59 test files after it
- **Duration**: ~91s
- Note: these tests passed even while `/order` was broken, because the hook tests (`useMenuData.test.ts`, `useQueueStatus.test.ts`) mock `supabase.channel()` in both modes. Only the browser runs (E2E and exploratory) exercised the real Realtime client

### Unit Tests (mocks / CI config)

- **Status**: PASS (after Realtime fix)
- **Result**: 918/918 tests pass across 59 test files (4 new tests for unique channel topics)

### Lint

- **Status**: PASS
- **Result**: 0 errors, 1 warning (pre-existing — `react-refresh/only-export-components` in `HackedModeContext.tsx`)

### Build

- **Status**: PASS — `vendor` 142 kB, `router` 38 kB, `supabase` 223 kB

### Playwright E2E Tests

| Run | Passed | Failed | Notes |
| --- | --- | --- | --- |
| 1 — `main` (`230dccb`) | 0 | 135 | Local Playwright browser build 1208 not installed (environment) |
| 2 — `main` (`230dccb`) | 82 | 52 | Realtime crash on `/order` and menu management (regression #6) |
| 3 — with Realtime fix | 128 | 6 | All 6 also fail on pre-upgrade commit `3d1178f` (pre-existing) |
| 4 — with Realtime fix + test fixes | 134 | 0 | 8 skipped by design: 7 telemetry tests (`VITE_*_TELEMETRY_ENABLED=false` locally), 1 wrong-password test (`VITE_GUEST_BYPASS_PASSWORD=true` locally) |

---

## Exploratory Testing

Playwright MCP server failed to connect this session; exploratory checks were run with a `@playwright/test` script instead (screenshots, console error capture, React Router warning capture). Run against both the dev server (React StrictMode) and a production build (`vite preview`).

| Run | Before fix (`main`) | After fix |
| --- | --- | --- |
| Production build | 8/32 — guest ordering broken on desktop and mobile, Realtime error in console | 32/32 |
| Dev server | `/order` shows "Something went wrong" | 32/32 |

### Desktop (1920x1080) — after fix

- [x] Welcome page renders, no horizontal scroll
- [x] Client-side navigation Welcome → `/order` via `<Link>` (React Router v7)
- [x] Drink list loads (19 drinks), category tab filters (`aria-selected`, 11 Coffee drinks)
- [x] Tapping a drink card auto-advances to "Customize Your Espresso" (50%)
- [x] Option selection → "Your Information" with auto-generated name → Review → Submit Order
- [x] Confirmation shows order ID and `?orderId=` search param (`useSearchParams`); Cancel This Order works
- [x] Admin login, dashboard without horizontal scroll
- [x] Order Management sets `?view=orders`; browser Back returns to dashboard
- [x] Menu Management → Drinks tab → Coffee filter writes `?view=menu&tab=drinks&category=Coffee`; reload restores it
- [x] 404 page renders, link returns home
- [x] No console errors, no React Router warnings

### Mobile (375px width) — after fix

- [x] Same 16 checks as desktop, all pass; no horizontal scroll on welcome, guest drink list, admin dashboard, or menu management

---

## Issues Found

| # | Issue | Status |
| --- | --- | --- |
| 1 | Podman 6.0.x on WSL does not forward container ports to Windows | Fixed (upgrade to 6.1.2, documented in README) |
| 2 | `supabase start` on Podman fails: missing `supabase/snippets` bind-mount source | Fixed (`.gitkeep`) |
| 3 | `scripts/test-local-db.ps1` crashed on startup (`-Verbose` defined twice) | Fixed |
| 4 | `scripts/test-local-db.ps1` health check used `/health` (always 404) | Fixed (`/auth/v1/health`) |
| 5 | E2E first run: 135/142 failed with `Executable doesn't exist ... chromium_headless_shell-1208` (local Playwright browser not installed for 1.58.2) | Fixed locally (`npx playwright install chromium`); environment only, not an app defect |
| 6 | **REGRESSION (on `main`, from PR #164):** `/order` crashes to "Something went wrong" — `cannot add postgres_changes callbacks for realtime:drinks_with_options_changes after subscribe()`. supabase-js 2.117 reuses a channel when the same topic is still registered; `unsubscribe()` is async, so remounts (and StrictMode) got an already-subscribed channel. Reproduced in dev **and** production build. Not caught by CI because CI mocks Supabase | Fixed — `createChannelTopic()` gives every subscriber a unique topic (14 call sites); verified 32/32 exploratory checks on dev and prod builds. Merged as PR #165 (`24988d0`), deployed to Production 09:18 UTC |
| 7 | Pre-existing: 5 `hacked-mode.spec.ts` tests fail (also on `3d1178f`). Hacked mode moved to a global DB flag, but the "Easter Egg" group only reset `localStorage` (so the DB stayed ON between tests), enabled hacked mode via `localStorage` (overridden by the DB on mount), and `loginToAdmin` assumed a password prompt after `beforeEach` had already logged in | Fixed — tests drive and reset hacked mode through the admin toggle; `loginToAdmin` handles an existing session; file runs its tests in order (`mode: "default"`) because they share one global flag |
| 8 | Pre-existing: `mobile-responsiveness.spec.ts` looked for a button named "Tap to select", but a drink card's accessible name is the drink name | Fixed — select by `data-testid="drink-card-*"` and assert the wizard advances |
| 9 | Residual risk: other spec files that assert normal (non-hacked) copy can still run concurrently with the hacked-mode file on another worker | Not fixed — noted as a potential flake source |
