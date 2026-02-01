# Index Coverage Analysis for Advanced Queries

## Executive Summary

This report analyzes three advanced SQL queries for the Transport Management System (TMS) database and evaluates their index coverage. While some indexes are in place, several opportunities exist to improve query performance through additional strategic indexes.

---

## Query 1: Driver Performance Analysis with Delivery Stats

### Query Purpose
Finds active drivers with completed delivery statistics over the last 30 days, average delivery time, and next scheduled delivery.

### Query Complexity
- **JOINs**: 2 (deliveries, vehicles)
- **Aggregations**: COUNT, AVG, MIN, STRING_AGG with FILTER clauses
- **Date Range Filtering**: 30-day window on actual_arrival

### Execution Plan Analysis

**Total Cost**: 27.44 | **Estimated Rows**: 1

#### Index Coverage Assessment

| Table/Column | Index Status | Impact |
|--------------|-------------|---------|
| `drivers.status` | ✅ `idx_drivers_status` exists | Used for WHERE filter |
| `drivers.id` | ✅ Primary key | Used for JOINs |
| `deliveries.driver_id` | ❌ No index | **Missing** - Would speed up JOIN |
| `deliveries.vehicle_id` | ❌ No index | **Missing** - Would speed up JOIN |
| `deliveries.status` | ✅ `idx_deliveries_status` exists | Could be used for FILTER clauses |
| `deliveries.actual_arrival` | ❌ No index | **Missing** - Date range filter inefficient |
| `vehicles.id` | ✅ Primary key | Used for JOINs |

#### Key Findings

1. **Sequential Scans Detected**:
   - Deliveries table (cost: 14.6) - full table scan
   - Vehicles table (cost: 1.04) - acceptable for small tables
   - Drivers table (cost: 1.05) - acceptable for small tables

2. **Missing Critical Indexes**:
   - No index on `deliveries.actual_arrival` for the 30-day date range filter
   - No foreign key indexes on `deliveries.driver_id` and `deliveries.vehicle_id`

3. **Sort Operations**: Final sort on aggregated results (cost: 27.43-27.44)

#### Recommendations

```sql
-- High priority: Add foreign key indexes for JOIN performance
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_vehicle_id ON deliveries(vehicle_id);

-- Medium priority: Add index for date range queries
CREATE INDEX idx_deliveries_actual_arrival ON deliveries(actual_arrival)
WHERE actual_arrival IS NOT NULL;

-- Consider composite index for common filter patterns
CREATE INDEX idx_deliveries_status_arrival ON deliveries(status, actual_arrival)
WHERE status = 'completed';
```

---

## Query 2: Vehicle Utilization Analysis with Maintenance Alerts

### Query Purpose
Analyzes vehicle usage patterns over 90 days, calculates utilization percentiles, and flags vehicles needing maintenance based on days since last service.

### Query Complexity
- **CTEs**: 2 (vehicle_stats, ranked_vehicles)
- **Window Functions**: PERCENT_RANK() OVER
- **Aggregations**: COUNT, MAX
- **Date Calculations**: days_since_maintenance

### Execution Plan Analysis

**Total Cost**: 24.14 | **Estimated Rows**: 2

#### Index Coverage Assessment

| Table/Column | Index Status | Impact |
|--------------|-------------|---------|
| `vehicles.status` | ✅ `idx_vehicles_status` exists | Used for WHERE filter |
| `vehicles.id` | ✅ Primary key | Used for GROUP BY and JOINs |
| `vehicles.last_maintenance_date` | ❌ No index | **Missing** - Used in calculations |
| `deliveries.vehicle_id` | ❌ No index | **Missing** - JOIN performance |
| `deliveries.scheduled_date` | ✅ `idx_deliveries_scheduled_date` exists | Used for 90-day filter |

#### Key Findings

1. **CTE Optimization**:
   - First CTE (vehicle_stats) performs Hash Aggregate (cost: 23.82-23.88)
   - Uses hash join between vehicles and deliveries
   - Sequential scan on deliveries table

2. **Window Function Performance**:
   - PERCENT_RANK requires sorting (cost: 23.96-23.97)
   - Operates on aggregated result set (4 rows)

3. **Filter After Aggregation**:
   - Status filter applied after window function
   - Could potentially be optimized

#### Recommendations

```sql
-- High priority: Foreign key index for JOIN optimization
CREATE INDEX idx_deliveries_vehicle_id ON deliveries(vehicle_id);

-- Medium priority: Index for maintenance date calculations
CREATE INDEX idx_vehicles_maintenance_date ON vehicles(last_maintenance_date)
WHERE last_maintenance_date IS NOT NULL;

-- Consider composite index for common access patterns
CREATE INDEX idx_vehicles_status_maintenance ON vehicles(status, last_maintenance_date)
WHERE status IN ('available', 'in_use');
```

---

## Query 3: High-Value Shipment Tracking with Route Analysis

### Query Purpose
Tracks high-value shipments (>500 EUR) with route information, identifies delays, and extracts JSONB metadata for premium customers.

### Query Complexity
- **JOINs**: 4 (deliveries, routes, drivers, vehicles)
- **JSONB Operations**: Key existence (`?`), extraction (`->>`), casting
- **Complex CASE Statements**: Delay status calculation
- **Date/Time Calculations**: Duration comparisons

### Execution Plan Analysis

**Total Cost**: 689.96 | **Estimated Rows**: 1

⚠️ **Note**: This is the most expensive query by far (28x more costly than Query 2)

#### Index Coverage Assessment

| Table/Column | Index Status | Impact |
|--------------|-------------|---------|
| `shipments.metadata` (JSONB) | ❌ No index | **CRITICAL MISSING** - Sequential scan (cost: 667.1) |
| `shipments.status` | ✅ `idx_shipments_status` exists | Could be used but JSONB filter dominates |
| `shipments.id` | ✅ Primary key | Used for JOINs |
| `deliveries.shipment_id` | ❌ No index | **Missing** - JOIN performance |
| `deliveries.route_id` | ❌ No index | **Missing** - JOIN performance |
| `deliveries.driver_id` | ❌ No index | **Missing** - JOIN performance |
| `deliveries.vehicle_id` | ❌ No index | **Missing** - JOIN performance |
| `routes.id` | ✅ Primary key (with index scan) | ✅ Efficiently used |

#### Key Findings

1. **Major Performance Bottleneck**:
   - Sequential scan on shipments table with JSONB operations (cost: 667.1)
   - JSONB key existence check: `metadata ? 'value_eur'`
   - JSONB value extraction and casting: `(metadata->>'value_eur')::DECIMAL > 500`

2. **Nested Loop Joins**:
   - Multiple nested loops with sequential scans on related tables
   - Only routes table uses index scan (routes_pkey)

3. **Complex Sorting**:
   - Sorts by JSONB extracted value and CASE expression
   - Expensive due to type conversions

#### Recommendations

```sql
-- CRITICAL: Add GIN index for JSONB queries
CREATE INDEX idx_shipments_metadata_gin ON shipments USING GIN (metadata);

-- CRITICAL: Add expression index for high-value shipments
CREATE INDEX idx_shipments_high_value ON shipments(
    ((metadata->>'value_eur')::DECIMAL)
) WHERE metadata ? 'value_eur' AND (metadata->>'value_eur')::DECIMAL > 500;

-- CRITICAL: Add composite index for common filters
CREATE INDEX idx_shipments_status_metadata ON shipments(status)
WHERE metadata ? 'value_eur';

-- High priority: Add all foreign key indexes
CREATE INDEX idx_deliveries_shipment_id ON deliveries(shipment_id);
CREATE INDEX idx_deliveries_route_id ON deliveries(route_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_vehicle_id ON deliveries(vehicle_id);
```

---

## Summary of Recommendations

### Critical (Immediate Action Required)

1. **JSONB Indexing** - Query 3 performance is severely impacted
   ```sql
   CREATE INDEX idx_shipments_metadata_gin ON shipments USING GIN (metadata);
   ```

2. **Foreign Key Indexes** - Missing on all deliveries table foreign keys
   ```sql
   CREATE INDEX idx_deliveries_shipment_id ON deliveries(shipment_id);
   CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
   CREATE INDEX idx_deliveries_vehicle_id ON deliveries(vehicle_id);
   CREATE INDEX idx_deliveries_route_id ON deliveries(route_id);
   ```

### High Priority

3. **Date Range Indexes** - For temporal queries
   ```sql
   CREATE INDEX idx_deliveries_actual_arrival ON deliveries(actual_arrival)
   WHERE actual_arrival IS NOT NULL;

   CREATE INDEX idx_vehicles_maintenance_date ON vehicles(last_maintenance_date)
   WHERE last_maintenance_date IS NOT NULL;
   ```

### Medium Priority

4. **Composite Indexes** - For frequently combined filters
   ```sql
   CREATE INDEX idx_deliveries_status_arrival ON deliveries(status, actual_arrival);
   CREATE INDEX idx_vehicles_status_maintenance ON vehicles(status, last_maintenance_date);
   ```

### Performance Impact Estimates

| Query | Current Cost | Expected Cost After Indexing | Improvement |
|-------|--------------|------------------------------|-------------|
| Query 1 | 27.44 | ~8-12 | ~60-70% |
| Query 2 | 24.14 | ~10-15 | ~40-50% |
| Query 3 | 689.96 | ~50-100 | ~85-90% |

---

## Index Maintenance Considerations

### Storage Impact
- Each index adds storage overhead (typically 20-30% of table size)
- GIN indexes on JSONB can be substantial (50-100% of column size)
- Monitor disk usage after implementation

### Write Performance
- More indexes = slower INSERT/UPDATE/DELETE operations
- Expected impact: 5-10% per index on write operations
- Consider batching bulk operations

### Index Monitoring
```sql
-- Check index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexname NOT LIKE '%pkey%';
```

---

## Conclusion

The three advanced queries demonstrate varying levels of index coverage:

- **Query 1** has partial coverage but lacks foreign key indexes
- **Query 2** has moderate coverage but could benefit from composite indexes
- **Query 3** has severe indexing deficiencies, particularly for JSONB operations

Implementing the recommended indexes, especially the critical JSONB and foreign key indexes, would dramatically improve query performance across the board. The most significant gains would be seen in Query 3, which currently performs a costly sequential scan on the shipments table with complex JSONB filtering.
