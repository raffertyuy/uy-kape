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
└── src/                            # (empty) - Source code directory
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
- **`src/`** - Source code directory (currently empty, ready for development)
- **Root files**:
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
