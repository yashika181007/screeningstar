const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const packageController = require('../controllers/packageController');

router.post('/package',verifyToken, packageController.createpackage);
router.get('/package',verifyToken, packageController.getAllpackages);
router.get('/package/:id',verifyToken, packageController.getpackageById);
router.put('/package/:id',verifyToken, packageController.updatepackage);
router.delete('/package/:id',verifyToken, packageController.deletepackage);

module.exports = router;
