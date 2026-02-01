require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initDatabase() {
  try {
    console.log('Initializing database...');

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✓ Schema created successfully!');

    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(seed);
    console.log('✓ Database seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err);
    process.exit(1);
  }
}

initDatabase();
