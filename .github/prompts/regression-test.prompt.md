---
mode: "run-agent"
description: "Run through every functionality of the application to test and fix."
---

Your task is to use playwright MCP to run this application locally and go through every functionality to ensure that everything is working.

See `docs/specs/application_overview.md` to know the different functions of this application.

## Rules for Running the App

Before attempting to run the app, check if it is already running.

- Use playwright to navigate to the default port.
- If the app is not running, start the application and use playwright to navigate to the app again.
- Be patient as it make take time for the application to start. Wait 10 seconds and attempt to access the app 3x before attempting to resolve any issue to get the application to run.

If you need a password, check out the `.env` file in the root directory.

## Text and Fix Methodology

When the app is properly running, use Playwright MCP to navigate to the specified module/requirement. Use playwright to go through every functionality and test if it is functioning correctly.

Run these tests and fix every issue that arise.

- [ ] Run all unit tests, including e2e testing
- [ ] Run linting
- [ ] Run playwright tests

ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix.

Having said that, if you're making code changes, make sure to re-run all of the above tests.

## Test Output Directory

The test output directory is found in the `tests/` folder. DO NOT output test results in the root folder.
