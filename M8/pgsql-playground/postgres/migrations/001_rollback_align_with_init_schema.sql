-- Rollback Script: Revert migration to restore original shipments table
-- Generated: 2026-01-29
-- Purpose: Restore the original shipments table from backup

-- ============================================================================
-- ROLLBACK MIGRATION
-- ============================================================================

BEGIN;

-- Check if backup table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'shipments_old_backup'
    ) THEN
        RAISE EXCEPTION 'Backup table shipments_old_backup does not exist. Cannot rollback.';
    END IF;
END $$;

-- ============================================================================
-- STEP 1: Drop foreign key constraint from deliveries
-- ============================================================================

ALTER TABLE deliveries
    DROP CONSTRAINT IF EXISTS deliveries_shipment_id_fkey;

-- ============================================================================
-- STEP 2: Drop the new shipments table
-- ============================================================================

DROP TABLE IF EXISTS shipments CASCADE;

-- ============================================================================
-- STEP 3: Restore old shipments table
-- ============================================================================

ALTER TABLE shipments_old_backup RENAME TO shipments;
ALTER SEQUENCE shipments_old_backup_id_seq RENAME TO shipments_id_seq;

-- ============================================================================
-- STEP 4: Restore foreign key constraint on deliveries
-- ============================================================================

-- Note: This will fail if deliveries reference shipment IDs that don't exist
-- You may need to clean up deliveries table first
ALTER TABLE deliveries
    ADD CONSTRAINT deliveries_shipment_id_fkey
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 5: Verify rollback
-- ============================================================================

DO $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count FROM shipments;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Rollback Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Restored shipments table rows: %', count;
    RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================================================
-- Post-Rollback Notes:
-- ============================================================================
--
-- The original shipments table has been restored with columns:
-- - id
-- - carrier_id
-- - weight_kg
-- - details (JSONB)
--
-- ============================================================================
