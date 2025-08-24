When running commands, always do so from the root of the project directory and not within a subdirectory.

When running commands, be mindful of the operating system as the paths and environment variables may differ. Use relative paths when possible.

When running commands, be mindful if you are running something that is watching. Run commands as background processes as much as possible to avoid blocking the terminal. Check if if the existing terminal is ready to accept new commands first. Be mindful if the terminal is ready to accept commands or if a previous command is still running. Evaluate if you need to launch a new terminal.

Here are some examples of THINGS TO AVOID:
- you just ran `npm run dev`, and so the terminal is streaming logs, then you run a command like `npx playwright test` on the same terminal. DO NOT DO THIS. Instead, launch a new terminal to run `npx playwright test`.
- you just ran `npx playwright test` and now the terminal is waiting with this message "Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.". If this happens, hit CTRL+C so you can exit and read the report.