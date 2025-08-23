---
mode: "agent"
description: "Updates `database/seed.sql` based on what's in supabase"
---

Update the supabase seed data in `database/seed.sql`. Use supabase MCP and query the remote database for the latest data.

Here are the database tables that you should update:

- drink_categories
- drinks
- option_categories
- option_values
- drink_options

Review the database schema before updating, see [db_schema.md](/docs/specs/db_schema.md) and [schema.sql](/database/schema.sql).
