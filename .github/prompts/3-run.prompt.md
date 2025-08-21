---
mode: "run-agent"
description: "Run the application locally and fix any errors encountered."
---

Your task is to run this application locally for functional testing.

- Before attempting to run the app, check if it is already running.

  - Use playwright to navigate to the default port.
  - If the app is not running, start the application and use playwright to navigate to the app again.
  - Be patient as it make take time for the application to start. Wait 10 seconds and attempt to access the app 3x before attempting to resolve any issue to get the application to run.

- When the app is properly running, use Playwright MCP to navigate to the specified module/requirement. Use playwright to go through every functionality and test if it is functioning correctly.
- Fix any issues that arise during the process.
- If it is a major module, update the playwright tests in `/playwright-tests`
- If you need a password, check out the `.env` file in the root directory.

Refer to the following to better understand the implementation done before fixing:

- Files and folder structure, located in `/docs/file_structure.md`
- Product specifications, located in `/docs/specs`
- Or any other relevant files in the `/docs` directory.
