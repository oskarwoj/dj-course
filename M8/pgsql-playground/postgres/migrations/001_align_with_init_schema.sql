-- Migration Script: Align Database with init-db.sql
-- Generated: 2026-01-29
-- Purpose: Transform existing shipments table to match expected schema

-- ============================================================================
-- STEP 1: Backup and prepare for migration
-- ============================================================================

BEGIN;

-- Check if migration has already been applied
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'shipments'
        AND column_name = 'tracking_number'
    ) THEN
        RAISE NOTICE 'Migration already applied - shipments table has tracking_number column';
        ROLLBACK;
        RETURN;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Handle deliveries table foreign key constraint
-- ============================================================================

-- Drop foreign key constraint from deliveries to shipments (will recreate later)
ALTER TABLE deliveries
    DROP CONSTRAINT IF EXISTS deliveries_shipment_id_fkey;

-- ============================================================================
-- STEP 3: Backup old shipments table
-- ============================================================================

-- Rename old shipments table to preserve data
ALTER TABLE shipments RENAME TO shipments_old_backup;

-- Rename the sequence
ALTER SEQUENCE shipments_id_seq RENAME TO shipments_old_backup_id_seq;

-- ============================================================================
-- STEP 4: Create new shipments table with correct schema
-- ============================================================================

CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    weight_kg DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'standard' CHECK (priority IN ('standard', 'express', 'urgent')),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 5: Migrate data from old shipments to new (if possible)
-- ============================================================================

-- Attempt to migrate data from old schema to new schema
-- Note: This mapping is approximate since schemas are quite different
INSERT INTO shipments (id, tracking_number, origin, destination, weight_kg, status, priority, metadata, created_at)
SELECT
    id,
    'MIGRATED-' || id::TEXT as tracking_number,  -- Generate tracking number from ID
    'Unknown' as origin,                          -- Default origin
    'Unknown' as destination,                     -- Default destination
    weight_kg,
    'pending' as status,                          -- Default status
    'standard' as priority,                       -- Default priority
    details as metadata,                          -- Preserve JSONB details as metadata
    NOW() as created_at
FROM shipments_old_backup;

-- Update sequence to continue from max ID
SELECT setval('shipments_id_seq', COALESCE((SELECT MAX(id) FROM shipments), 1), true);

-- ============================================================================
-- STEP 6: Insert sample data from init-db.sql
-- ============================================================================

-- Insert the expected sample data (will skip if tracking numbers already exist)
INSERT INTO shipments (tracking_number, origin, destination, weight_kg, status, priority, metadata) VALUES
('PL12345', 'Warszawa', 'Berlin', 15.5, 'in_transit', 'express',
    '{"tags": ["fragile", "express"], "customer": "ABC Corp", "value_eur": 500}'),
('DE67890', 'Hamburg', 'Kraków', 2.0, 'delivered', 'standard',
    '{"tags": ["standard"], "customer": "XYZ Ltd", "value_eur": 100}'),
('PL11111', 'Gdańsk', 'Wien', 25.0, 'pending', 'urgent',
    '{"tags": ["urgent", "perishable"], "customer": "Fresh Foods Inc", "value_eur": 1200}'),
('DE22222', 'Berlin', 'Warszawa', 10.5, 'pending', 'standard',
    '{"tags": ["standard"], "customer": "Tech Solutions", "value_eur": 800}')
ON CONFLICT (tracking_number) DO NOTHING;

-- ============================================================================
-- STEP 7: Create indexes on shipments table
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);

-- ============================================================================
-- STEP 8: Restore foreign key constraint on deliveries
-- ============================================================================

-- Re-create the foreign key constraint
ALTER TABLE deliveries
    ADD CONSTRAINT deliveries_shipment_id_fkey
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 9: Verify migration
-- ============================================================================

-- Display migration summary
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM shipments_old_backup;
    SELECT COUNT(*) INTO new_count FROM shipments;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Old shipments table rows: %', old_count;
    RAISE NOTICE 'New shipments table rows: %', new_count;
    RAISE NOTICE 'Backup table: shipments_old_backup';
    RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================================================
-- Post-Migration Notes:
-- ============================================================================
--
-- 1. Old data is preserved in 'shipments_old_backup' table
-- 2. Migrated records have tracking numbers like 'MIGRATED-1', 'MIGRATED-2', etc.
-- 3. Sample data from init-db.sql has been inserted with original tracking numbers
-- 4. To drop the backup table after verification:
--    DROP TABLE shipments_old_backup;
--
-- 5. The following tables from init-db.sql were already created:
--    - drivers (with 4 sample records)
--    - vehicles (with 4 sample records)
--    - routes (with 4 sample records)
--    - deliveries (with 4 sample records)
--    - active_deliveries_view (view)
--
-- ============================================================================
