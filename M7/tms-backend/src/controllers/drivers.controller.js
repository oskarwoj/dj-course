const pool = require('../config/database');

// GET /api/drivers - List all drivers
exports.getDrivers = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY name');
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

// POST /api/drivers - Create new driver
exports.createDriver = async (req, res, next) => {
  try {
    const { name, email, phone, status, license_number, hire_date } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (name, email, phone, status, license_number, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, status, license_number, hire_date]
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
    const { name, email, phone, status, license_number, hire_date } = req.body;

    const result = await pool.query(
      `UPDATE drivers
       SET name = $1, email = $2, phone = $3, status = $4, license_number = $5, hire_date = $6
       WHERE id = $7
       RETURNING *`,
      [name, email, phone, status, license_number, hire_date, id]
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
