const pool = require('../config/database');

// GET /api/shipments - List all shipments with optional filtering
exports.getShipments = async (req, res, next) => {
  try {
    const { status, driver_id, vehicle_id, search } = req.query;
    
    let query = 'SELECT * FROM shipments WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by status
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Filter by driver
    if (driver_id) {
      paramCount++;
      query += ` AND driver_id = $${paramCount}`;
      params.push(driver_id);
    }

    // Filter by vehicle
    if (vehicle_id) {
      paramCount++;
      query += ` AND vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
    }

    // Search by name, customer, origin, or destination
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR customer ILIKE $${paramCount} OR origin ILIKE $${paramCount} OR destination ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/shipments/:id - Get single shipment
exports.getShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/shipments - Create new shipment
exports.createShipment = async (req, res, next) => {
  try {
    const { name, customer, origin, destination, status, driver_id, vehicle_id, metadata } = req.body;

    const result = await pool.query(
      `INSERT INTO shipments (name, customer, origin, destination, status, driver_id, vehicle_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, customer, origin, destination, status, driver_id, vehicle_id, metadata || {}]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/shipments/:id - Update shipment
exports.updateShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, customer, origin, destination, status, driver_id, vehicle_id, metadata } = req.body;

    let query = 'UPDATE shipments SET ';
    const params = [];
    const updates = [];
    let paramCount = 0;

    // Build dynamic update query
    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (customer !== undefined) {
      paramCount++;
      updates.push(`customer = $${paramCount}`);
      params.push(customer);
    }
    if (origin !== undefined) {
      paramCount++;
      updates.push(`origin = $${paramCount}`);
      params.push(origin);
    }
    if (destination !== undefined) {
      paramCount++;
      updates.push(`destination = $${paramCount}`);
      params.push(destination);
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }
    if (driver_id !== undefined) {
      paramCount++;
      updates.push(`driver_id = $${paramCount}`);
      params.push(driver_id);
    }
    if (vehicle_id !== undefined) {
      paramCount++;
      updates.push(`vehicle_id = $${paramCount}`);
      params.push(vehicle_id);
    }
    if (metadata !== undefined) {
      paramCount++;
      updates.push(`metadata = $${paramCount}`);
      params.push(metadata);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ');
    paramCount++;
    query += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/shipments/:id - Delete shipment
exports.deleteShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM shipments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment deleted', shipment: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
