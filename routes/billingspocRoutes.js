const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const billingspocController = require('../controllers/billingspocController');

router.post('/billingspoc',verifyToken ,billingspocController.createBillingSpoc);
router.get('/billingspoc',verifyToken, billingspocController.getAllBillingSpoc);
router.get('/billingspoc/:id',verifyToken, billingspocController.getallBillingSpocById);
router.put('/billingspoc/:id',verifyToken, billingspocController.updateBillingSpoc);
router.delete('/billingspoc/:id',verifyToken, billingspocController.deleteBillingSpoc);

module.exports = router;
