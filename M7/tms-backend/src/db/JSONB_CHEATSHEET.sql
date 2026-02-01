-- ============================================================================
-- JSONB QUICK REFERENCE CHEATSHEET FOR TMS
-- ============================================================================

-- ============================================================================
-- 1. SHIPMENTS.metadata - Quick Examples
-- ============================================================================

-- Insert with metadata
INSERT INTO shipments (name, customer, origin, destination, status, driver_id, vehicle_id, metadata)
VALUES ('Order #1', 'Customer', 'Origin', 'Dest', 'pending', 1, 1, '{"notes": "Fragile items"}'::jsonb);

-- Find shipments requiring signature
SELECT id, name FROM shipments WHERE metadata @> '{"delivery_signature_required": true}';

-- Find shipments with special handling
SELECT id, name FROM shipments WHERE metadata->'special_handling' @> '["fragile"]'::jsonb;

-- Get custom field value
SELECT id, metadata->'custom_fields'->>'po_number' as po_number FROM shipments WHERE metadata ? 'custom_fields';

-- Update metadata field
UPDATE shipments SET metadata = jsonb_set(metadata, '{notes}', '"Updated notes"') WHERE id = 1;

-- Add to metadata
UPDATE shipments SET metadata = metadata || '{"new_field": "value"}'::jsonb WHERE id = 1;

-- ============================================================================
-- 2. DRIVERS.profile_data - Quick Examples
-- ============================================================================

-- Insert with profile data
INSERT INTO drivers (name, email, phone, status, license_number, hire_date, profile_data)
VALUES ('John', 'john@email.com', '555-1234', 'active', 'DL123', '2023-01-15', '{"certifications": ["cdl"]}'::jsonb);

-- Find drivers with specific certification
SELECT id, name FROM drivers WHERE profile_data->'certifications' @> '["hazmat"]'::jsonb;

-- Get certifications list
SELECT id, name, profile_data->'certifications' as certs FROM drivers;

-- Check if key exists
SELECT id, name FROM drivers WHERE profile_data ? 'emergency_contacts';

-- Get nested value
SELECT id, profile_data->'documents'->>'insurance_expiry' as insurance_exp FROM drivers;

-- Add certification
UPDATE drivers SET profile_data = jsonb_set(
  profile_data,
  '{certifications}',
  (profile_data->'certifications') || '["doubles"]'::jsonb
) WHERE id = 1;

-- Update nested document expiry
UPDATE drivers SET profile_data = jsonb_set(
  profile_data,
  '{documents,insurance_expiry}',
  '"2026-12-31"'
) WHERE id = 1;

-- ============================================================================
-- 3. VEHICLES.maintenance_history - Quick Examples
-- ============================================================================

-- Insert with maintenance history
INSERT INTO vehicles (plate_number, make, model, year, type, status, mileage, maintenance_history)
VALUES ('ABC-1234', 'Volvo', 'VNL', 2022, 'tractor', 'available', 45000,
  '[{"date": "2025-01-15", "type": "oil_change", "cost": 45.99}]'::jsonb);

-- Get all maintenance records
SELECT id, plate_number, maintenance_history FROM vehicles WHERE maintenance_history != '[]'::jsonb;

-- Get last maintenance record
SELECT id, plate_number, maintenance_history->>-1 as latest FROM vehicles;

-- Find all oil changes across vehicles
SELECT id, plate_number, jsonb_array_elements(maintenance_history) as record
FROM vehicles
WHERE jsonb_array_elements(maintenance_history)->>'type' = 'oil_change';

-- Count maintenance records per vehicle
SELECT id, plate_number, jsonb_array_length(maintenance_history) as record_count FROM vehicles;

-- Sum total maintenance cost
SELECT id, plate_number,
  SUM((elem->>'cost')::numeric) as total_cost
FROM vehicles,
  jsonb_array_elements(maintenance_history) as elem
GROUP BY id, plate_number;

-- Add new maintenance record
UPDATE vehicles SET maintenance_history = maintenance_history ||
  '[{"date": "2025-02-05", "type": "tire_rotation", "cost": 35.00}]'::jsonb
WHERE id = 1;

-- Find maintenance after specific date
SELECT id, plate_number, jsonb_array_elements(maintenance_history) as record
FROM vehicles
WHERE (jsonb_array_elements(maintenance_history)->>'date')::date > '2025-01-01';

-- ============================================================================
-- 4. USEFUL UTILITY QUERIES
-- ============================================================================

-- Check all JSONB columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('shipments', 'drivers', 'vehicles')
AND data_type = 'jsonb'
ORDER BY table_name, column_name;

-- Check JSONB indexes
SELECT indexrelname, indexdef
FROM pg_indexes
WHERE indexname LIKE 'idx_%metadata%' OR indexname LIKE 'idx_%profile%' OR indexname LIKE 'idx_%maintenance%';

-- Validate JSON (will error if invalid)
SELECT jsonb_valid('{"key": "value"}');

-- Pretty print JSONB
SELECT jsonb_pretty(metadata) FROM shipments WHERE id = 1;

-- Get all keys from JSONB object
SELECT id, jsonb_object_keys(metadata) as key FROM shipments WHERE id = 1;

-- Check JSONB column sizes
SELECT column_name, pg_size_pretty(pg_column_size(metadata)) as size
FROM shipments
WHERE id = 1;

-- ============================================================================
-- 5. COMMON ERROR FIXES
-- ============================================================================

-- ERROR: syntax error - Missing ::jsonb cast
-- WRONG: WHERE metadata @> '{"key": "value"}'
-- RIGHT: WHERE metadata @> '{"key": "value"}'::jsonb

-- ERROR: type mismatch - Converting text to numeric
-- WRONG: SELECT SUM(elem->>'cost') FROM ...
-- RIGHT: SELECT SUM((elem->>'cost')::numeric) FROM ...

-- ERROR: operator requires jsonb operands
-- WRONG: UPDATE table SET metadata = new_data
-- RIGHT: UPDATE table SET metadata = new_data::jsonb

-- ERROR: cannot extract element from object - Array expected
-- WRONG: SELECT metadata[0] FROM shipments
-- RIGHT: SELECT metadata->>0 FROM vehicles WHERE maintenance_history != '[]'::jsonb

-- ============================================================================
-- 6. MIGRATION STATUS CHECK
-- ============================================================================

-- Run this to verify all JSONB columns exist and are indexed:
SELECT
  t.tablename,
  c.column_name,
  c.data_type,
  idx.indexname
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.tablename
LEFT JOIN pg_indexes idx ON idx.tablename = t.tablename
  AND idx.indexname LIKE 'idx_' || t.tablename || '%'
WHERE c.data_type = 'jsonb'
  AND t.tableschema = 'public'
ORDER BY t.tablename, c.column_name;

-- Expected output: 3 rows (shipments.metadata, drivers.profile_data, vehicles.maintenance_history)
-- Each with corresponding GIN index
