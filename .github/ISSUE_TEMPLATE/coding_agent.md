---
name: 'New Issue for the GitHub Copilot Coding Agent'
about: 'Assign a new task for the GitHub Copilot Coding Agent to implement'
title: 'Implement {task}'
labels: 'enhancement'
assignees: 'copilot-swe-agent'
---

Your goal is to implement the specified task by **STRICTLY FOLLOWING** the mandatory 4-step process below.

## TASK
REPLACE_WITH_YOUR_TASK

## ⚠️ MANDATORY WORKFLOW - DO NOT SKIP ANY STEPS ⚠️

**WARNING**: You MUST follow these steps in order. Do NOT work directly on code without completing all steps. Skipping any step or working outside this process is NOT acceptable.

### **STEP 1 - MANDATORY**: Read Instructions
1. Read and follow ALL instructions in `.github/copilot-instructions.md`
2. Review file-specific instructions in `.github/instructions/*.instructions.md` 
3. **Checkpoint**: Confirm you understand the project structure and coding standards

### **STEP 2 - MANDATORY**: Create Implementation Plan  
1. Run `/1-plan {task}` following `.github/prompts/1-plan.prompt.md`
2. **CRITICAL**: This MUST create a new file `docs/plans/YYYYMMDD-{task_name}.plan.md`
3. **Checkpoint**: Verify the plan file exists and contains proper frontmatter and detailed steps
4. **Do NOT proceed to Step 3 until this plan file is created**

### **STEP 3 - MANDATORY**: Implement the Plan
1. Run `/2-implement #file:docs/plans/YYYYMMDD-{task_name}.plan.md` following `.github/prompts/2-implement.prompt.md`
2. **CRITICAL**: Work ONLY from the plan created in Step 2
3. **Checkpoint**: Mark each completed step in the plan file as you progress
4. **Do NOT implement anything not covered in the plan**

### **STEP 4 - MANDATORY**: Test and Validate
1. Run `/3-run {task_name}` following `.github/prompts/3-run.prompt.md`
2. **Checkpoint**: Ensure all functionality works as expected
3. Fix any issues found during testing

## ❌ WHAT NOT TO DO
- **DO NOT** work directly on code without creating a plan first
- **DO NOT** skip the plan creation step (Step 2)
- **DO NOT** implement features not outlined in the created plan
- **DO NOT** proceed to the next step without completing the current one
- **DO NOT** assume existing plan files are sufficient - create NEW ones for each requirement

## ✅ SUCCESS CRITERIA
- [ ] All 4 steps completed in order
- [ ] New plan file created in `docs/plans/` with current date
- [ ] Implementation matches the created plan
- [ ] The created plan is followed step by step, and each step is marked as complete after finishing
- [ ] All tests pass and functionality works
- [ ] Code follows project standards and instructions
- [ ] `docs/file_structure.md` is updated