const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');

router.get('/', driversController.getDrivers);
router.get('/:id', driversController.getDriver);
router.post('/', driversController.createDriver);
router.put('/:id', driversController.updateDriver);
router.delete('/:id', driversController.deleteDriver);

module.exports = router;
