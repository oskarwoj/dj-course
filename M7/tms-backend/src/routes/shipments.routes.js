const express = require('express');
const router = express.Router();
const shipmentsController = require('../controllers/shipments.controller');

router.get('/', shipmentsController.getShipments);
router.get('/:id', shipmentsController.getShipment);
router.post('/', shipmentsController.createShipment);
router.put('/:id', shipmentsController.updateShipment);
router.delete('/:id', shipmentsController.deleteShipment);

module.exports = router;
