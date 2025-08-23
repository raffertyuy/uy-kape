# File Structure

```text
uy-kape/
├── .github/               # GitHub configs, workflows, AI instructions
├── .env.example           # Template env vars
├── CODE_OF_CONDUCT.md     # Community guidelines
├── CONTRIBUTING.md        # Contribution workflow
├── eslint.config.js       # ESLint configuration
├── index.html             # Vite HTML entry
├── LICENSE                # OSS license
├── package.json           # Dependencies & scripts
├── package-lock.json      # Locked dependency graph
├── playwright.config.ts   # Playwright configuration
├── postcss.config.js      # PostCSS (Tailwind)
├── README.md              # Overview & onboarding
├── SECURITY.md            # Security policy
├── tailwind.config.js     # Tailwind theme/config
├── tsconfig.json          # TS config (app)
├── tsconfig.node.json     # TS config (node scripts)
├── vercel.json            # Vercel deployment configuration
├── vite.config.ts         # Vite build config
├── vitest.config.ts       # Vitest config (re-exports from tests/config/)
├── database/              # Legacy SQL schema + seed (reference only)
├── docs/                  # (Fully expanded below)
│   ├── error-handling-system.md  # Global error handling system documentation
│   ├── file_structure.md  # This document
│   ├── testing.md         # Testing documentation and guidelines
│   ├── plans/             # Implementation plans (excluded from documentation)
│   ├── screens/
│   │   └── old_ordering_system.png  # Reference screenshot of old system
│   └── specs/
│       ├── application_overview.md   # High-level application overview
│       ├── db_schema.md             # Database schema documentation
│       ├── definition_of_done.md    # Development standards and completion criteria
│       ├── global_error_handling_dod_compliance.md  # Error handling DoD compliance documentation
│       └── technology_stack.md      # Technology stack decisions and versions
├── public/                # Static assets (favicons, PWA icons)
├── scripts/               # Operational / helper scripts
├── src/                   # React + TS application source
│   ├── assets/            # Static assets and logos
│   ├── components/        # React components
│   ├── config/            # Application configuration
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   ├── services/          # API and business logic
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── supabase/              # Supabase project (config, migrations, seed)
└── tests/                 # All test-related files and outputs
    ├── config/            # Centralized test configuration files (Vitest, Playwright)
    ├── e2e/               # End-to-end tests (Playwright) organized by domain
    │   ├── admin/         # Admin-specific E2E tests
    │   ├── fixtures/      # Test fixtures and mock data
    │   ├── guest/         # Guest user flow E2E tests
    │   ├── system/        # System-level E2E tests
    │   └── utils/         # E2E testing utilities and helpers
    └── outputs/           # Test execution outputs and reports
```

## Notes & Conventions

1. Source of Truth (Database): Always introduce schema changes via a new timestamped file in `supabase/migrations/` (never retro‑edit existing migrations). The old `database/` folder is historical.
2. Seeding: Prefer `supabase/seed.sql`. The legacy `database/seed.sql` should not be extended further.
3. Testing Layout: Unit tests colocated in `__tests__` directories inside feature folders (components, hooks, services, pages, types, utils) following React.js industry best practices. Global setup in `src/setupTests.ts`. All test configurations are centralized under `tests/config/` including shared Vitest and Playwright configurations. E2E tests are organized by domain in `tests/e2e/` with subdirectories for admin/, guest/, and system/ flows. Test outputs, reports, and artifacts are consolidated in `tests/outputs/`.
4. Environment Variables: Keep secrets local (`.env` not committed). Update `.env.example` when new required variables are introduced.
5. Styling: Tailwind first; add component‑level overrides sparingly. Central theme config lives in `tailwind.config.js`.
6. Real‑Time Features: Supabase channels & presence are encapsulated in hooks (`useMenuSubscriptions`) and service abstractions; UI surfaces connection via components like `RealtimeIndicator`.
7. Logo Integration: The reusable Logo component (`src/components/ui/Logo.tsx`) provides consistent branding across the application with responsive sizing variants (xs, sm, md, lg, xl, hero) and accessibility features.
8. E2E Testing: End-to-end tests are organized in `tests/e2e/` with domain-specific subdirectories (admin/, guest/, system/) for better organization and maintainability. Centralized test configurations are located in `tests/config/` with shared Vitest and Playwright setup files. All test execution outputs, reports, and artifacts are consolidated in `tests/outputs/`. Test scripts are available in `package.json` (`test:e2e`, `test:e2e:headed`, `test:e2e:debug`).
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

- 2025-08-23: Updated ESLint configuration to include `src/lib/**/*.ts` files in the utility files override rules, resolving lint warnings for library files like Supabase client configuration. Removed system-generated files (`.env`, `log.local.txt`) from file structure documentation per exclusion rules while maintaining focus on major project files and directories.

- 2025-08-23: Implemented comprehensive test structure reorganization following React.js industry best practices: centralized all test configurations in `tests/config/` directory with shared Vitest and Playwright configuration files, enhanced E2E test organization with domain-specific subdirectories (`tests/e2e/admin/`, `tests/e2e/guest/`, `tests/e2e/system/`) and added supporting infrastructure including `tests/e2e/fixtures/` for test data and `tests/e2e/utils/` for shared E2E utilities. Created validation tooling with `tests/config/validate-structure.ts` CLI script to ensure test structure compliance. All test outputs and reports are now consolidated in `tests/outputs/` directory. Updated root-level configuration files (`vitest.config.ts`, `playwright.config.ts`) to reference centralized configurations, ensuring consistent test execution across all environments.

- 2025-08-23: Updated file structure documentation to comply with exclusion rules: removed system-generated files (`.git/`, `.gitignore`, `.vscode/`, `node_modules/`, `dist/`, `.vite/`, `.playwright-mcp/`) per gitignore and temporary file exclusions, reorganized root-level files in alphabetical order for better readability, simplified test structure documentation to show only the main organizational folders without excessive subdirectory detail, and maintained focus on major files and directories that are important for project understanding and documentation purposes.

- 2025-08-23: Updated file structure documentation to reflect current workspace state: removed references to system-generated files (`log.local.txt`, `dist/`, `node_modules/`) per exclusion rules, simplified src/ directory structure to show level 2 folders without excessive detail, corrected vitest.config.ts reference to point to `tests/config/`, and cleaned up documentation to match actual folder organization while maintaining required level of detail.

- 2025-08-23: Reorganized test structure with centralized configurations: moved all test configurations to `tests/config/` directory, reorganized E2E tests by domain with `tests/e2e/admin/`, `tests/e2e/guest/`, and `tests/e2e/system/` subdirectories, and consolidated all test outputs in `tests/outputs/` including both unit and E2E test artifacts. Added missing `playwright.config.ts` to root directory documentation.

- 2025-08-22: Added `error-handling-system.md` to `docs/` root directory and `global_error_handling_dod_compliance.md` to `docs/specs/` documenting global error handling system implementation and DoD compliance. Added `vercel.json` deployment configuration. Excluded `docs/plans/` files from documentation per instructions while maintaining folder reference.

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
