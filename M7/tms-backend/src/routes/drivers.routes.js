const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');

// List and create drivers
router.get('/', driversController.getDrivers);
router.post('/', driversController.createDriver);

// Single driver operations (must come after specific routes)
router.get('/:id', driversController.getDriver);
router.put('/:id', driversController.updateDriver);
router.delete('/:id', driversController.deleteDriver);

// Driver-specific data endpoints
router.get('/:id/routes', driversController.getDriverRoutes);
router.get('/:id/calendar', driversController.getDriverCalendar);
router.get('/:id/shipments', driversController.getDriverShipments);
router.put('/:id/status', driversController.updateDriverStatus);

module.exports = router;
