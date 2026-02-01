-- Migration: Add JSONB Columns for Flexible Data Storage
-- Date: 2026-02-01
-- Description: Add JSONB columns to shipments, drivers, and vehicles tables for storing flexible metadata

-- ============================================================================
-- SHIPMENTS TABLE - Add metadata column for flexible shipment information
-- ============================================================================

ALTER TABLE shipments
ADD COLUMN metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN shipments.metadata IS 'Stores flexible shipment metadata such as pickup/delivery instructions, special handling requirements, custom fields, etc. Example: {"pickup_instructions": "Ring bell twice", "delivery_signature_required": true, "special_handling": ["fragile"], "custom_fields": {"po_number": "PO-123"}}';

-- Create GIN index for efficient JSONB queries on shipments
CREATE INDEX idx_shipments_metadata ON shipments USING GIN (metadata);
COMMENT ON INDEX idx_shipments_metadata IS 'GIN index for fast JSONB containment queries on shipment metadata';

-- ============================================================================
-- DRIVERS TABLE - Add profile_data column for variable driver information
-- ============================================================================

ALTER TABLE drivers
ADD COLUMN profile_data JSONB DEFAULT '{}';

COMMENT ON COLUMN drivers.profile_data IS 'Stores variable driver profile information such as certifications, emergency contacts, vehicle preferences, documents. Example: {"certifications": ["cdl", "hazmat"], "emergency_contacts": [{"name": "John", "phone": "555-1234"}], "vehicle_preferences": ["no_manual"], "documents": {"insurance_expiry": "2025-06-30"}}';

-- Create GIN index for efficient JSONB queries on drivers
CREATE INDEX idx_drivers_profile_data ON drivers USING GIN (profile_data);
COMMENT ON INDEX idx_drivers_profile_data IS 'GIN index for fast JSONB containment queries on driver profile data';

-- ============================================================================
-- VEHICLES TABLE - Add maintenance_history column for append-only logs
-- ============================================================================

ALTER TABLE vehicles
ADD COLUMN maintenance_history JSONB DEFAULT '[]';

COMMENT ON COLUMN vehicles.maintenance_history IS 'Stores vehicle maintenance logs as an array. Example: [{"date": "2025-01-15", "type": "oil_change", "cost": 45.99, "notes": "synthetic"}, {"date": "2025-01-20", "type": "tire_rotation", "cost": 35.00}]';

-- Create GIN index for efficient JSONB queries on vehicles
CREATE INDEX idx_vehicles_maintenance_history ON vehicles USING GIN (maintenance_history);
COMMENT ON INDEX idx_vehicles_maintenance_history IS 'GIN index for fast JSONB queries on vehicle maintenance history';

-- ============================================================================
-- SUMMARY OF CHANGES
-- ============================================================================
-- 3 new JSONB columns added:
--   - shipments.metadata (for flexible shipment info)
--   - drivers.profile_data (for variable driver info)
--   - vehicles.maintenance_history (for maintenance logs)
--
-- 3 new GIN indexes created for efficient JSONB queries
--
-- All columns default to empty objects/arrays for backward compatibility
-- ============================================================================
