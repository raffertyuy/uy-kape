# Problem Statement

Currently, every drink has the same wait time (set by the .env variable VITE_WAIT_TIME_PER_ORDER, defaulted to 4 minutes).

However, not every drink takes the same time to prepare.
For example:

An espresso takes 3 minutes to prepare
A Yakult takes 1 minute to prepare
A latte takes 5 minutes to prepare
An ice-blended coffee takes 15 minutes to prepare

## Proposed change

In the Barista Admin module - menu management, the barista should be able to set the preparation time per drink.

- This is an optional field, if it's not available, we will still default to the global VITE_WAIT_TIME_PER_ORDER configuration.
- Note that 0 preparation time value is allowed. This means that the prep time for the drink is 0 minutes (and will not use the default VITE_WAIT_TIME_PER_ORDER configuration).

This impacts the guest module user experience also.

- When a guest is in the order confirmation page, the guest is shown an estimated wait time based on his/her queue position. 
- Now the estimated wait time should be computed based on the total wait time of the queue ahead of him/her.

## Database changes

This requirement will likely involve changes to the database schema. Potentially by adding a preparation time column to the drinks table. If yes, do the following:

- Refer to and update `/supabase/schema.sql` and `/supabase/seed.sql` as needed.
- Also update `/docs/specs/db_schema.md` if you are updating the db schema. 
- Delete the existing `/supabase/migrations/20250823145856_initial_schema_and_seed.sql`, and redo the migration from a clean database. You are allowed to reset my local supabase db to reapply the schema and new seed data, see [supabase-cli-instructions](/.github/prompt-snippets/supabase-cli-instructions.md)

In the seed data, set these default preparation time values:

- Espresso, 3 minutes
- Espresso Macchiato, 3 minutes
- Black Coffee (Moka Pot), 10 minutes
- Black Coffee (V60), 10 minutes
- Black Coffee (Aeropress), 10 minutes
- Ice-Blended Coffee, 15 minutes
- Affogato, 7 minutes
- Milo, 0 minutes
- Ribena, 0 minutes
- Yakult, 0 minutes
- Everything else, NULL

## Test Scripts

No new playwright test scripts necessary. However use playwright MCP to do an exploratory testing to test and compute if the estimated wait time is correct. i.e.

1. go to admin orders dashboard to clear all pending orders
2. go to the guest module to order an Espresso, the estimated wait time should show as 3 minutes
3. place another order for an Ice-Blended Coffee, the estimated wait time should show as 15 minutes
4. place another order for a Milo, the estimated wait time should still show as 15 minutes (because this has 0 preparation time)
5. place another order for a Cappuccino, the estimated wait time should be 15 + the value of VITE_WAIT_TIME_PER_ORDER.

But in the plan, before this step of exploratory testing, add a step in the plan to update `/docs/specs/functional_specifications.md` with this new requirement that explains the simulated test in the details.
