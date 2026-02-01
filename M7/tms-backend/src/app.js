const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const driversRoutes = require('./routes/drivers.routes');
const vehiclesRoutes = require('./routes/vehicles.routes');
const shipmentsRoutes = require('./routes/shipments.routes');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4002' }));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes (no authentication)
app.use('/api/drivers', driversRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/shipments', shipmentsRoutes);

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;
