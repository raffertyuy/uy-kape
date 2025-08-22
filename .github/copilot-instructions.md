# Uy, Kape! General Development Guidelines

## **CORE RULES**

### Reference Specific File Type Instructions

Check the files in `/.github/instructions/*.instructions.md` for any additional instructions based on the file you are working on. This **INCLUDES _NEW_** files that you are creating.

- Check each file in this folder and check `applyTo: '**/*.<extension>` to see which files the instructions apply to.
- For example, follow the instructions in `/.github/instructions/reactjs.instructions.md` for `**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss` files.

**REMINDER**: If you are creating a new file, follow the above instructions as you create this file. If you didn't, review the file and modify it to follow the instructions in the relevant `.instructions.md` file.

### File and Folder Structure

To know what each file and folder does, or to look for any project documentation information, refer to [file_structure](/docs/file_structure.md)

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
- NEVER say that the system is "production-ready", you should encourage further testing and validation.

## CLI Standards

- When running commands, always do so from the root of the project directory and not within a subdirectory.
- When running commands, be mindful of the operating system as the paths and environment variables may differ. Use relative paths when possible.
- When running commands, be mindful if the terminal is ready to accept commands or if a previous command is still running. Evaluate if you need to launch a new terminal.
- When running commands, be mindful if you are running something that is watching. Run commands as background processes as much as possible to avoid blocking the terminal.

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

### Coding Standards

All code changes must follow our [coding-standards](/.github/prompt-snippets/coding-standards.md).

## Definition of Done

All changes must comply with our [definition_of_done](/docs/specs/definition_of_done.md).
