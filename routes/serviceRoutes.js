const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.post('/service', serviceController.createService);
router.get('/service', serviceController.getAllServices);
router.get('/service/:id', serviceController.getServiceById);
router.put('/service/:id', serviceController.updateService);
router.delete('/service/:id', serviceController.deleteService);

module.exports = router;
