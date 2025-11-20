# Database Migrations

This directory contains SQL migration files that can be applied to your OmniBase database.

## Quick Start

### 1. Create a New Migration

```bash
# Interactive mode (prompts for name)
omnibase db migrate new

# Or provide name directly
omnibase db migrate new --name create_users_table
```

This creates a timestamped migration file like `1729507200_create_users_table.sql`.

### 2. Edit the Migration File

Add your SQL commands to the generated file.

### 3. Apply Migrations

```bash
# Apply to default environment
omnibase db migrate apply

# Apply to specific environment
omnibase db migrate apply --env production
```

## File Naming Convention

Migration files are automatically named with timestamps when using `omnibase db migrate new`:
- `{TIMESTAMP}_{description}.sql` (e.g., `1729507200_create_users_table.sql`)

For manual creation, you can use simple numeric prefixes:
- `001-seed.sql`
- `002-rls.sql`
- `003-feature.sql`

All files will be automatically converted to golang-migrate format (`001_seed.up.sql`, etc.) when uploaded.

## Commands

### Create Migration

```bash
# Interactive mode
omnibase db migrate new

# With name flag
omnibase db migrate new --name add_user_indexes

# Custom directory
omnibase db migrate new --dir custom/migrations --name init_schema
```

### Apply Migrations

```bash
# Default directory (omnibase/db/)
omnibase db migrate push

# Specific environment
omnibase db migrate push --env prod
```

## Requirements

- The `OMNIBASE_API_KEY` must be set in your environment configuration (`.env.{environment}` file)
- The API server must be running and accessible
- Migration files must have a `.sql` extension

## Example Migration File

When you run `omnibase db migrate new`, a file is created with this template:

**1729507200_create_users.sql:**
```sql
-- Migration: create users
-- Created: 2024-10-21T10:00:00.000Z

-- Add your SQL migration here
-- Example:
-- CREATE TABLE IF NOT EXISTS users (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     email TEXT NOT NULL UNIQUE,
--     created_at TIMESTAMP DEFAULT NOW()
-- );