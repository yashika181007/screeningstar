const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const clientSpocController = require('../controllers/clientSpocController');

router.post('/clientspoc',verifyToken ,clientSpocController.createClientSpoc);
router.get('/clientspoc',verifyToken, clientSpocController.getAllClientSpocs);
router.get('/clientspoc/:id',verifyToken, clientSpocController.getClientSpocById);
router.put('/clientspoc/:id',verifyToken, clientSpocController.updateClientSpoc);
router.delete('/clientspoc/:id',verifyToken, clientSpocController.deleteClientSpoc);

module.exports = router;
