---
name: 'New Issue for the GitHub Copilot Coding Agent'
about: 'Assign a new task for the GitHub Copilot Coding Agent to implement'
title: 'Implement {requirement}'
labels: 'enhancement'
assignees: 'copilot'
---

Your goal is to implement the specified requirement by following the steps below.

## Requirement to implement
REPLACE_WITH_YOUR_REQUIREMENT

## STEPS
1. Read and follow the instructions in `.github/copilot-instructions.md`.
2. Create an implementation plan by running `/1-plan {requirement}`. This follows the prompt in `.github/prompts/1-plan.prompt.md` and outputs a new file: {module_name}.plan.md
3. Implement the created implementation plan by running `/2-implement #file:docs/plans/{requirement}.plan.md`. This follows the prompt in `.github/prompts/2-implement.prompt.md` for the plan created in step 2.
4. Run `/3-run {requirement}`. This follows the prompt in `.github/prompts/3-run.prompt.md`.