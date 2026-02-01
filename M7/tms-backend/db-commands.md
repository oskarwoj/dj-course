# Database Access Commands

## View Data Using psql

### Quick view (one command):
```bash
/opt/homebrew/opt/postgresql@18/bin/psql tms_db -c "SELECT * FROM drivers;"
/opt/homebrew/opt/postgresql@18/bin/psql tms_db -c "SELECT * FROM vehicles;"
/opt/homebrew/opt/postgresql@18/bin/psql tms_db -c "SELECT * FROM shipments;"
```

### Interactive psql shell:
```bash
# Enter interactive shell
/opt/homebrew/opt/postgresql@18/bin/psql tms_db

# Once inside psql, you can run:
\dt                          # List all tables
\d drivers                   # Describe drivers table structure
\d vehicles                  # Describe vehicles table structure
\d shipments                 # Describe shipments table structure

SELECT * FROM drivers;       # View all drivers
SELECT * FROM vehicles;      # View all vehicles
SELECT * FROM shipments;     # View all shipments

# View with JOIN (shipments with driver and vehicle names)
SELECT
  s.id,
  s.name,
  s.customer,
  s.status,
  d.name as driver_name,
  v.plate_number,
  v.make || ' ' || v.model as vehicle
FROM shipments s
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id;

\q                           # Quit psql
```

## Add psql to PATH (Optional)

To use `psql` directly without the full path, add this to your `~/.zshrc`:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Then you can just use:
```bash
psql tms_db
```

## GUI Tools (Recommended for Visual Exploration)

### 1. **Postico 2** (Mac - Best for macOS)
- Download: https://eggerapps.at/postico2/
- Free version available
- Beautiful macOS-native interface
- Great for browsing and editing data

### 2. **DBeaver** (Free, Cross-platform)
```bash
brew install --cask dbeaver-community
```
- Connection settings:
  - Host: localhost
  - Port: 5432
  - Database: tms_db
  - Username: oskarwojciechowski
  - Password: (leave empty)

### 3. **pgAdmin 4** (Official PostgreSQL GUI)
```bash
brew install --cask pgadmin4
```
- Full-featured but heavier interface

### 4. **TablePlus** (Mac - Paid but has free trial)
```bash
brew install --cask tableplus
```
- Modern, fast interface
- Supports multiple databases

## VS Code Extensions

If you use VS Code, install:
- **PostgreSQL** by Chris Kolkman
- Connect to your database directly in VS Code

## Quick Database Stats

```bash
# Count records in each table
/opt/homebrew/opt/postgresql@18/bin/psql tms_db -c "
SELECT
  'drivers' as table_name, COUNT(*) as count FROM drivers
  UNION ALL
SELECT
  'vehicles', COUNT(*) FROM vehicles
  UNION ALL
SELECT
  'shipments', COUNT(*) FROM shipments;
"
```

## Useful Queries for Learning

```sql
-- Find all active drivers
SELECT * FROM drivers WHERE status = 'active';

-- Find shipments with driver and vehicle info
SELECT
  s.name as shipment,
  s.status,
  d.name as driver,
  v.plate_number
FROM shipments s
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id;

-- Count shipments by status
SELECT status, COUNT(*)
FROM shipments
GROUP BY status;

-- Find available vehicles
SELECT * FROM vehicles WHERE status = 'available';

-- Find shipments without assigned drivers
SELECT * FROM shipments WHERE driver_id IS NULL;
```
