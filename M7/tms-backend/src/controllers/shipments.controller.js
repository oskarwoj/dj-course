const pool = require('../config/database');

// GET /api/shipments - List all shipments
exports.getShipments = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
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
    const { name, customer, origin, destination, status, driver_id, vehicle_id } = req.body;

    const result = await pool.query(
      `INSERT INTO shipments (name, customer, origin, destination, status, driver_id, vehicle_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, customer, origin, destination, status, driver_id, vehicle_id]
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
    const { name, customer, origin, destination, status, driver_id, vehicle_id } = req.body;

    const result = await pool.query(
      `UPDATE shipments
       SET name = $1, customer = $2, origin = $3, destination = $4, status = $5, driver_id = $6, vehicle_id = $7
       WHERE id = $8
       RETURNING *`,
      [name, customer, origin, destination, status, driver_id, vehicle_id, id]
    );

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
