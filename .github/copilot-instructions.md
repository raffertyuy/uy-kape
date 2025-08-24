# Uy, Kape! General Development Guidelines

## **CORE RULES**

### Reference Specific File Type Instructions

Check the files in `/.github/instructions/*.instructions.md` for any additional instructions based on the file you are working on. This **INCLUDES _NEW_** files that you are creating.

- Check each file in this folder and check `applyTo: '**/*.<extension>` to see which files the instructions apply to.
- For example, follow the instructions in `/.github/instructions/reactjs.instructions.md` for `**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss` files.

**REMINDER**: If you are creating a new file, follow the above instructions as you create this file. If you didn't, review the file and modify it to follow the instructions in the relevant `.instructions.md` file.

### File and Folder Structure

To know what each file and folder does, or to look for any project documentation information, refer to [file_structure](/docs/file_structure.md)

## CLI Instructions

General instructions: [cli-execution-instructions](./prompt-snippets/cli-execution-instructions.md)
Supabase CLI instructions: [supabase-cli-instructions](./prompt-snippets/supabase-cli-instructions.md)
Running the app (npm run) instructions: [npm-run-instructions](./prompt-snippets/npm-run-instructions.md)

## MCP Instructions:

When using Playwright MCP, follow [playwright-mcp-instructions](./prompt-snippets/playwright-mcp-instructions.md)

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
- NEVER tell me that the system is "enterprise-grade" OR "production-ready". Instead remind me that it is my responsibility to validate the changes to make it production-ready.

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
