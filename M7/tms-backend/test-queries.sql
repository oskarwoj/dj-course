-- ============================================
-- TMS Database Test Queries for pgAdmin
-- ============================================
-- Copy and paste these queries into pgAdmin's Query Tool
-- Select a query and press F5 or click the Execute button

-- ============================================
-- 1. BASIC SELECT QUERIES
-- ============================================

-- View all drivers
SELECT * FROM drivers;

-- View all vehicles
SELECT * FROM vehicles;

-- View all shipments
SELECT * FROM shipments;

-- View specific columns only
SELECT name, email, status FROM drivers;

-- Count total records in each table
SELECT COUNT(*) as total_drivers FROM drivers;
SELECT COUNT(*) as total_vehicles FROM vehicles;
SELECT COUNT(*) as total_shipments FROM shipments;


-- ============================================
-- 2. FILTERING WITH WHERE
-- ============================================

-- Find active drivers
SELECT * FROM drivers
WHERE status = 'active';

-- Find drivers hired after 2023
SELECT name, email, hire_date
FROM drivers
WHERE hire_date > '2023-01-01';

-- Find available vehicles
SELECT plate_number, make, model, status
FROM vehicles
WHERE status = 'available';

-- Find vehicles with low mileage (less than 50,000)
SELECT * FROM vehicles
WHERE mileage < 50000;

-- Find pending shipments
SELECT * FROM shipments
WHERE status = 'pending';

-- Find shipments without assigned drivers
SELECT * FROM shipments
WHERE driver_id IS NULL;


-- ============================================
-- 3. SORTING WITH ORDER BY
-- ============================================

-- Drivers sorted by name (A-Z)
SELECT * FROM drivers
ORDER BY name ASC;

-- Drivers sorted by hire date (newest first)
SELECT name, hire_date FROM drivers
ORDER BY hire_date DESC;

-- Vehicles sorted by mileage (highest first)
SELECT plate_number, make, model, mileage
FROM vehicles
ORDER BY mileage DESC;

-- Shipments sorted by creation date
SELECT * FROM shipments
ORDER BY created_at DESC;


-- ============================================
-- 4. MULTIPLE CONDITIONS (AND, OR)
-- ============================================

-- Find active drivers hired in 2023
SELECT * FROM drivers
WHERE status = 'active'
  AND hire_date >= '2023-01-01';

-- Find vehicles that are either available or in maintenance
SELECT * FROM vehicles
WHERE status = 'available'
   OR status = 'maintenance';

-- Find shipments that are either pending or in-transit
SELECT * FROM shipments
WHERE status IN ('pending', 'in-transit');


-- ============================================
-- 5. JOINS - Combining Data from Multiple Tables
-- ============================================

-- Shipments with driver information
SELECT
  s.id,
  s.name as shipment_name,
  s.customer,
  s.status as shipment_status,
  d.name as driver_name,
  d.phone as driver_phone,
  d.status as driver_status
FROM shipments s
LEFT JOIN drivers d ON s.driver_id = d.id;

-- Shipments with vehicle information
SELECT
  s.id,
  s.name as shipment_name,
  s.origin,
  s.destination,
  v.plate_number,
  v.make,
  v.model,
  v.year
FROM shipments s
LEFT JOIN vehicles v ON s.vehicle_id = v.id;

-- Complete shipment details (with driver AND vehicle)
SELECT
  s.id,
  s.name as shipment,
  s.customer,
  s.origin,
  s.destination,
  s.status,
  d.name as driver,
  d.phone as driver_phone,
  v.plate_number,
  v.make || ' ' || v.model as vehicle
FROM shipments s
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id
ORDER BY s.created_at DESC;

-- Find all shipments assigned to a specific driver (John Doe)
SELECT
  s.name as shipment,
  s.customer,
  s.status,
  d.name as driver
FROM shipments s
JOIN drivers d ON s.driver_id = d.id
WHERE d.name = 'John Doe';


-- ============================================
-- 6. AGGREGATION - COUNT, SUM, AVG, MIN, MAX
-- ============================================

-- Count drivers by status
SELECT
  status,
  COUNT(*) as count
FROM drivers
GROUP BY status
ORDER BY count DESC;

-- Count shipments by status
SELECT
  status,
  COUNT(*) as count
FROM shipments
GROUP BY status;

-- Count vehicles by status
SELECT
  status,
  COUNT(*) as total_vehicles
FROM vehicles
GROUP BY status;

-- Average vehicle mileage
SELECT
  ROUND(AVG(mileage)) as avg_mileage,
  MIN(mileage) as min_mileage,
  MAX(mileage) as max_mileage
FROM vehicles;

-- Count shipments per driver
SELECT
  d.name as driver,
  COUNT(s.id) as total_shipments
FROM drivers d
LEFT JOIN shipments s ON d.id = s.driver_id
GROUP BY d.name
ORDER BY total_shipments DESC;


-- ============================================
-- 7. PATTERN MATCHING (LIKE)
-- ============================================

-- Find drivers with email containing 'example.com'
SELECT name, email FROM drivers
WHERE email LIKE '%example.com';

-- Find drivers whose name starts with 'J'
SELECT * FROM drivers
WHERE name LIKE 'J%';

-- Find vehicles with plate numbers starting with 'A'
SELECT * FROM vehicles
WHERE plate_number LIKE 'A%';


-- ============================================
-- 8. INSERT - Adding New Records
-- ============================================

-- Add a new driver
INSERT INTO drivers (name, email, phone, status, license_number, hire_date)
VALUES ('Sarah Johnson', 'sarah@example.com', '555-2222', 'active', 'DL999888', '2024-01-15')
RETURNING *;

-- Add a new vehicle
INSERT INTO vehicles (plate_number, make, model, year, type, status, mileage)
VALUES ('GHI-789', 'Volvo', 'FH', 2024, 'truck', 'available', 5000)
RETURNING *;

-- Add a new shipment
INSERT INTO shipments (name, customer, origin, destination, status, driver_id, vehicle_id)
VALUES ('Shipment #004', 'Tech Corp', 'Berlin', 'Amsterdam', 'pending', NULL, NULL)
RETURNING *;


-- ============================================
-- 9. UPDATE - Modifying Existing Records
-- ============================================

-- Update driver status
UPDATE drivers
SET status = 'on-route'
WHERE name = 'Sarah Johnson'
RETURNING *;

-- Update vehicle mileage
UPDATE vehicles
SET mileage = 46000
WHERE plate_number = 'ABC-123'
RETURNING *;

-- Assign driver and vehicle to a shipment
UPDATE shipments
SET driver_id = 1, vehicle_id = 3, status = 'in-transit'
WHERE name = 'Shipment #003'
RETURNING *;

-- Update multiple fields at once
UPDATE drivers
SET phone = '555-3333', status = 'active'
WHERE email = 'sarah@example.com'
RETURNING *;


-- ============================================
-- 10. DELETE - Removing Records
-- ============================================

-- Delete a specific driver (be careful!)
-- Uncomment to run:
-- DELETE FROM drivers WHERE email = 'sarah@example.com' RETURNING *;

-- Delete pending shipments
-- Uncomment to run:
-- DELETE FROM shipments WHERE status = 'pending' RETURNING *;


-- ============================================
-- 11. ADVANCED QUERIES
-- ============================================

-- Find drivers who have no assigned shipments
SELECT d.*
FROM drivers d
LEFT JOIN shipments s ON d.id = s.driver_id
WHERE s.id IS NULL;

-- Find vehicles currently not in use
SELECT v.*
FROM vehicles v
LEFT JOIN shipments s ON v.id = s.vehicle_id AND s.status = 'in-transit'
WHERE s.id IS NULL;

-- Shipments with their driver and vehicle, showing only in-transit
SELECT
  s.name as shipment,
  s.origin || ' → ' || s.destination as route,
  d.name as driver,
  d.phone,
  v.plate_number,
  v.make || ' ' || v.model as vehicle
FROM shipments s
JOIN drivers d ON s.driver_id = d.id
JOIN vehicles v ON s.vehicle_id = v.id
WHERE s.status = 'in-transit';

-- Count shipments per customer
SELECT
  customer,
  COUNT(*) as total_orders,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'in-transit' THEN 1 ELSE 0 END) as in_transit,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
FROM shipments
GROUP BY customer
ORDER BY total_orders DESC;

-- Find the most active driver (most shipments)
SELECT
  d.name,
  d.status,
  COUNT(s.id) as total_shipments
FROM drivers d
LEFT JOIN shipments s ON d.id = s.driver_id
GROUP BY d.id, d.name, d.status
ORDER BY total_shipments DESC
LIMIT 1;


-- ============================================
-- 12. SUBQUERIES
-- ============================================

-- Find drivers with more shipments than average
SELECT
  d.name,
  COUNT(s.id) as shipment_count
FROM drivers d
LEFT JOIN shipments s ON d.id = s.driver_id
GROUP BY d.id, d.name
HAVING COUNT(s.id) > (
  SELECT AVG(shipment_count)
  FROM (
    SELECT COUNT(s.id) as shipment_count
    FROM drivers d
    LEFT JOIN shipments s ON d.id = s.driver_id
    GROUP BY d.id
  ) as counts
);

-- Find vehicles with above-average mileage
SELECT * FROM vehicles
WHERE mileage > (SELECT AVG(mileage) FROM vehicles);


-- ============================================
-- 13. DATE/TIME QUERIES
-- ============================================

-- Find drivers hired in the last year
SELECT name, hire_date
FROM drivers
WHERE hire_date > CURRENT_DATE - INTERVAL '1 year';

-- Calculate how long each driver has been employed (in days)
SELECT
  name,
  hire_date,
  CURRENT_DATE - hire_date as days_employed,
  EXTRACT(YEAR FROM age(CURRENT_DATE, hire_date)) as years_employed
FROM drivers
ORDER BY hire_date;

-- Find shipments created today
SELECT * FROM shipments
WHERE created_at::date = CURRENT_DATE;


-- ============================================
-- 14. USEFUL MAINTENANCE QUERIES
-- ============================================

-- View table structure
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- View all indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
