const pool = require('../config/database');

// GET /api/vehicles - List all vehicles
exports.getVehicles = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY plate_number');
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

// POST /api/vehicles - Create new vehicle
exports.createVehicle = async (req, res, next) => {
  try {
    const { plate_number, make, model, year, type, status, mileage } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (plate_number, make, model, year, type, status, mileage)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [plate_number, make, model, year, type, status, mileage]
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
    const { plate_number, make, model, year, type, status, mileage } = req.body;

    const result = await pool.query(
      `UPDATE vehicles
       SET plate_number = $1, make = $2, model = $3, year = $4, type = $5, status = $6, mileage = $7
       WHERE id = $8
       RETURNING *`,
      [plate_number, make, model, year, type, status, mileage, id]
    );

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
