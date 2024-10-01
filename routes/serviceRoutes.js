const express = require('express');
const router = express.Router();
const serviceRoutes = require('../controllers/serviceRoutes');

router.post('/service', ServiceController.createService);

router.get('/service', ServiceController.getAllServices);

router.get('/service/:id', ServiceController.getServiceById);

router.put('/service/:id', ServiceController.updateService);

router.delete('/service/:id', ServiceController.deleteService);

module.exports = router;
