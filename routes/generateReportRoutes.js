const express = require('express');
const generateReportController = require('../controllers/generateReportController');
const router = express.Router();

// CRUD routes
router.post('/generatereport', generateReportController.createGenerateReport); // Create
router.get('/generatereport/:application_id', generateReportController.getGenerateReportById); // Read by ID
router.get('/generatereport', generateReportController.getAllGenerateReports); // Read all
router.put('/generatereport/:id', generateReportController.updateGenerateReport); // Update
router.delete('/generatereport/:id', generateReportController.deleteGenerateReport); // Delete

module.exports = router;
