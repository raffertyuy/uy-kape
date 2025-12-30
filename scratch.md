Problem: This project is using a Supabase database on a free plan, which disables automatically if low usage is detected every 7 days.

Idea: Create a GitHub actions workflow that runs a SELECT command on the drinks and orders table daily to keep the database active.
