const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const serviceController = require('../controllers/serviceController');

router.post('/service',verifyToken, serviceController.createService);
router.get('/service',verifyToken, serviceController.getAllServices);
router.get('/service/:id',verifyToken, serviceController.getServiceById);
router.put('/service/:id',verifyToken, serviceController.updateService);
router.delete('/service/:id',verifyToken, serviceController.deleteService);

module.exports = router;
