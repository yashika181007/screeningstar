const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const invoiceController = require('../controllers/invoiceController');

router.post('/invoices',verifyToken, invoiceController.createInvoice);
router.get('/invoices',verifyToken, invoiceController.getAllInvoices);
router.get('/invoices/:id',verifyToken, invoiceController.getInvoiceById);
router.put('/invoices/:id',verifyToken, invoiceController.updateInvoice);
router.delete('/invoices/:id',verifyToken, invoiceController.deleteInvoice);

module.exports = router;
