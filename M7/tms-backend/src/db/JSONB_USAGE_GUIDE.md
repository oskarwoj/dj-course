# JSONB Migration & Usage Guide

## Running the Migration in pgAdmin

### Step 1: Open pgAdmin
1. Navigate to your PostgreSQL database in pgAdmin
2. Right-click on `tms_db` database
3. Select **Query Tool**

### Step 2: Copy & Paste Migration
1. Open the file: `src/db/002_add_jsonb_columns.sql`
2. Copy the entire contents
3. Paste into the pgAdmin Query Tool
4. Click **Execute** (or press Ctrl+Enter)

### Step 3: Verify Success
Run this query to confirm all columns were added:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('shipments', 'drivers', 'vehicles')
AND data_type = 'jsonb'
ORDER BY table_name, column_name;
```

Expected result: 3 JSONB columns

---

## JSONB Column Usage Examples

### 1. SHIPMENTS - metadata Column

#### Insert with metadata:
```sql
INSERT INTO shipments (name, customer, origin, destination, status, driver_id, vehicle_id, metadata)
VALUES (
  'Order #001',
  'Acme Corp',
  'New York',
  'Boston',
  'pending',
  1,
  1,
  '{
    "pickup_instructions": "Ring bell twice, ask for John",
    "delivery_signature_required": true,
    "special_handling": ["fragile", "temperature-controlled"],
    "estimated_weight_kg": 50,
    "custom_fields": {
      "po_number": "PO-2025-001",
      "internal_reference": "REF-123"
    }
  }'::jsonb
);
```

#### Query by metadata (containment operator @>):
```sql
-- Find all shipments requiring signature
SELECT id, name, customer, metadata
FROM shipments
WHERE metadata @> '{"delivery_signature_required": true}';

-- Find shipments with fragile items
SELECT id, name, metadata
FROM shipments
WHERE metadata @> '{"special_handling": ["fragile"]}';

-- Find shipments with specific PO number
SELECT id, name, metadata
FROM shipments
WHERE metadata -> 'custom_fields' ->> 'po_number' = 'PO-2025-001';
```

#### Update metadata:
```sql
-- Add pickup instructions to existing shipment
UPDATE shipments
SET metadata = jsonb_set(metadata, '{pickup_instructions}', '"New pickup instructions"')
WHERE id = 1;

-- Append to special_handling array
UPDATE shipments
SET metadata = jsonb_set(
  metadata,
  '{special_handling}',
  (metadata->'special_handling') || '["urgent"]'::jsonb
)
WHERE id = 1;

-- Merge new metadata (overwrites existing fields)
UPDATE shipments
SET metadata = metadata || '{"new_field": "value"}'::jsonb
WHERE id = 1;
```

---

### 2. DRIVERS - profile_data Column

#### Insert with profile data:
```sql
INSERT INTO drivers (name, email, phone, status, license_number, hire_date, profile_data)
VALUES (
  'John Doe',
  'john@example.com',
  '555-1234',
  'active',
  'DL123456',
  '2023-01-15',
  '{
    "certifications": ["cdl", "hazmat", "doubles"],
    "emergency_contacts": [
      {"name": "Jane Doe", "phone": "555-5678", "relationship": "spouse"},
      {"name": "Bob Smith", "phone": "555-9999", "relationship": "parent"}
    ],
    "vehicle_preferences": ["no_manual", "preferred_color_white"],
    "documents": {
      "insurance_expiry": "2025-06-30",
      "medical_clearance_expiry": "2025-12-31"
    },
    "notes": "Excellent safety record"
  }'::jsonb
);
```

#### Query driver certifications:
```sql
-- Find all drivers with HAZMAT certification
SELECT id, name, profile_data->'certifications' as certifications
FROM drivers
WHERE profile_data->'certifications' @> '["hazmat"]';

-- Find drivers by emergency contact name
SELECT id, name, profile_data->'emergency_contacts' as contacts
FROM drivers
WHERE profile_data @> '{"emergency_contacts": [{"name": "Jane Doe"}]}';

-- Find drivers with expired insurance
SELECT id, name,
  profile_data->'documents'->>'insurance_expiry' as expiry_date
FROM drivers
WHERE (profile_data->'documents'->>'insurance_expiry')::date < CURRENT_DATE;
```

#### Update driver profile:
```sql
-- Add new certification
UPDATE drivers
SET profile_data = jsonb_set(
  profile_data,
  '{certifications}',
  (profile_data->'certifications') || '["tanker"]'::jsonb
)
WHERE id = 1;

-- Update document expiry
UPDATE drivers
SET profile_data = jsonb_set(
  profile_data,
  '{documents,insurance_expiry}',
  '"2026-06-30"'
)
WHERE id = 1;

-- Add new emergency contact
UPDATE drivers
SET profile_data = jsonb_set(
  profile_data,
  '{emergency_contacts}',
  (profile_data->'emergency_contacts') || '[{"name": "New Contact", "phone": "555-0000", "relationship": "sibling"}]'::jsonb
)
WHERE id = 1;
```

---

### 3. VEHICLES - maintenance_history Column

#### Insert with maintenance history:
```sql
INSERT INTO vehicles (plate_number, make, model, year, type, status, mileage, maintenance_history)
VALUES (
  'ABC-1234',
  'Volvo',
  'VNL',
  2022,
  'tractor',
  'available',
  45000,
  '[
    {"date": "2025-01-15", "type": "oil_change", "cost": 45.99, "notes": "synthetic oil", "mileage": 40000},
    {"date": "2025-01-20", "type": "tire_rotation", "cost": 35.00, "notes": "all tires rotated", "mileage": 40500},
    {"date": "2025-02-01", "type": "brake_inspection", "cost": 120.00, "notes": "pads good condition", "mileage": 45000}
  ]'::jsonb
);
```

#### Query maintenance history:
```sql
-- Get latest maintenance for all vehicles
SELECT id, plate_number,
  maintenance_history->>-1 as latest_maintenance
FROM vehicles
WHERE maintenance_history != '[]'::jsonb;

-- Find all oil changes
SELECT id, plate_number,
  jsonb_array_elements(maintenance_history) as maintenance
FROM vehicles
WHERE jsonb_array_elements(maintenance_history)->>'type' = 'oil_change';

-- Get total maintenance cost per vehicle
SELECT id, plate_number,
  SUM((elem->>'cost')::numeric) as total_cost
FROM vehicles,
  jsonb_array_elements(maintenance_history) as elem
GROUP BY id, plate_number;

-- Find maintenance done after specific date
SELECT id, plate_number,
  jsonb_array_elements(maintenance_history) as maintenance
FROM vehicles
WHERE (jsonb_array_elements(maintenance_history)->>'date')::date > '2025-01-01';
```

#### Update maintenance history:
```sql
-- Add new maintenance record
UPDATE vehicles
SET maintenance_history = maintenance_history || '[{"date": "2025-02-05", "type": "fuel_filter", "cost": 25.50, "notes": "preventive", "mileage": 45500}]'::jsonb
WHERE id = 1;

-- Update latest maintenance record
UPDATE vehicles
SET maintenance_history = jsonb_set(
  maintenance_history,
  '{' || (jsonb_array_length(maintenance_history) - 1)::text || ',cost}',
  '99.99'
)
WHERE id = 1;
```

---

## Common JSONB Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| `@>` | Contains (containment) | `metadata @> '{"status": "active"}'` |
| `<@` | Contained by | `'{"a": 1}'::jsonb <@ metadata` |
| `?` | Key exists | `metadata ? 'notes'` |
| `?` (array) | Any key exists | `metadata ?* array['a','b']` |
| `?&` | All keys exist | `metadata ?& array['a','b']` |
| `->` | Get value as JSONB | `metadata -> 'custom_fields'` |
| `->>` | Get value as text | `metadata ->> 'notes'` |
| `#>` | Get nested path as JSONB | `metadata #> '{custom_fields,po_number}'` |
| `#>>` | Get nested path as text | `metadata #>> '{custom_fields,po_number}'` |
| `\|\|` | Merge/concatenate | `metadata \|\| '{"new": "value"}'` |

---

## Performance Considerations

### GIN Indexes
- Automatically created for all 3 JSONB columns
- Optimize containment queries (`@>`, `?`)
- Slightly slower writes, much faster reads
- Check index usage:

```sql
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexrelname LIKE 'idx_%jsonb%' OR indexrelname LIKE 'idx_%metadata%' OR indexrelname LIKE 'idx_%profile%' OR indexrelname LIKE 'idx_%maintenance%';
```

### Query Performance Tips
1. Use GIN indexes for containment queries (`@>`)
2. Avoid complex nested searches without indexes
3. Consider extracting frequently-queried fields to separate columns
4. Monitor slow queries if JSONB usage grows

---

## Migration Rollback (if needed)

```sql
-- Drop the new columns if you need to rollback
ALTER TABLE shipments DROP COLUMN metadata;
ALTER TABLE drivers DROP COLUMN profile_data;
ALTER TABLE vehicles DROP COLUMN maintenance_history;

-- Indexes are automatically dropped with columns
```

---

## Best Practices

✅ **Do:**
- Use JSONB for optional, variable data
- Index JSONB columns with GIN
- Use meaningful key names
- Document expected JSON structure
- Validate JSON in application code
- Keep JSONB data focused (don't put everything there)

❌ **Don't:**
- Store all data as JSONB (defeats purpose of relational DB)
- Use JSONB for core business logic
- Mix structured and unstructured data carelessly
- Assume all applications can parse JSONB
- Use JSONB without proper indexes for read-heavy queries
