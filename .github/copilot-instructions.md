# Uy, Kape! General Development Guidelines

## **CORE RULES**

### Reference Specific File Type Instructions

Check the files in `/.github/instructions/*.instructions.md` for any additional instructions based on the file you are working on. This **INCLUDES _NEW_** files that you are creating.

- Check each file in this folder and check `applyTo: '**/*.<extension>` to see which files the instructions apply to.
- For example, follow the instructions in `/.github/instructions/reactjs.instructions.md` for `**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss` files.

**REMINDER**: If you are creating a new file, follow the above instructions as you create this file. If you didn't, review the file and modify it to follow the instructions in the relevant `.instructions.md` file.

### File and Folder Structure

**Creating New Files and Folders**

- When you are creating new files or folders, follow the standards in #file:/docs/file_structure.md
- For files in the `/` root directory and `docs/` directory, each individual file is described in #file:/docs/file_structure.md
- For the other files, only describe the folder structure and purpose (e.g. `src/` contains the source code for the application)

**Understanding the Project Structure**:
If you need a reference for what each file or folder does, refer #file:/docs/file_structure.md and the files in the /docs folder.
For example:

- `/README.md` contains the overview of this application
- `/docs/specs/initial_idea.md` contains the initial idea for this application

## Communication Standards

**BE DIRECT AND PRAGMATIC**:

- Provide factual, actionable guidance
- Avoid hyperbole and excitement - stick to technical facts
- Think step-by-step and revalidate before responding
- Ensure responses are relevant to the codebase context

**AVOID**:

- Unnecessary apologizing or conciliatory statements
- Agreeing with users without factual basis ("You're right", "Yes")
- Verbose explanations when concise answers suffice

## CLI Standards

- When running commands, always do so from the root of the project directory and not within a subdirectory.
- When running commands, be mindful of the operating system as the paths and environment variables may differ. Use relative paths when possible.

## MCP Server Integration

**IF AVAILABLE**, use these Model Context Protocol servers:

- **Terraform MCP Server**: Seamless integration with Terraform Registry APIs for IaC automation
- **Azure MCP Server**: Connection to Azure services (Dev Center, Dev Box, Storage, Cosmos DB, etc.)

## Quality Standards

### **NEVER** Commit Without:

- Running validation tools (formatting, linting, testing)
- Testing examples to ensure they work
- Updating relevant documentation

### **ALWAYS** Ensure:

- Changes follow established project patterns
- New features include complete working examples
- Security considerations (no hardcoded credentials)
- Obfuscation of sensitive information (e.g., Subscription IDs, usernames)
- Backward compatibility or proper breaking change documentation

Follow [coding-standards](/.github/prompt-snippets/coding-standards.md)
