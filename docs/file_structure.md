# File Structure

Scope:

1. Root directory files/folders (concise purpose statements only)
2. Full enumeration (files + purpose) of `docs/` subtree
3. High‑level description (not file listing) of all other root folders

```text
uy-kape/
├── .git/                  # Git metadata
├── .github/               # GitHub configs, workflows, AI instructions
├── .gitignore             # Ignore rules
├── .vscode/               # Editor settings
├── .env                   # Local (ignored) env vars
├── .env.example           # Template env vars
├── CODE_OF_CONDUCT.md     # Community guidelines
├── CONTRIBUTING.md        # Contribution workflow
├── SECURITY.md            # Security policy
├── LICENSE                # OSS license
├── README.md              # Overview & onboarding
├── eslint.config.js       # ESLint configuration
├── index.html             # Vite HTML entry
├── log.local.txt          # Local development log (ignored)
├── package.json           # Dependencies & scripts
├── package-lock.json      # Locked dependency graph
├── postcss.config.js      # PostCSS (Tailwind)
├── tailwind.config.js     # Tailwind theme/config
├── tsconfig.json          # TS config (app)
├── tsconfig.node.json     # TS config (node scripts)
├── vite.config.ts         # Vite build config
├── vitest.config.ts       # Vitest config (re-exports from tests/unit/)
├── docs/                  # (Fully expanded below)
│   ├── file_structure.md  # This document
│   ├── plans/
│   │   ├── 20250822-global_error_handling_implementation.plan.md  # Global error handling system implementation plan
│   │   ├── barista_admin_crud_fixes.plan.md
│   │   ├── barista_admin_menu_management.plan.md
│   │   ├── barista_admin_order_dashboard.plan.md
│   │   ├── continuous_integration_workflow.plan.md
│   │   ├── drink_cards_options_display_enhancement.plan.md
│   │   ├── fix_mobile_responsiveness_barista_admin_menu_management.plan.md
│   │   ├── guest_module.plan.md
│   │   ├── guest_ordering_experience_improvements.plan.md
│   │   ├── guest_special_request.plan.md
│   │   ├── initial_bootstrap_implementation.plan.md
│   │   ├── logo_integration_ui_enhancement.plan.md  # Logo integration implementation plan
│   │   ├── order_wait_time_formula.plan.md
│   │   ├── unit_tests_ci_fixes.plan.md
│   │   └── unit_tests_implementation.plan.md
│   ├── screens/
│   │   └── old_ordering_system.png
│   └── specs/
│       ├── db_schema.md
│       ├── definition_of_done.md
│       ├── application_overview.md
│       └── technology_stack.md
├── scripts/               # Operational / helper scripts (not expanded)
├── database/              # Legacy SQL schema + seed (reference only)
├── supabase/              # Supabase project (config, migrations, seed)
├── tests/                 # All test-related files and outputs (fully expanded below)
│   ├── unit/              # Unit tests configuration and outputs
│   │   ├── vitest.config.ts        # Vitest test configuration
│   │   ├── vitest.config.ci.ts     # Vitest CI-specific configuration
│   │   └── coverage/               # Test coverage reports (generated)
│   ├── e2e/               # End-to-end tests (Playwright)
│   │   ├── basic-functionality.spec.ts        # Basic app functionality tests
│   │   ├── guest-experience-improvements.spec.ts  # Guest UX tests
│   │   ├── menu-crud.spec.ts                   # Menu management tests
│   │   ├── order-management.spec.ts            # Order operations tests
│   │   ├── wait-time-configuration.spec.ts     # Wait time formula tests
│   │   ├── playwright.config.ts               # Playwright configuration
│   │   ├── results/               # Test execution artifacts (generated)
│   │   └── reports/               # HTML test reports (generated)
│   └── outputs/           # Various test outputs
│       └── test-results.xml       # JUnit XML from CI runs
├── src/                   # React + TS application source
│   ├── assets/            # Optimized logo assets organized by size (24px-256px)
│   ├── components/        # React components including reusable Logo component
│   │   └── ui/            # UI components (Logo, LoadingSpinner, EmptyState)
│   ├── types/             # TypeScript definitions including logo component types
│   └── ...                # Other source directories (not expanded)
├── public/                # Static assets including favicon and PWA icons derived from logo
├── dist/                  # Build output (generated)
└── node_modules/          # Installed dependencies (ignored)
```

## Notes & Conventions

1. Source of Truth (Database): Always introduce schema changes via a new timestamped file in `supabase/migrations/` (never retro‑edit existing migrations). The old `database/` folder is historical.
2. Seeding: Prefer `supabase/seed.sql`. The legacy `database/seed.sql` should not be extended further.
3. Testing Layout: Unit tests colocated in `__tests__` directories inside feature folders (components, hooks, services, pages, types, utils). Global setup in `src/setupTests.ts`. All test configurations and outputs are organized under `tests/` root folder - unit test configs in `tests/unit/`, E2E tests in `tests/e2e/`, and shared outputs in `tests/outputs/`.
4. Environment Variables: Keep secrets local (`.env` not committed). Update `.env.example` when new required variables are introduced.
5. Styling: Tailwind first; add component‑level overrides sparingly. Central theme config lives in `tailwind.config.js`.
6. Real‑Time Features: Supabase channels & presence are encapsulated in hooks (`useMenuSubscriptions`) and service abstractions; UI surfaces connection via components like `RealtimeIndicator`.
7. Logo Integration: The reusable Logo component (`src/components/ui/Logo.tsx`) provides consistent branding across the application with responsive sizing variants (xs, sm, md, lg, xl, hero) and accessibility features.
8. E2E Testing: End-to-end tests are organized in `tests/e2e/` with dedicated folder structure for tests, results, and reports. Test scripts are available in `package.json` (`test:e2e`, `test:e2e:headed`, `test:e2e:debug`).
9. AI Assistant Context: The `.github/instructions/` directory contains augmentation rules leveraged by automated agents—keep these synchronized with code changes that alter public contracts.
10. Build Artifacts: `dist/` is disposable; never commit manual edits there.
11. Scripts: Keep cross‑platform operational scripts idempotent. For new scripts, provide Windows (`.ps1`) and POSIX (`.sh`) variants when feasible.
12. Documentation Hygiene: Update this file when (a) adding/removing a top‑level folder, (b) materially restructuring `docs/`, or (c) introducing a new architectural layer.

## Quick Reference: Adding a New Domain Feature

When adding a feature (example: inventory tracking):

1. Spec: Draft `docs/specs/<feature-name>.md` (use existing spec as template).
2. Plan: Create `docs/plans/<feature-name>.plan.md` with phased tasks.
3. Types: Add base types in `src/types/` (avoid circular imports; keep pure types).
4. Service: Introduce API/data logic under `src/services/` with unit tests.
5. Hooks: Wrap service interactions + state mgmt in a custom hook.
6. Components: Build presentational & container components in `src/components/<domain>/`.
7. Tests: Colocate tests in parallel `__tests__/` folders.
8. Migration: Add new SQL migration file under `supabase/migrations/` if schema change required.
9. Docs: Update this file if new high‑level folder or structure is introduced.
10. Env: Amend `.env.example` if new variables are needed.

## Change Log (File Structure)

- 2025-08-22: Added `20250822-global_error_handling_implementation.plan.md` to `docs/plans/` directory documenting comprehensive global error handling system implementation plan covering server errors, network failures, error context management, and testing strategies.
- 2025-08-22: Updated file structure to reflect current state: removed deprecated references to `test-results.xml` and `vitest.config.ci.ts` in root (now properly located in `tests/` subdirectories), expanded E2E test file listings to show specific test files (`basic-functionality.spec.ts`, `guest-experience-improvements.spec.ts`, `menu-crud.spec.ts`, `order-management.spec.ts`, `wait-time-configuration.spec.ts`), ensuring documentation matches actual workspace organization.
- 2025-08-22: Reorganized all test-related folders under new `tests/` root directory: moved `vitest.config.ts` and `vitest.config.ci.ts` to `tests/unit/`, moved all Playwright files from `playwright-tests/` to `tests/e2e/`, consolidated test results and reports into `tests/e2e/results/` and `tests/e2e/reports/`, and moved JUnit XML output to `tests/outputs/`. Updated all configurations and scripts to use new paths. This consolidates scattered test artifacts and eliminates duplicate test-results folders.
- 2025-08-22: Added `guest_ordering_experience_improvements.plan.md` to `docs/plans/` directory documenting implementation plan for guest UX improvements with funny name generation and barista proverbs.
- 2025-08-20: Added `technology_stack.md` to `docs/specs/` directory documenting comprehensive technology stack decisions and versions.
- 2025-08-20: Removed outdated `deployment/` & `features/` documentation references; aligned with current `specs/` layout; added `dist/`, `.env`, `package-lock.json`, Supabase `.temp/` explanation, and Quick Reference section.
- 2025-08-20: Added logo integration documentation and updated file structure to include optimized logo assets (`src/assets/logos/`), Logo component (`src/components/ui/Logo.tsx`), logo usage guide (`docs/user-guides/logo-usage-guide.md`), and implementation plan (`docs/plans/logo_integration_ui_enhancement.plan.md`).
- 2025-01-22: Updated file structure to reflect current state: added missing plan files, removed non-existent user-guides directory, added missing root-level files (eslint.config.js, log.local.txt, test-results.xml, vitest.config.ci.ts), and added generated directories (coverage/, test-results/).
- 2025-01-21: Reorganized E2E tests into dedicated `tests/e2e/` folder structure (originally `playwright-tests/`), updated package.json with E2E test scripts, and added E2E testing documentation to Notes & Conventions. Later superseded by 2025-08-22 reorganization.

---

If anything here becomes stale, treat updating this document as part of the definition of done for the related PR.
