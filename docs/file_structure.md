# File Structure

This document outlines the complete file and folder structure of the uy-kape codebase.

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
├── SECURITY.md                     # Security policy and reporting guidelines
├── src/                            # Source code directory
├── database/                       # Database schema and seed files
└── .env.example                    # Environment variables template
```

## Directory Descriptions

### Root Directory Files

- **`.env.example`** - Template for environment variables including Supabase configuration
- **`.gitignore`** - Git ignore patterns for excluding files from version control
- **`CODE_OF_CONDUCT.md`** - Community standards and behavioral expectations
- **`CONTRIBUTING.md`** - Guidelines for contributing to the project
- **`index.html`** - Main HTML template served by Vite development server
- **`LICENSE`** - Software license terms
- **`package.json`** - NPM package configuration with React, TypeScript, Vite, and Tailwind dependencies
- **`postcss.config.js`** - PostCSS configuration for processing Tailwind CSS
- **`README.md`** - Main project documentation and getting started guide
- **`SECURITY.md`** - Security policies and vulnerability reporting procedures
- **`tailwind.config.js`** - Tailwind CSS configuration with custom coffee color theme
- **`tsconfig.json`** - TypeScript configuration with strict settings for React development
- **`tsconfig.node.json`** - TypeScript configuration for Node.js build tools
- **`vite.config.ts`** - Vite build tool configuration with React plugin and path aliases

### docs/ Directory Files

- **`file_structure.md`** - This file - complete project structure overview and file descriptions
- **`plans/initial_bootstrap_implementation.plan.md`** - Implementation plan for the core bootstrap application
- **`screens/google-forms.png`** - Google Forms interface mockup for project visualization
- **`specs/initial_idea.md`** - Initial project idea documentation and requirements

### Other Directories (Folder Structure and Purpose)

- **`.git/`** - Git version control system metadata and history
- **`.github/`** - GitHub-specific configuration files and templates
- **`.vscode/`** - Visual Studio Code workspace settings and configurations
- **`database/`** - Database schema and seed files for Supabase
- **`docs/`** - Project documentation and specifications
- **`scripts/`** - Utility scripts for development and maintenance
- **`src/`** - Source code directory containing React components and application logic

## Notes

- Several directories are currently empty but provide structure for future development
- The project appears to be in early stages with foundational documentation and configuration
- Focus on GitHub Copilot integration with specific instructions and MCP configuration
- Cross-platform line ending fixes available in scripts directory for development consistency
- Development follows structured approach with file-type-specific instructions referenced from copilot-instructions.md
- All new files should follow the standards in relevant `.instructions.md` files based on file extension
