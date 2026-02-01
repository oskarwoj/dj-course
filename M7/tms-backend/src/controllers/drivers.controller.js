const pool = require('../config/database');

// GET /api/drivers - List all drivers with optional filtering
exports.getDrivers = async (req, res, next) => {
  try {
    const { status, contractType, search } = req.query;
    
    let query = 'SELECT * FROM drivers WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by status
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Filter by contract type (from JSONB profile_data)
    if (contractType) {
      paramCount++;
      query += ` AND profile_data->>'contractType' = $${paramCount}`;
      params.push(contractType);
    }

    // Search by name or email
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/drivers/:id - Get single driver
exports.getDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/drivers/:id/routes - Get driver routes
exports.getDriverRoutes = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT profile_data->'routes' as routes FROM drivers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Return routes array from JSONB, default to empty array if not set
    res.json(result.rows[0].routes || []);
  } catch (err) {
    next(err);
  }
};

// GET /api/drivers/:id/calendar - Get driver calendar events
exports.getDriverCalendar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT profile_data->'calendarEvents' as calendar_events FROM drivers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0].calendar_events || []);
  } catch (err) {
    next(err);
  }
};

// GET /api/drivers/:id/shipments - Get shipments for a driver
exports.getDriverShipments = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT s.* FROM shipments s WHERE s.driver_id = $1 ORDER BY s.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/drivers - Create new driver
exports.createDriver = async (req, res, next) => {
  try {
    const { name, email, phone, status, license_number, hire_date, profile_data } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (name, email, phone, status, license_number, hire_date, profile_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, phone, status, license_number, hire_date, profile_data || {}]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/drivers/:id - Update driver
exports.updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, license_number, hire_date, profile_data } = req.body;

    let query = 'UPDATE drivers SET ';
    const params = [];
    const updates = [];
    let paramCount = 0;

    // Build dynamic update query
    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      params.push(email);
    }
    if (phone !== undefined) {
      paramCount++;
      updates.push(`phone = $${paramCount}`);
      params.push(phone);
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }
    if (license_number !== undefined) {
      paramCount++;
      updates.push(`license_number = $${paramCount}`);
      params.push(license_number);
    }
    if (hire_date !== undefined) {
      paramCount++;
      updates.push(`hire_date = $${paramCount}`);
      params.push(hire_date);
    }
    if (profile_data !== undefined) {
      paramCount++;
      updates.push(`profile_data = $${paramCount}`);
      params.push(profile_data);
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
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/drivers/:id/status - Update driver status
exports.updateDriverStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      `UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/drivers/:id - Delete driver
exports.deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ message: 'Driver deleted', driver: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
