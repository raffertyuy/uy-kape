---
description: "Plan for a coding implementation for an AI coding assistant to follow."
---

Your goal is to generate an coding implementation plan for an AI coding assistant to follow.
Create this plan in a new markdown .md file in `/docs/plans/<requirement_name>.plan.md`, for the requirement provided to you. You can decide on the appropriate requirement name.
For example, if the requirement name is "Implement User Authentication", the file should be created as `/docs/plans/user_authentication.plan.md`.

## RULES:

- Keep implementations simple, do not over architect
- Do not generate real code for your plan, pseudocode is OK
- For each step in your plan, include the objective of the step, the steps to achieve that objective, and any necessary pseudocode.
- Call out any necessary user intervention required for each step
- Consider accessibility part of each step and not a separate step

## Steps to Follow

### 1. FIRST

- Review the attached specification document to understand the requirements and objectives.
- If needed, use context7 MCP to get the latest documentation of the technology stack (e.g., Supabase, React.js, Vite).
- If needed, use playwright MCP to explore and analyze the application.

### 2. THEN

- Create a detailed implementation plan that outlines the steps needed to achieve the objectives of the specification document.
- The plan should be structured, clear, and easy to follow.

- Add a frontmatter to the implementation plan

```markdown
---
description: "Implementation plan for <requirement>"
created-date: YYYY-MM-DD
---

PLAN HERE
```

- Always add validation steps in your plan to ensure the implementation meets the requirements.
- Structure your plan as follows, and output as Markdown code block

```markdown
# Implementation Plan for [Spec Name]

- [ ] Step 1: [Brief title]
  - **Task**: [Detailed explanation of what needs to be implemented]
  - **Files**: [Maximum of 20 files, ideally less]
    - `path/to/file1.ts`: [Description of changes], [Pseudocode for implementation]
  - **Dependencies**: [Dependencies for step]

[Additional steps...]
```

- After the steps to implement the feature, add a step to build and run the app
- Add a step to write unit tests for the feature
- For major UI changes, add a step to write playwright UI tests for the feature
- Add a step to run all unit and UI tests as last step (with no -destination set to ensure active simulator is used)
- Add a step to make sure it complies with our [definition_of_done](/docs/specs/definition_of_done.md)

### 3. NEXT:

- Validate and self-review your plan to ensure it meets the requirements and is ready for implementation.
- Iterate with me until I am satisifed with the plan

### 4. FINALLY:

- DO NOT start implementation without my permission.
- Update `docs/file_structure.md` to include the generated plan (`/docs/plans/<requirement_name>.plan.md`), this includes the change log at the bottom of this document.
