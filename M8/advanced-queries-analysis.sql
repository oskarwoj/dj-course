-- ============================================================================
-- ADVANCED QUERY 1: Driver Performance Analysis with Delivery Stats
-- ============================================================================
-- Purpose: Find active drivers with their completed deliveries in the last 30 days,
-- average delivery time, and next scheduled delivery

SELECT
    d.id,
    d.name,
    d.email,
    COUNT(del.id) FILTER (WHERE del.status = 'completed'
                          AND del.actual_arrival >= CURRENT_DATE - INTERVAL '30 days') as completed_deliveries_30d,
    AVG(EXTRACT(EPOCH FROM (del.actual_arrival - del.actual_departure)) / 3600)
        FILTER (WHERE del.status = 'completed' AND del.actual_arrival IS NOT NULL) as avg_delivery_hours,
    MIN(del.scheduled_date) FILTER (WHERE del.status IN ('scheduled', 'in_progress')
                                    AND del.scheduled_date >= CURRENT_DATE) as next_delivery_date,
    STRING_AGG(DISTINCT v.model, ', ') FILTER (WHERE del.status = 'in_progress') as current_vehicles
FROM drivers d
LEFT JOIN deliveries del ON d.id = del.driver_id
LEFT JOIN vehicles v ON del.vehicle_id = v.id
WHERE d.status = 'active'
GROUP BY d.id, d.name, d.email
HAVING COUNT(del.id) FILTER (WHERE del.status = 'completed'
                              AND del.actual_arrival >= CURRENT_DATE - INTERVAL '30 days') > 0
ORDER BY completed_deliveries_30d DESC, avg_delivery_hours ASC;


-- ============================================================================
-- ADVANCED QUERY 2: Vehicle Utilization Analysis with Maintenance Alerts
-- ============================================================================
-- Purpose: Analyze vehicle usage patterns, identify underutilized vehicles,
-- and flag those needing maintenance

WITH vehicle_stats AS (
    SELECT
        v.id,
        v.plate_number,
        v.model,
        v.status,
        v.last_maintenance_date,
        v.fuel_type,
        COUNT(del.id) as total_deliveries,
        COUNT(del.id) FILTER (WHERE del.scheduled_date >= CURRENT_DATE - INTERVAL '90 days') as deliveries_90d,
        MAX(del.actual_arrival) as last_delivery_date,
        CURRENT_DATE - v.last_maintenance_date as days_since_maintenance
    FROM vehicles v
    LEFT JOIN deliveries del ON v.id = del.vehicle_id
    GROUP BY v.id, v.plate_number, v.model, v.status, v.last_maintenance_date, v.fuel_type
),
ranked_vehicles AS (
    SELECT
        *,
        PERCENT_RANK() OVER (ORDER BY deliveries_90d) as utilization_percentile,
        CASE
            WHEN days_since_maintenance > 180 THEN 'URGENT'
            WHEN days_since_maintenance > 90 THEN 'SOON'
            ELSE 'OK'
        END as maintenance_status
    FROM vehicle_stats
)
SELECT
    plate_number,
    model,
    status,
    fuel_type,
    deliveries_90d,
    CAST(ROUND(CAST(utilization_percentile AS NUMERIC) * 100, 2) AS NUMERIC) as utilization_percentile,
    days_since_maintenance,
    maintenance_status,
    last_delivery_date
FROM ranked_vehicles
WHERE status IN ('available', 'in_use')
ORDER BY
    CASE maintenance_status WHEN 'URGENT' THEN 1 WHEN 'SOON' THEN 2 ELSE 3 END,
    utilization_percentile ASC;


-- ============================================================================
-- ADVANCED QUERY 3: High-Value Shipment Tracking with Route Analysis
-- ============================================================================
-- Purpose: Track high-value shipments with route information, identify delays,
-- and extract metadata for premium customers

SELECT
    s.tracking_number,
    s.origin,
    s.destination,
    s.priority,
    (s.metadata->>'value_eur')::DECIMAL as shipment_value,
    s.metadata->>'customer' as customer_name,
    s.metadata->'tags' as tags,
    del.status as delivery_status,
    del.scheduled_date,
    r.distance_km,
    r.estimated_duration_hours,
    CASE
        WHEN del.actual_arrival IS NOT NULL THEN
            EXTRACT(EPOCH FROM (del.actual_arrival - del.actual_departure)) / 3600
        ELSE NULL
    END as actual_duration_hours,
    CASE
        WHEN del.status = 'scheduled' AND del.scheduled_date < CURRENT_DATE THEN 'OVERDUE'
        WHEN del.status = 'in_progress' AND del.actual_departure IS NOT NULL
             AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - del.actual_departure)) / 3600 > r.estimated_duration_hours * 1.2 THEN 'DELAYED'
        ELSE 'ON_TRACK'
    END as delay_status,
    d.name as driver_name,
    v.plate_number
FROM shipments s
JOIN deliveries del ON s.id = del.shipment_id
LEFT JOIN routes r ON del.route_id = r.id
LEFT JOIN drivers d ON del.driver_id = d.id
LEFT JOIN vehicles v ON del.vehicle_id = v.id
WHERE
    s.metadata ? 'value_eur'
    AND (s.metadata->>'value_eur')::DECIMAL > 500
    AND s.status IN ('pending', 'in_transit')
ORDER BY
    (s.metadata->>'value_eur')::DECIMAL DESC,
    CASE del.status WHEN 'in_progress' THEN 1 WHEN 'scheduled' THEN 2 ELSE 3 END;
