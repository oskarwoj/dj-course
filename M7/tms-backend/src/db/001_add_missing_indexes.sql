-- Migration: Add Missing Indexes for Performance Optimization
-- Date: 2026-02-01
-- Description: Add indexes on ORDER BY and composite columns for query optimization

-- 1. Indexes for ORDER BY operations (High Priority)
-- These indexes optimize the full table scans with sorting in the application

CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);
COMMENT ON INDEX idx_shipments_created_at IS 'Optimizes GET /api/shipments endpoint which sorts by created_at DESC';

CREATE INDEX idx_drivers_name ON drivers(name);
COMMENT ON INDEX idx_drivers_name IS 'Optimizes GET /api/drivers endpoint which sorts by name';

CREATE INDEX idx_vehicles_plate_number ON vehicles(plate_number);
COMMENT ON INDEX idx_vehicles_plate_number IS 'Optimizes GET /api/vehicles endpoint which sorts by plate_number';

-- 2. Composite Indexes (Medium Priority)
-- These indexes optimize JOIN + filter operations and GROUP BY queries

CREATE INDEX idx_drivers_status_hire_date ON drivers(status, hire_date);
COMMENT ON INDEX idx_drivers_status_hire_date IS 'Optimizes queries filtering by status and hire_date';

CREATE INDEX idx_shipments_status_driver_id ON shipments(status, driver_id);
COMMENT ON INDEX idx_shipments_status_driver_id IS 'Optimizes JOIN and filter operations on shipments by status and driver';

CREATE INDEX idx_shipments_status_vehicle_id ON shipments(status, vehicle_id);
COMMENT ON INDEX idx_shipments_status_vehicle_id IS 'Optimizes JOIN and filter operations on shipments by status and vehicle';

-- Summary of indexes created:
-- - 3 indexes for ORDER BY operations (created_at, name, plate_number)
-- - 3 composite indexes for JOIN + filter operations
-- Total: 6 new indexes added
