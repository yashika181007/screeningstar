const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const BillingEscalationController = require('../controllers/billingescalationController');

router.post('/billingescalation',verifyToken ,BillingEscalationController.createBillingEscalation);
router.get('/billingescalation',verifyToken, BillingEscalationController.getAllBillingEscalation);
router.get('/billingescalation/:id',verifyToken, BillingEscalationController.getallBillingEscalationById);
router.put('/billingescalation/:id',verifyToken, BillingEscalationController.updateBillingEscalation);
router.delete('/billingescalation/:id',verifyToken, BillingEscalationController.deleteBillingEscalation);

module.exports = router;
