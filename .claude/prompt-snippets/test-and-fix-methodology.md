# Test and Fix Methodology

ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix.

- Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
- Avoid hardcoding dynamic data that comes from the database, REMEMBER that the data are dynamic and changing.

Having said that, if you're done making changes, make sure to re-run all of the above tests and make sure you comply with the [definition_of_done](/docs/specs/definition_of_done.md). If you haven't, iterate again.
