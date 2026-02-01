--------------------------------------------------------------------------------
-- Fleet Size Range Query - Carriers Filtering
-- Query to filter carriers by fleet size range (from-to scope)
--------------------------------------------------------------------------------

-- ✅ RECOMMENDED QUERY PATTERNS:

-- Pattern 1: Using BETWEEN (inclusive range)
SELECT 
    id,
    company_name,
    fleet_size,
    contract_period,
    region_code
FROM carriers
WHERE fleet_size BETWEEN 50 AND 100  -- fleet_size >= 50 AND fleet_size <= 100
ORDER BY fleet_size;

-- Pattern 2: Using explicit >= and <= (same as BETWEEN)
SELECT 
    id,
    company_name,
    fleet_size
FROM carriers
WHERE fleet_size >= 50 AND fleet_size <= 100
ORDER BY fleet_size;

-- Pattern 3: Using > and < (exclusive range)
SELECT 
    id,
    company_name,
    fleet_size
FROM carriers
WHERE fleet_size > 50 AND fleet_size < 100
ORDER BY fleet_size;

-- Pattern 4: Single boundary (minimum fleet size)
SELECT 
    id,
    company_name,
    fleet_size
FROM carriers
WHERE fleet_size >= 100
ORDER BY fleet_size;

-- Pattern 5: Single boundary (maximum fleet size)
SELECT 
    id,
    company_name,
    fleet_size
FROM carriers
WHERE fleet_size <= 50
ORDER BY fleet_size;

--------------------------------------------------------------------------------
-- INDEX CREATED FOR OPTIMAL PERFORMANCE
--------------------------------------------------------------------------------

-- B-tree index on fleet_size column
CREATE INDEX IF NOT EXISTS idx_carriers_fleet_size 
ON carriers(fleet_size);

-- Update statistics after index creation
ANALYZE carriers;

--------------------------------------------------------------------------------
-- PERFORMANCE ANALYSIS
--------------------------------------------------------------------------------

-- Check query execution plan
EXPLAIN ANALYZE
SELECT * FROM carriers 
WHERE fleet_size BETWEEN 50 AND 100;

-- For highly selective queries (small ranges), PostgreSQL will use:
-- ✅ Bitmap Index Scan on idx_carriers_fleet_size
-- ✅ Bitmap Heap Scan on carriers

-- For low selectivity queries (large ranges), PostgreSQL may use:
-- ⚠️ Sequential Scan (when index overhead > sequential scan cost)
-- This is normal and expected behavior - PostgreSQL's planner chooses the most efficient method

-- Example: Highly selective query (uses index)
EXPLAIN ANALYZE
SELECT * FROM carriers 
WHERE fleet_size BETWEEN 10 AND 20;  -- ~6.9% of rows

-- Example: Low selectivity query (may use sequential scan)
EXPLAIN ANALYZE
SELECT * FROM carriers 
WHERE fleet_size BETWEEN 50 AND 100;  -- ~26.6% of rows

--------------------------------------------------------------------------------
-- TABLE STATISTICS
--------------------------------------------------------------------------------

-- Check fleet size distribution
SELECT 
    COUNT(*) as total_carriers,
    MIN(fleet_size) as min_fleet_size,
    MAX(fleet_size) as max_fleet_size,
    AVG(fleet_size)::INT as avg_fleet_size,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fleet_size)::INT as median_fleet_size
FROM carriers;

-- Fleet size distribution by ranges
SELECT 
    CASE 
        WHEN fleet_size < 50 THEN 'Small (10-49)'
        WHEN fleet_size BETWEEN 50 AND 100 THEN 'Medium (50-100)'
        WHEN fleet_size BETWEEN 101 AND 150 THEN 'Large (101-150)'
        ELSE 'Very Large (151+)'
    END as fleet_category,
    COUNT(*) as carrier_count,
    AVG(fleet_size)::INT as avg_fleet_size
FROM carriers
GROUP BY fleet_category
ORDER BY MIN(fleet_size);

--------------------------------------------------------------------------------
-- VERIFY INDEX EXISTS
--------------------------------------------------------------------------------

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'carriers' 
AND indexname = 'idx_carriers_fleet_size';
