const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehicles.controller');

// List and create vehicles
router.get('/', vehiclesController.getVehicles);
router.post('/', vehiclesController.createVehicle);

// Single vehicle operations
router.get('/:id', vehiclesController.getVehicle);
router.put('/:id', vehiclesController.updateVehicle);
router.delete('/:id', vehiclesController.deleteVehicle);

// Vehicle-specific data endpoints
router.get('/:id/maintenance', vehiclesController.getVehicleMaintenance);

module.exports = router;
