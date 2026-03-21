# Regression Test Report — 2026-03-21 23:42

## Summary

Regression testing for the **Hacked Mode Name Generation Fix** — ensuring that blur-triggered auto-name generation in the guest order flow respects the current hacked mode setting.

### Result: PASS

All changes function correctly. The bug where `handleBlur` always generated coffee superhero names (ignoring hacked mode) is fixed. No new issues introduced.

---

## Scope of Changes

| File | Change |
|------|--------|
| `src/hooks/useGuestInfo.ts` | `handleBlur` now calls `generateGuestName(isHackedMode)` instead of `generateFunnyGuestName()`, with `isHackedMode` in the dependency array. Removed unused import. |
| `src/utils/nameGenerator.ts` | `isGeneratedFunnyName()` now detects hacker-themed names (adjective + noun pattern) in addition to coffee superhero names. |
| `src/hooks/__tests__/useGuestInfo.test.ts` | Added handleBlur tests (normal + hacked mode) and a separate describe block with mocked `HackedModeContext`. |
| `src/utils/__tests__/nameGenerator.test.ts` | Added 2 test cases for hacker name detection in `isGeneratedFunnyName`. |
| `tests/e2e/admin/hacked-mode.spec.ts` | Added E2E test for blur name generation in hacked mode. |

---

## Test Results

### Unit Tests

- **Status**: PASS
- **Result**: 911/911 tests pass across 58 test files
- **Duration**: ~55s

### Lint

- **Status**: PASS
- **Result**: 0 errors, 1 warning (pre-existing, unrelated — `react-refresh/only-export-components` in `HackedModeContext.tsx`)

### Build

- **Status**: PASS
- **Result**: Clean build, no errors or warnings

### Playwright E2E Tests

- **Status**: 119 passed, 8 skipped, 6 failed (all failures pre-existing)
- **New test** ("blur on empty name field regenerates a hacker name when hacked mode is on"): PASS
- **Pre-existing failures** (not caused by this change):
  - 5 in `hacked-mode.spec.ts` — `loginToAdmin` helper doesn't handle already-logged-in state; toggle click race conditions with DB persistence
  - 1 in `mobile-responsiveness.spec.ts` — unrelated selector issue

### Exploratory Testing — Desktop (1920x1080)

| Scenario | Result | Notes |
|----------|--------|-------|
| Enable hacked mode via admin toggle | PASS | Toggle works, toast "SYSTEM COMPROMISED" shown |
| Guest flow — initial name generation (hacked mode ON) | PASS | Generated "Corrupted Byte" (hacker name) |
| Guest flow — clear name + blur (hacked mode ON) | PASS | Regenerated "Broken Daemon" (hacker name) |
| Disable hacked mode via admin toggle | PASS | Toggle works, toast "System Restored" shown |
| Guest flow — initial name generation (hacked mode OFF) | PASS | Generated coffee superhero name |
| Guest flow — clear name + blur (hacked mode OFF) | PASS | Regenerated coffee superhero name |
| No layout/visual issues | PASS | |
| No console errors | PASS | |

### Exploratory Testing — Mobile (375x812)

| Scenario | Result | Notes |
|----------|--------|-------|
| Hacked mode drink names render on mobile | PASS | Evil prefixes visible, no layout overflow |
| Guest flow — initial name generation (hacked mode ON) | PASS | Generated "Corrupted Bot" (hacker name) |
| Guest flow — clear name + blur (hacked mode ON) | PASS | Regenerated "Corrupted Register" (hacker name) |
| No layout/visual issues on mobile | PASS | Name input, character counter, helper text all fit |
| No console errors | PASS | |

---

## Conclusion

The fix is minimal and targeted — two lines of production code changed (`handleBlur` function call and dependency array). The secondary enhancement to `isGeneratedFunnyName()` ensures hacker names are properly classified as generated names throughout the application. All automated and manual tests confirm the fix works correctly across both desktop and mobile viewports.
