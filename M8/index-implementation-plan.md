# Index Implementation Plan for TMS Database

## Overview
This document outlines a systematic approach to designing and implementing indexes based on query analysis, workload patterns, and PostgreSQL best practices.

---

## Phase 1: Pre-Implementation Analysis

### Step 1: Establish Baseline Metrics
**Objective**: Document current performance for comparison

**Actions**:
- [ ] Capture current query execution times
- [ ] Document current index usage statistics
- [ ] Record table sizes and row counts
- [ ] Note current disk usage

**Commands**:
```sql
-- Get table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_relation_size(schemaname||'.'||tablename) DESC;

-- Get current indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Baseline query performance
EXPLAIN (ANALYZE, BUFFERS) [your query here];
```

---

## Phase 2: Index Design Strategy

### Step 2: Categorize Indexes by Priority
**Objective**: Implement high-impact indexes first

#### Priority 1: Foreign Key Indexes (CRITICAL)
**Impact**: Affects ALL queries with JOINs
**Why First**: Missing FK indexes cause nested loop joins with sequential scans

```sql
-- deliveries table has 4 foreign keys without indexes
deliveries.shipment_id  -> shipments.id
deliveries.driver_id    -> drivers.id
deliveries.vehicle_id   -> vehicles.id
deliveries.route_id     -> routes.id
```

**Design Decision**:
- Single-column B-tree indexes (PostgreSQL default)
- No partial indexes needed (FK columns rarely NULL in business logic)

#### Priority 2: JSONB Indexes (CRITICAL)
**Impact**: Query 3 cost reduction from 689.96 to ~50-100
**Why Second**: Eliminates most expensive sequential scan

**Design Decisions**:
1. **GIN Index** (Generalized Inverted Index):
   - Best for `?` operator (key existence)
   - Handles multiple JSONB operations
   - Larger storage but faster queries

2. **Expression Index**:
   - Targets specific query pattern: `(metadata->>'value_eur')::DECIMAL > 500`
   - Pre-computes the expression
   - Smaller and faster for this specific use case

**Choice**: Implement BOTH
- GIN for general JSONB queries
- Expression index for high-value filtering (most common query)

#### Priority 3: Date/Time Indexes (HIGH)
**Impact**: Temporal queries with date ranges

**Design Decisions**:
- Partial indexes with `WHERE NOT NULL` to reduce size
- B-tree indexes for range queries (BETWEEN, >, <)

#### Priority 4: Composite Indexes (MEDIUM)
**Impact**: Queries filtering on multiple columns

**Design Decisions**:
- Column order matters: most selective first
- Only for proven query patterns
- Monitor for redundancy with existing indexes

### Step 3: Calculate Storage Impact
**Objective**: Ensure sufficient disk space

**Estimation Formula**:
- B-tree index ≈ 25-30% of indexed column size
- GIN index ≈ 50-100% of JSONB column size
- Composite index ≈ sum of column sizes × 0.3

**Mitigation**:
- Use partial indexes where applicable
- Monitor with `pg_relation_size()`

---

## Phase 3: Implementation

### Step 4: Create Indexes in Order

#### Batch 1: Foreign Key Indexes
**Timing**: Can be created concurrently without blocking

```sql
-- Create all FK indexes together
-- Use CONCURRENTLY in production to avoid table locks
CREATE INDEX CONCURRENTLY idx_deliveries_shipment_id ON deliveries(shipment_id);
CREATE INDEX CONCURRENTLY idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX CONCURRENTLY idx_deliveries_vehicle_id ON deliveries(vehicle_id);
CREATE INDEX CONCURRENTLY idx_deliveries_route_id ON deliveries(route_id);
```

**Expected Duration**: <1 second (small table)
**Lock Level**: None (CONCURRENTLY) or ShareLock (standard)

#### Batch 2: JSONB Indexes
**Timing**: More expensive, run separately

```sql
-- General JSONB index
CREATE INDEX CONCURRENTLY idx_shipments_metadata_gin
ON shipments USING GIN (metadata);

-- Expression index for high-value queries
CREATE INDEX CONCURRENTLY idx_shipments_high_value
ON shipments(((metadata->>'value_eur')::DECIMAL))
WHERE metadata ? 'value_eur'
  AND (metadata->>'value_eur')::DECIMAL > 500;
```

**Expected Duration**: 1-5 seconds (depends on data volume)
**Lock Level**: None (CONCURRENTLY)

#### Batch 3: Date/Time Indexes

```sql
CREATE INDEX CONCURRENTLY idx_deliveries_actual_arrival
ON deliveries(actual_arrival)
WHERE actual_arrival IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_vehicles_maintenance_date
ON vehicles(last_maintenance_date)
WHERE last_maintenance_date IS NOT NULL;
```

#### Batch 4: Composite Indexes

```sql
CREATE INDEX CONCURRENTLY idx_deliveries_status_arrival
ON deliveries(status, actual_arrival)
WHERE status = 'completed';

CREATE INDEX CONCURRENTLY idx_vehicles_status_maintenance
ON vehicles(status, last_maintenance_date)
WHERE status IN ('available', 'in_use');

CREATE INDEX CONCURRENTLY idx_shipments_status_metadata
ON shipments(status)
WHERE metadata ? 'value_eur';
```

### Step 5: Handle Failures
**Objective**: Know what to do if index creation fails

**Common Issues**:
1. **Out of disk space**:
   ```sql
   -- Check available space
   SELECT pg_size_pretty(pg_database_size(current_database()));
   ```

2. **Existing INVALID index**:
   ```sql
   -- Find invalid indexes
   SELECT indexname FROM pg_indexes
   WHERE schemaname = 'public' AND indexrelid IN (
       SELECT indexrelid FROM pg_index WHERE NOT indisvalid
   );

   -- Drop and recreate
   DROP INDEX CONCURRENTLY idx_name;
   ```

3. **Lock timeout**:
   ```sql
   -- Increase timeout
   SET lock_timeout = '10s';
   ```

---

## Phase 4: Verification

### Step 6: Verify Index Creation

```sql
-- Check all new indexes exist and are valid
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_scan,
    CASE
        WHEN idx_scan = 0 THEN 'Not yet used'
        ELSE 'Active'
    END as status
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify no invalid indexes
SELECT
    n.nspname as schema,
    c.relname as index_name,
    t.relname as table_name
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
JOIN pg_class t ON t.oid = i.indrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT i.indisvalid
  AND n.nspname = 'public';
```

### Step 7: Re-run Query Analysis

**Objective**: Measure actual performance improvement

```sql
-- For each of the 3 advanced queries:
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
[query here];
```

**Compare**:
- Total Cost (before vs after)
- Execution Time (before vs after)
- Sequential Scans (should be reduced/eliminated)
- Index Scans (should appear for new indexes)

### Step 8: Monitor Index Usage

**First 24 hours**:
```sql
-- Check if indexes are being used
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

**After 1 week**:
```sql
-- Identify unused indexes (candidates for removal)
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as wasted_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%pkey%'
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Phase 5: Optimization

### Step 9: Analyze and Update Statistics

**Objective**: Ensure query planner uses new indexes

```sql
-- Update statistics for affected tables
ANALYZE deliveries;
ANALYZE shipments;
ANALYZE vehicles;

-- Or analyze entire database
ANALYZE;
```

### Step 10: Test Query Performance

**Test each query**:
1. Clear cache for realistic test:
   ```sql
   -- In development only!
   DISCARD ALL;
   ```

2. Run query with ANALYZE:
   ```sql
   EXPLAIN (ANALYZE, BUFFERS, TIMING)
   [query here];
   ```

3. Document results in comparison table

---

## Phase 6: Maintenance Plan

### Step 11: Establish Monitoring

**Daily**:
- Check for bloated indexes: `pg_stat_user_indexes`
- Monitor query performance: slow query log

**Weekly**:
- Review index usage statistics
- Identify missing indexes from slow queries

**Monthly**:
- REINDEX CONCURRENTLY for fragmented indexes
- VACUUM ANALYZE for table statistics

**Monitoring Query**:
```sql
-- Index health check
WITH index_stats AS (
    SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_relation_size(indexrelid) as size_bytes,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
)
SELECT
    *,
    CASE
        WHEN idx_scan = 0 AND size_bytes > 1024*1024 THEN 'Consider dropping'
        WHEN idx_scan < 100 THEN 'Low usage'
        ELSE 'Good'
    END as recommendation
FROM index_stats
ORDER BY size_bytes DESC;
```

### Step 12: Document Index Strategy

**Create/Update**:
- Index naming convention
- When to add new indexes
- When to remove unused indexes
- Performance baseline document

---

## Decision Matrix

### Should I Add This Index?

| Criteria | Weight | Threshold |
|----------|--------|-----------|
| Query frequency | High | >100/day |
| Query cost reduction | High | >50% |
| Table size | Medium | >10K rows |
| Write frequency | Medium | <1000/min |
| Storage available | Medium | >2x index size |
| Maintenance window | Low | Can create CONCURRENTLY |

**Decision**: If 4+ criteria met → Add index

---

## Rollback Plan

### If Performance Degrades

**Step 1: Identify Problem Index**
```sql
-- Find recently created indexes
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY indexname DESC;
```

**Step 2: Drop Problem Index**
```sql
-- Drop without blocking queries
DROP INDEX CONCURRENTLY idx_problem_index;
```

**Step 3: Analyze Impact**
```sql
-- Re-run EXPLAIN to confirm query plan reverted
EXPLAIN (ANALYZE) [affected query];
```

**Step 4: Revise Strategy**
- Review query plan changes
- Consider alternative index design
- Test in staging environment

---

## Success Criteria

✅ All indexes created without errors
✅ No invalid indexes remain
✅ Query costs reduced by expected amounts
✅ Index usage statistics show active use
✅ No significant increase in write operation time
✅ Disk space within acceptable limits
✅ Query execution time meets SLA

---

## Implementation Checklist

### Pre-Implementation
- [ ] Backup database (if production)
- [ ] Check disk space
- [ ] Document baseline metrics
- [ ] Schedule maintenance window (if needed)
- [ ] Notify stakeholders

### Implementation
- [ ] Create FK indexes (Batch 1)
- [ ] Verify Batch 1 successful
- [ ] Create JSONB indexes (Batch 2)
- [ ] Verify Batch 2 successful
- [ ] Create date indexes (Batch 3)
- [ ] Verify Batch 3 successful
- [ ] Create composite indexes (Batch 4)
- [ ] Verify Batch 4 successful
- [ ] Run ANALYZE on all tables

### Post-Implementation
- [ ] Re-run EXPLAIN on all 3 queries
- [ ] Document performance improvements
- [ ] Monitor index usage for 24 hours
- [ ] Review slow query log
- [ ] Update documentation
- [ ] Close maintenance window

---

## Estimated Timeline

| Phase | Duration | Can Run In Parallel |
|-------|----------|---------------------|
| Phase 1: Baseline | 15 min | No |
| Phase 2: Design | 30 min | No |
| Phase 3: Implementation | 10 min | Yes (with CONCURRENTLY) |
| Phase 4: Verification | 20 min | No |
| Phase 5: Optimization | 15 min | No |
| **Total** | **~90 min** | |

**Note**: With CONCURRENTLY, queries continue running during index creation.

---

## Next Steps

1. ✅ Review this plan
2. ⏭️ Execute Phase 1 (Baseline Metrics)
3. ⏭️ Execute Phase 3 (Implementation)
4. ⏭️ Execute Phase 4 (Verification)
5. ⏭️ Document results
