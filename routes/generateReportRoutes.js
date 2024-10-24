const express = require('express');
const generateReportController = require('../controllers/generateReportController');
const router = express.Router();

// CRUD routes
router.post('/', generateReportController.createGenerateReport); // Create
router.get('/:id', generateReportController.getGenerateReportById); // Read by ID
router.get('/', generateReportController.getAllGenerateReports); // Read all
router.put('/:id', generateReportController.updateGenerateReport); // Update
router.delete('/:id', generateReportController.deleteGenerateReport); // Delete

module.exports = router;
