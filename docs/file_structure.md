# File Structure

This document outlines the complete file and folder structure of the Uy Kape project codebase.

This contains:
- The description of all the files in the `/` root directory
- The description of every root folder
- The description of all the files and subdirectories in the `docs/`

```
uy-kape/
├── .git/                           # Git repository metadata
├── .github/                        # GitHub configuration and workflows
├── .gitignore                      # Git ignore rules
├── .vscode/                        # VS Code workspace configuration
├── CODE_OF_CONDUCT.md              # Community code of conduct
├── CONTRIBUTING.md                 # Contribution guidelines
├── index.html                      # Main HTML template for Vite
├── package.json                    # NPM package configuration and dependencies
├── postcss.config.js               # PostCSS configuration for Tailwind CSS
├── tailwind.config.js              # Tailwind CSS configuration with coffee theme
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript configuration for Node.js files
├── vite.config.ts                  # Vite build tool configuration
├── docs/                           # Main project documentation folder. This is referred to heavily by the AI Agent.
│   ├── deployment/                # Deployment guides and checklists
│   │   └── menu-management-deployment-checklist.md # Deployment checklist for menu management feature
│   ├── features/                  # Feature-specific documentation
│   │   └── barista-admin-menu-management.md # Complete technical documentation for menu management
│   ├── plans/                     # Project planning documents
│   │   ├── barista_admin_menu_management.plan.md # COMPLETE - Implementation plan for menu management
│   │   ├── initial_bootstrap_implementation.plan.md # Implementation plan for bootstrap base
│   │   └── unit_tests_implementation.plan.md # Implementation plan for unit tests
│   ├── screens/                   # Screenshots and UI mockups
│   │   └── old_ordering_system.png # Screenshot of the old ordering system before this application.
│   ├── specs/                     # Specifications and requirements
│   │   ├── db_schema.md           # Supabase DB schema
│   │   └── initial_idea.md        # Initial project idea documentation
│   ├── user-guides/               # End-user documentation
│   │   └── menu-management-quick-start.md # Quick start guide for baristas using menu management
│   └── file_structure.md          # This file - project structure overview
├── LICENSE                         # Project license
├── README.md                       # Project overview and setup instructions
├── scripts/                        # Utility scripts
├── SECURITY.md                     # Security policy and reporting guidelines
├── src/                            # Source code directory
│   ├── components/                # React components
│   │   ├── menu/                  # Menu management components (15+ components)
│   │   │   ├── categories/        # Drink category management components
│   │   │   ├── drinks/            # Drink management components
│   │   │   ├── options/           # Option management components
│   │   │   └── shared/            # Shared menu components
│   │   ├── Layout.tsx             # Main application layout
│   │   ├── PasswordProtection.tsx # Password protection component
│   │   └── __tests__/             # Component tests
│   ├── config/                    # Application configuration
│   │   ├── app.config.ts          # App configuration settings
│   │   └── __tests__/             # Config tests
│   ├── hooks/                     # Custom React hooks
│   │   ├── useMenuData.ts         # Menu data management hook
│   │   ├── useMenuSubscriptions.ts # Real-time subscription management
│   │   ├── useErrorHandling.ts    # Error handling hook
│   │   ├── usePasswordAuth.ts     # Password authentication hook
│   │   └── __tests__/             # Hook tests
│   ├── lib/                       # Utility libraries
│   │   └── supabase.ts            # Supabase client configuration
│   ├── pages/                     # Page components
│   │   ├── BaristaModule.tsx      # Barista admin interface (updated with menu management)
│   │   ├── GuestModule.tsx        # Guest ordering interface
│   │   ├── MenuManagement.tsx     # Main menu management page
│   │   └── WelcomePage.tsx        # Welcome/landing page
│   ├── services/                  # Service layer for data operations
│   │   ├── menuService.ts         # Comprehensive menu CRUD operations
│   │   └── __tests__/             # Service tests
│   ├── types/                     # TypeScript type definitions
│   │   ├── app.types.ts           # Application types
│   │   ├── database.types.ts      # Database types (Supabase generated)
│   │   ├── menu.types.ts          # Menu-specific types and interfaces
│   │   └── __tests__/             # Type tests
│   ├── utils/                     # Utility functions
│   │   ├── conflictResolution.ts  # Real-time conflict resolution utilities
│   │   ├── menuValidation.ts      # Menu validation utilities
│   │   └── __tests__/             # Utility tests
│   ├── App.tsx                    # Main React application component
│   ├── index.css                  # Global styles with Tailwind CSS
│   ├── main.tsx                   # Application entry point
│   ├── setupTests.ts              # Test configuration
│   ├── test-utils.tsx             # Testing utilities and helpers
│   └── vite-env.d.ts              # Vite environment types
├── database/                       # Database schema and seed files
└── .env.example                    # Environment variables template
```

## Notes

- **Menu Management Feature**: Fully implemented with comprehensive CRUD operations, real-time collaboration, and barista admin integration
- Several directories are currently empty but provide structure for future development
- The project appears to be in early stages with foundational documentation and configuration
- Focus on GitHub Copilot integration with specific instructions and MCP configuration
- Cross-platform line ending fixes available in scripts directory for development consistency
- Uses GitHub Copilot and its advanced features such as `.github/copilot-instructions.md`, `.github/chatmodes/`, `.github/instructions/`, and `.github/prompts/`
- Complete test coverage for menu management functionality with React Testing Library and Vitest
- Comprehensive documentation including feature docs, user guides, and deployment checklists