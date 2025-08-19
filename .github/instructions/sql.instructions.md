---
description: "PostgreSQL development standards and best practices"
applyTo: "**/*.sql, **/*.pgsql, **/*.psql"
---

# PostgreSQL Development Instructions

Essential PostgreSQL development standards for LLM-assisted coding with modern patterns and Supabase integration.

## Core Principles

- PostgreSQL 15+ with SQL standard compliance
- Security-first with Row Level Security (RLS)
- Performance optimization through proper indexing
- Supabase platform integration

## Code Style & Formatting

- Use **UPPERCASE** for SQL keywords (SELECT, FROM, WHERE, etc.)
- Use **snake_case** for all identifiers (tables, columns, functions)
- Use **2 spaces** for indentation
- Limit lines to **100 characters**
- Place commas at the beginning of continuation lines
- Comment complex logic with `--` for single lines or `/* */` for blocks

```sql
-- Good example
SELECT u.id
     , u.email
     , p.created_at
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE u.active = true
  AND p.status = 'verified';
```

## Schema Design Essentials

### Naming Conventions

- **Tables**: Singular nouns (`user`, `order`, `product`)
- **Columns**: Descriptive names (`created_at`, `user_id`, `is_active`)
- **Constraints**: Descriptive prefixes (`pk_`, `fk_`, `idx_`, `chk_`)

### Essential Columns

Always include these in user-facing tables:

```sql
CREATE TABLE example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Data Types (PostgreSQL Preferred)

- **Text**: Use `TEXT` over `VARCHAR` unless length limits required
- **JSON**: Use `JSONB` for structured data requiring queries
- **Timestamps**: Use `TIMESTAMPTZ` for timezone-aware dates
- **UUIDs**: Use `UUID` for primary keys in distributed systems
- **Numbers**: Use `INTEGER`, `BIGINT`, or `NUMERIC(precision, scale)`

## Security & RLS

### Row Level Security Setup

```sql
-- Enable RLS on table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy for inserts
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

### Security Best Practices

- Always use parameterized queries, never string concatenation
- Create dedicated database roles with minimal permissions
- Use `SECURITY DEFINER` functions for controlled privilege escalation
- Implement audit triggers for sensitive data changes

## Performance & Indexing

### Index Types & Usage

```sql
-- B-tree (default) for equality and range queries
CREATE INDEX idx_users_email ON users (email);

-- GIN for JSONB, arrays, and full-text search
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- Partial index for filtered queries
CREATE INDEX idx_active_users ON users (created_at)
WHERE active = true;

-- Composite index (order by selectivity)
CREATE INDEX idx_users_status_created ON users (status, created_at);
```

### Query Optimization

- Use `EXPLAIN ANALYZE` to understand query plans
- Create indexes based on actual query patterns
- Consider partial indexes for frequently filtered data
- Use `LIMIT` and pagination for large result sets

## Functions & Business Logic

### SQL Functions (Preferred)

```sql
CREATE FUNCTION get_user_orders(user_uuid UUID)
RETURNS TABLE(id UUID, total NUMERIC, created_at TIMESTAMPTZ)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT o.id, o.total, o.created_at
    FROM orders o
    WHERE o.user_id = user_uuid
    ORDER BY o.created_at DESC;
$$;
```

### PL/pgSQL for Complex Logic

```sql
CREATE FUNCTION process_order(order_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id UUID;
BEGIN
    INSERT INTO orders (user_id, total, items)
    VALUES (
        (order_data->>'user_id')::UUID,
        (order_data->>'total')::NUMERIC,
        order_data->'items'
    )
    RETURNING id INTO new_order_id;

    RETURN new_order_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Order processing failed: %', SQLERRM;
END;
$$;
```

## Supabase Integration

### Auth Integration

```sql
-- Reference Supabase auth users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS with Supabase auth
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Real-time Setup

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## Common Patterns

### Audit Pattern

```sql
-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Soft Delete Pattern

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;

-- View for active records
CREATE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL;
```

### Upsert Pattern

```sql
INSERT INTO user_settings (user_id, setting_key, setting_value)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, setting_key)
DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = now();
```

## Migration Best Practices

### File Naming

- Use sequential numbering: `001_create_users.sql`, `002_add_indexes.sql`
- Include descriptive names for clarity
- Separate schema changes from data changes

### Safe Migrations

```sql
-- Always use transactions
BEGIN;

-- Create new column with default
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';

-- Add constraint after populating data
ALTER TABLE users ADD CONSTRAINT chk_status
CHECK (status IN ('active', 'inactive', 'banned'));

COMMIT;
```

### Index Creation

```sql
-- Use CONCURRENTLY for live systems
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```

## Error Handling & Debugging

### Structured Error Messages

```sql
-- In PL/pgSQL functions
RAISE EXCEPTION 'Invalid user ID: %', user_id
    USING HINT = 'User must exist in users table';
```

### Query Performance Monitoring

```sql
-- Enable pg_stat_statements for query analysis
-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## Essential Extensions

```sql
-- Enable commonly used extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Fuzzy text matching
```

## Quality Checklist

- [ ] All tables have proper primary keys (preferably UUID)
- [ ] Foreign key constraints are defined with appropriate actions
- [ ] RLS policies are implemented for user-facing tables
- [ ] Indexes exist for common query patterns
- [ ] Functions use appropriate security and volatility settings
- [ ] Sensitive operations use parameterized queries
- [ ] Audit trails exist for critical data changes
- [ ] Migration scripts are tested and reversible
