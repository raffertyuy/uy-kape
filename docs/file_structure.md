# File Structure

This document outlines the current (authoritative) top‑level file and folder structure of the Uy Kape project codebase.

Level of Detail Policy:

We intentionally avoid listing second‑level (individual file) details for application/source folders (e.g. `src/`, `supabase/`, `scripts/`, etc.) to keep this document maintainable. Only the `docs/` directory is expanded to the file level because: (1) it is used heavily by AI assistants, (2) its contents are relatively small and stable, and (3) each document has distinct purpose.

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
├── index.html             # Vite HTML entry
├── package.json           # Dependencies & scripts
├── package-lock.json      # Locked dependency graph
├── postcss.config.js      # PostCSS (Tailwind)
├── tailwind.config.js     # Tailwind theme/config
├── tsconfig.json          # TS config (app)
├── tsconfig.node.json     # TS config (node scripts)
├── vite.config.ts         # Vite build config
├── vitest.config.ts       # Vitest test config
├── docs/                  # (Fully expanded below)
│   ├── file_structure.md  # This document
│   ├── ci-workflow-guide.md  # CI/CD workflow documentation for React + Supabase
│   ├── plans/
│   │   ├── barista_admin_menu_management.plan.md
│   │   ├── continuous_integration_workflow.plan.md
│   │   ├── initial_bootstrap_implementation.plan.md
│   │   └── unit_tests_implementation.plan.md
│   ├── screens/
│   │   └── old_ordering_system.png
│   ├── specs/
│   │   ├── barista-admin-menu-management.md
│   │   ├── db_schema.md
│   │   ├── initial_idea.md
│   │   └── technology_stack.md
│   └── user-guides/
│       └── menu-management-quick-start.md
├── scripts/               # Operational / helper scripts (not expanded)
├── database/              # Legacy SQL schema + seed (reference only)
├── supabase/              # Supabase project (config, migrations, seed)
├── src/                   # React + TS application source (not expanded)
├── dist/                  # Build output (generated)
└── node_modules/          # Installed dependencies (ignored)
```

## Notes & Conventions

1. Source of Truth (Database): Always introduce schema changes via a new timestamped file in `supabase/migrations/` (never retro‑edit existing migrations). The old `database/` folder is historical.
2. Seeding: Prefer `supabase/seed.sql`. The legacy `database/seed.sql` should not be extended further.
3. Testing Layout: Tests colocated in `__tests__` directories inside feature folders (components, hooks, services, pages, types, utils). Global setup in `src/setupTests.ts`.
4. Environment Variables: Keep secrets local (`.env` not committed). Update `.env.example` when new required variables are introduced.
5. Styling: Tailwind first; add component‑level overrides sparingly. Central theme config lives in `tailwind.config.js`.
6. Real‑Time Features: Supabase channels & presence are encapsulated in hooks (`useMenuSubscriptions`) and service abstractions; UI surfaces connection via components like `RealtimeIndicator`.
7. AI Assistant Context: The `.github/instructions/` directory contains augmentation rules leveraged by automated agents—keep these synchronized with code changes that alter public contracts.
8. Build Artifacts: `dist/` is disposable; never commit manual edits there.
9. Scripts: Keep cross‑platform operational scripts idempotent. For new scripts, provide Windows (`.ps1`) and POSIX (`.sh`) variants when feasible.
10. Documentation Hygiene: Update this file when (a) adding/removing a top‑level folder, (b) materially restructuring `docs/`, or (c) introducing a new architectural layer.

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

- 2025-08-20: Removed outdated `deployment/` & `features/` documentation references; aligned with current `specs/` layout; added `dist/`, `.env`, `package-lock.json`, Supabase `.temp/` explanation, and Quick Reference section.
- 2025-08-20: Added `technology_stack.md` to `docs/specs/` directory documenting comprehensive technology stack decisions and versions.

---

If anything here becomes stale, treat updating this document as part of the definition of done for the related PR.
