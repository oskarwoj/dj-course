# Database Migration Scripts

This directory contains migration scripts to align the database schema with the expected state defined in `init-db.sql`.

## Overview

The current database has an older `shipments` table schema that differs from what's defined in `init-db.sql`. This migration transforms it to match the expected state.

### Current State (Before Migration)

**shipments table:**
- `id` (integer, primary key)
- `carrier_id` (integer, foreign key to carriers)
- `weight_kg` (numeric)
- `details` (jsonb)

### Expected State (After Migration)

**shipments table:**
- `id` (integer, primary key)
- `tracking_number` (varchar, unique)
- `origin` (varchar)
- `destination` (varchar)
- `weight_kg` (numeric)
- `status` (varchar with check constraint)
- `priority` (varchar with check constraint)
- `metadata` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Migration Files

1. **001_align_with_init_schema.sql** - Main migration script
2. **001_rollback_align_with_init_schema.sql** - Rollback script to revert changes

## How to Apply Migration

### Option 1: Using PostgreSQL MCP (Recommended)

```bash
# Apply migration
claude-code execute "Apply the migration script using MCP"
```

### Option 2: Using psql CLI

```bash
# Apply migration
psql -h localhost -p 5432 -U admin -d jsonbdb -f 001_align_with_init_schema.sql

# To rollback if needed
psql -h localhost -p 5432 -U admin -d jsonbdb -f 001_rollback_align_with_init_schema.sql
```

### Option 3: Using pgAdmin

1. Open pgAdmin at http://localhost:5050
2. Connect to `jsonbdb` database
3. Open Query Tool
4. Copy contents of `001_align_with_init_schema.sql`
5. Execute the script

## What the Migration Does

1. **Backs up existing data** - Renames `shipments` table to `shipments_old_backup`
2. **Creates new schema** - Creates new `shipments` table with correct columns
3. **Migrates data** - Attempts to migrate data from old to new schema:
   - Old records get tracking numbers like `MIGRATED-1`, `MIGRATED-2`, etc.
   - Origin/destination set to "Unknown" (update manually if needed)
   - Preserves `details` JSONB as `metadata`
4. **Inserts sample data** - Adds the 4 sample records from `init-db.sql`
5. **Creates indexes** - Adds performance indexes on `status` and `tracking_number`
6. **Restores foreign keys** - Re-creates the FK constraint from `deliveries` table

## Migration Safety

- ✅ **Transaction-wrapped** - All changes in a single transaction (atomic)
- ✅ **Idempotent** - Can run multiple times safely
- ✅ **Backup preserved** - Old data kept in `shipments_old_backup`
- ✅ **Rollback available** - Can revert using rollback script

## Post-Migration

After successful migration:

1. **Verify data**:
   ```sql
   SELECT COUNT(*) FROM shipments;
   SELECT COUNT(*) FROM shipments_old_backup;
   ```

2. **Update migrated records** (optional):
   ```sql
   -- Update migrated records with correct origins/destinations
   UPDATE shipments
   SET origin = 'Correct Origin',
       destination = 'Correct Destination'
   WHERE tracking_number LIKE 'MIGRATED-%';
   ```

3. **Drop backup** (after verification):
   ```sql
   DROP TABLE shipments_old_backup;
   ```

## Rollback

If you need to revert the migration:

```bash
# Using psql
psql -h localhost -p 5432 -U admin -d jsonbdb -f 001_rollback_align_with_init_schema.sql

# Or using pgAdmin Query Tool
```

⚠️ **Warning:** Rollback will lose any new shipments created after migration.

## Status

- ✅ drivers table - Already created with sample data
- ✅ vehicles table - Already created with sample data
- ✅ routes table - Already created with sample data
- ✅ deliveries table - Already created with sample data
- ✅ active_deliveries_view - Already created
- ⏳ shipments table - **Needs migration** (run this script)

## Testing the Migration

Before applying to production, test on a separate database:

```bash
# Create test database
psql -h localhost -p 5432 -U admin -c "CREATE DATABASE jsonbdb_test TEMPLATE jsonbdb"

# Apply migration to test database
psql -h localhost -p 5432 -U admin -d jsonbdb_test -f 001_align_with_init_schema.sql

# Verify results
psql -h localhost -p 5432 -U admin -d jsonbdb_test -c "\d shipments"
```
