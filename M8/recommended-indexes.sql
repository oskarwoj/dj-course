-- ============================================================================
-- RECOMMENDED INDEXES FOR TMS DATABASE
-- Based on analysis of advanced queries
-- ============================================================================

-- ============================================================================
-- CRITICAL PRIORITY - Implement immediately for significant performance gains
-- ============================================================================

-- JSONB indexing for high-value shipment queries
CREATE INDEX IF NOT EXISTS idx_shipments_metadata_gin
ON shipments USING GIN (metadata);

-- Foreign key indexes for deliveries table (improves all JOINs)
CREATE INDEX IF NOT EXISTS idx_deliveries_shipment_id
ON deliveries(shipment_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id
ON deliveries(driver_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle_id
ON deliveries(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_route_id
ON deliveries(route_id);


-- ============================================================================
-- HIGH PRIORITY - Significant impact on temporal queries
-- ============================================================================

-- Date range indexes for delivery tracking
CREATE INDEX IF NOT EXISTS idx_deliveries_actual_arrival
ON deliveries(actual_arrival)
WHERE actual_arrival IS NOT NULL;

-- Maintenance date index for vehicle management
CREATE INDEX IF NOT EXISTS idx_vehicles_maintenance_date
ON vehicles(last_maintenance_date)
WHERE last_maintenance_date IS NOT NULL;


-- ============================================================================
-- MEDIUM PRIORITY - Composite indexes for common query patterns
-- ============================================================================

-- Completed deliveries with arrival date
CREATE INDEX IF NOT EXISTS idx_deliveries_status_arrival
ON deliveries(status, actual_arrival)
WHERE status = 'completed';

-- Available/in-use vehicles with maintenance status
CREATE INDEX IF NOT EXISTS idx_vehicles_status_maintenance
ON vehicles(status, last_maintenance_date)
WHERE status IN ('available', 'in_use');

-- Shipments with metadata for high-value tracking
CREATE INDEX IF NOT EXISTS idx_shipments_status_metadata
ON shipments(status)
WHERE metadata ? 'value_eur';


-- ============================================================================
-- ADVANCED - Expression index for high-value shipment filtering
-- ============================================================================

-- Expression index for high-value shipments (>500 EUR)
-- This dramatically speeds up queries filtering by metadata value
CREATE INDEX IF NOT EXISTS idx_shipments_high_value
ON shipments(((metadata->>'value_eur')::DECIMAL))
WHERE metadata ? 'value_eur'
  AND (metadata->>'value_eur')::DECIMAL > 500;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check index creation and size
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Monitor index usage after implementation
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY idx_scan ASC;
