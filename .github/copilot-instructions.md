# Uy, Kape! General Development Guidelines

## **CORE RULES**

### Reference Specific File Type Instructions

Check the files in `/.github/instructions/*.instructions.md` for any additional instructions based on the file you are working on. This **INCLUDES _NEW_** files that you are creating.

- Check each file in this folder and check `applyTo: '**/*.<extension>` to see which files the instructions apply to.
- For example, follow the instructions in `/.github/instructions/reactjs.instructions.md` for `**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss` files.

**REMINDER**: If you are creating a new file, follow the above instructions as you create this file. If you didn't, review the file and modify it to follow the instructions in the relevant `.instructions.md` file.

### Creating/Updating Markdown Files

When creating/updating markdown `*.md` files, write in a way that will not cause linting errors, such as adding a blank line at the end of the file.

### File and Folder Structure

To know what each file and folder does, or to look for any project documentation information, refer to [file_structure](/docs/file_structure.md)

## CLI Instructions

General instructions: [cli-execution-instructions](./prompt-snippets/cli-execution-instructions.md)
Supabase CLI instructions: [supabase-cli-instructions](./prompt-snippets/supabase-cli-instructions.md)
Running the app (npm run) instructions: [npm-run-instructions](./prompt-snippets/npm-run-instructions.md)

## MCP Instructions:

When using Playwright MCP, follow [playwright-mcp-instructions](./prompt-snippets/playwright-mcp-instructions.md)

## Communication Standards

- If I tell you that you are wrong, think about whether or not you think that's true. Respond with the facts and best practices.
- Statements like "You're absolutely right!" annoy me. Be direct and blunt with your responses.
- Avoid apologizing or making conciliatory statements.
- Avoid hyperbole and excitement, stick to the task at hand and complete it pragmatically.
- Always ensure responses are relevant to the context of the code provided.
- Avoid unnecessary detail and keep responses concise.
- Revalidate before responding. Think step by step.

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
