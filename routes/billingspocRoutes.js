const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const billingspocController = require('../controllers/billingspocController');

router.post('/billingspoc',verifyToken ,BillingSpocController.createBillingSpoc);
router.get('/billingspoc',verifyToken, BillingSpocController.getAllBillingSpoc);
router.get('/billingspoc/:id',verifyToken, BillingSpocController.getallBillingSpocById);
router.put('/billingspoc/:id',verifyToken, BillingSpocController.updateBillingSpoc);
router.delete('/billingspoc/:id',verifyToken, BillingSpocController.deleteBillingSpoc);

module.exports = router;
