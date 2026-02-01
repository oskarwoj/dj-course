require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initDatabase() {
  try {
    console.log('🚀 Initializing TMS database...\n');

    // 1. Create base schema
    console.log('Step 1/5: Creating base schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✓ Base schema created\n');

    // 2. Add JSONB columns
    console.log('Step 2/5: Adding JSONB columns...');
    const addJsonbColumns = fs.readFileSync(path.join(__dirname, '002_add_jsonb_columns.sql'), 'utf8');
    await pool.query(addJsonbColumns);
    console.log('✓ JSONB columns added\n');

    // 3. Insert basic seed data
    console.log('Step 3/5: Seeding basic data...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(seed);
    console.log('✓ Basic sample data seeded\n');

    // 4. Populate JSONB data
    console.log('Step 4/5: Populating JSONB data...');
    const populateJsonb = fs.readFileSync(path.join(__dirname, '003_populate_jsonb_data.sql'), 'utf8');
    await pool.query(populateJsonb);
    console.log('✓ JSONB data populated\n');

    // 5. Add additional indexes (if exists)
    console.log('Step 5/5: Creating additional indexes...');
    const indexesMigrationPath = path.join(__dirname, '001_add_missing_indexes.sql');
    if (fs.existsSync(indexesMigrationPath)) {
      const addIndexes = fs.readFileSync(indexesMigrationPath, 'utf8');
      await pool.query(addIndexes);
      console.log('✓ Additional indexes created\n');
    } else {
      console.log('ℹ Skipped (migration file not found)\n');
    }

    console.log('✅ Database initialization complete!');
    console.log('   Database is ready with JSONB columns and sample data.');
    console.log('   You can now start the server with: npm run dev\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:');
    console.error(err);
    process.exit(1);
  }
}

initDatabase();
