const pool = require('../config/database');

// GET /api/vehicles - List all vehicles with optional filtering
exports.getVehicles = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by status
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Filter by type
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    // Search by plate number, make, or model
    if (search) {
      paramCount++;
      query += ` AND (plate_number ILIKE $${paramCount} OR make ILIKE $${paramCount} OR model ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY plate_number';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/:id - Get single vehicle
exports.getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/:id/maintenance - Get vehicle maintenance history
exports.getVehicleMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT maintenance_history FROM vehicles WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Return maintenance history array from JSONB, default to empty array
    res.json(result.rows[0].maintenance_history || []);
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles - Create new vehicle
exports.createVehicle = async (req, res, next) => {
  try {
    const { plate_number, make, model, year, type, status, mileage, maintenance_history } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (plate_number, make, model, year, type, status, mileage, maintenance_history)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [plate_number, make, model, year, type, status, mileage, maintenance_history || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/vehicles/:id - Update vehicle
exports.updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plate_number, make, model, year, type, status, mileage, maintenance_history } = req.body;

    let query = 'UPDATE vehicles SET ';
    const params = [];
    const updates = [];
    let paramCount = 0;

    // Build dynamic update query
    if (plate_number !== undefined) {
      paramCount++;
      updates.push(`plate_number = $${paramCount}`);
      params.push(plate_number);
    }
    if (make !== undefined) {
      paramCount++;
      updates.push(`make = $${paramCount}`);
      params.push(make);
    }
    if (model !== undefined) {
      paramCount++;
      updates.push(`model = $${paramCount}`);
      params.push(model);
    }
    if (year !== undefined) {
      paramCount++;
      updates.push(`year = $${paramCount}`);
      params.push(year);
    }
    if (type !== undefined) {
      paramCount++;
      updates.push(`type = $${paramCount}`);
      params.push(type);
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }
    if (mileage !== undefined) {
      paramCount++;
      updates.push(`mileage = $${paramCount}`);
      params.push(mileage);
    }
    if (maintenance_history !== undefined) {
      paramCount++;
      updates.push(`maintenance_history = $${paramCount}`);
      params.push(maintenance_history);
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
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vehicles/:id - Delete vehicle
exports.deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted', vehicle: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
