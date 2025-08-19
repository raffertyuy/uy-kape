# File Structure

This document outlines the complete file and folder structure of the uy-kape codebase.

```
uy-kape/
├── .git/                           # Git repository metadata
├── .github/                        # GitHub configuration and workflows
│   ├── chatmodes/                  # (empty) - Chat mode configurations
│   ├── instructions/               # Development instructions
│   │   └── reactjs.instructions.md # ReactJS development standards
│   ├── prompt-snippets/            # Reusable prompt snippets
│   │   └── coding-standards.md     # General coding standards
│   ├── prompts/                    # (empty) - Custom prompts
│   ├── workflows/                  # (empty) - GitHub Actions workflows
│   └── copilot-instructions.md     # GitHub Copilot configuration
├── .gitignore                      # Git ignore rules
├── .vscode/                        # VS Code workspace configuration
│   └── mcp.json                    # Model Context Protocol configuration
├── CODE_OF_CONDUCT.md              # Community code of conduct
├── CONTRIBUTING.md                 # Contribution guidelines
├── index.html                      # Main HTML template for Vite
├── package.json                    # NPM package configuration and dependencies
├── postcss.config.js               # PostCSS configuration for Tailwind CSS
├── tailwind.config.js              # Tailwind CSS configuration with coffee theme
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript configuration for Node.js files
├── vite.config.ts                  # Vite build tool configuration
├── docs/                           # Documentation
│   ├── plans/                      # Project planning documents
│   │   └── initial_bootstrap_implementation.plan.md # Implementation plan for bootstrap base
│   ├── screens/                    # Screenshots and UI mockups
│   │   └── google-forms.png        # Google Forms interface mockup
│   ├── specs/                      # Specifications and requirements
│   │   └── initial_idea.md         # Initial project idea documentation
│   └── file_structure.md           # This file - project structure overview
├── LICENSE                         # Project license
├── README.md                       # Project overview and setup instructions
├── scripts/                        # Utility scripts
│   ├── fix-line-endings.ps1        # PowerShell script to fix line endings
│   └── fix-line-endings.sh         # Bash script to fix line endings
├── SECURITY.md                     # Security policy and reporting guidelines
├── src/                            # Source code directory
│   ├── App.tsx                     # Root React component with routing setup
│   ├── components/                 # Reusable React components
│   │   ├── Layout.tsx              # Main layout component with navigation
│   │   └── PasswordProtection.tsx # Password protection wrapper component
│   ├── config/                     # Application configuration
│   │   └── app.config.ts           # App settings, passwords, and constants
│   ├── hooks/                      # Custom React hooks
│   │   └── usePasswordAuth.ts      # Password authentication hook
│   ├── index.css                   # Global styles with Tailwind CSS imports
│   ├── lib/                        # Library integrations
│   │   └── supabase.ts             # Supabase client configuration
│   ├── main.tsx                    # Main React application entry point  
│   ├── pages/                      # React page components
│   │   ├── BaristaModule.tsx       # Barista admin interface (password protected)
│   │   ├── GuestModule.tsx         # Guest ordering interface (password protected)
│   │   └── WelcomePage.tsx         # Welcome/landing page component
│   ├── types/                      # TypeScript type definitions
│   │   ├── app.types.ts            # Application-specific types
│   │   └── database.types.ts       # Supabase database types
│   └── vite-env.d.ts               # Vite environment variable types
├── database/                       # Database schema and seed files
│   ├── schema.sql                  # Supabase database schema
│   └── seed.sql                    # Initial drink menu data
└── .env.example                    # Environment variables template
```

## Directory Descriptions

- **`.git/`** - Git version control system metadata and history
- **`.github/`** - GitHub-specific configuration files and templates
  - **`chatmodes/`** - Configuration for different chat interaction modes (currently empty)
  - **`instructions/`** - Development guidelines and standards for specific technologies
  - **`prompt-snippets/`** - Reusable prompt templates and coding standards
  - **`prompts/`** - Custom prompt definitions (currently empty)
  - **`workflows/`** - GitHub Actions CI/CD workflows (currently empty)
- **`.vscode/`** - Visual Studio Code workspace settings and configurations
- **`docs/`** - Project documentation and specifications
  - **`plans/`** - Project planning and roadmap documents
    - `initial_bootstrap_implementation.plan.md` - Implementation plan for the core bootstrap application
  - **`screens/`** - Screenshots and UI mockups for project visualization
  - **`specs/`** - Technical specifications and requirements
- **`scripts/`** - Utility scripts for development and maintenance
- **`database/`** - Database schema and seed files for Supabase
- **`src/`** - Source code directory containing React components and application logic
  - **`components/`** - Reusable React components for UI elements
  - **`config/`** - Application configuration files and constants
  - **`hooks/`** - Custom React hooks for shared logic
  - **`lib/`** - Third-party library integrations and configurations
  - **`pages/`** - React page components for different application views
  - **`types/`** - TypeScript type definitions and interfaces
- **Root files**:
  - `.env.example` - Template for environment variables including Supabase configuration
  - `.gitignore` - Git ignore patterns for excluding files from version control
  - `index.html` - Main HTML template served by Vite development server
  - `package.json` - NPM package configuration with React, TypeScript, Vite, and Tailwind dependencies
  - `postcss.config.js` - PostCSS configuration for processing Tailwind CSS
  - `tailwind.config.js` - Tailwind CSS configuration with custom coffee color theme
  - `tsconfig.json` - TypeScript configuration with strict settings for React development
  - `tsconfig.node.json` - TypeScript configuration for Node.js build tools
  - `vite.config.ts` - Vite build tool configuration with React plugin and path aliases
  - `.gitignore` - Git ignore patterns for excluding files from version control
  - `CODE_OF_CONDUCT.md` - Community standards and behavioral expectations
  - `CONTRIBUTING.md` - Guidelines for contributing to the project
  - `LICENSE` - Software license terms
  - `README.md` - Main project documentation and getting started guide
  - `SECURITY.md` - Security policies and vulnerability reporting procedures

## Notes

- Several directories are currently empty but provide structure for future development
- The project appears to be in early stages with foundational documentation and configuration
- Focus on GitHub Copilot integration with specific instructions and MCP configuration
- Scripts directory includes cross-platform line ending fixes for development consistency
