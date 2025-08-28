# Regression Testing

Your task is to do a regression test of this application and ensure compliance with our [definition_of_done](/docs/specs/definition_of_done.md).

Run these tests and fix every issue that arise.

- [ ] Run all unit tests, including e2e testing (**IMPORTANT**: Take note of the [dual-testing-strategy](/docs/dual-strategy-testing.md). After testing, set the environment variable back to not using mocks)
- [ ] Run all linting checks
- [ ] Run all playwright tests
- [ ] Do a full exploratory functional testing using playwright MCP (reference: [playwright-mcp-instructions.md](./playwright-mcp-instructions.md)) using desktop resolution (1920x1080)
- [ ] Do a full exploratory functional testing using playwright MCP (reference: [playwright-mcp-instructions.md](./playwright-mcp-instructions.md)) using a mobile viewport (375px width)

## References

Refer to [file_structure](/docs/file_structure.md) to understand where the test configuration and scripts are located.

Refer to these documents for exploratory functional testing testing

- [application_overview](/docs/specs/application_overview.md): high level description of the functional modules available, DO NOT include detailed features here.
- [functional_specifications](/docs/specs/functional_specifications.md): documentation of all functional specifications, including detailed features.

## Regression Test Methodology

When the app is properly running, use Playwright MCP to navigate to the specified module/requirement. Use playwright to go through every functionality and test if it is functioning correctly.

- Watch out for any visual issues, layout problems, misalignments, etc. (especially due to mobile responsiveness).
- Watch out for any issues, functionally or in the browser console.

Create and update a running regression test report in `tests/outputs/regression-tests/yyyyMMddHHmm-regressiontest-log.md`, where yyyyMMddHHmm is the current date and time (for example `202508241516-regressiontest-log.md` for if the current date/time is 2025/08/24 15:16).

- Use the CLI if you need to know the current date and time.
- See the latest report in `tests/outputs/regression-tests/*-regressiontest-log.md` and use it as a guide for your report format. You DO NOT have to follow this strictly, you are free to add/change/remove content depending on what you need to test.

Use this report so you can keep track of the issues to resolve. In fixing things, follow the [test-and-fix-methodology](./test-and-fix-methodology.md)

- DO NOT assume that you can do everything first and only update this document in the end.
- Update the report document everytime you make a change.

After fixing everything, review the `yyyyMMddHHmm-regressiontest-log.md` report.

- Take a step back and review the changes.
- This should be easily readable by a product owner. Make sure there is a detailed-enough summary on top, and then provide with the additional details and logs below.
