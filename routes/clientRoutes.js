const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

;
router.get('/clients/active', clientController.getActiveClients);
router.get('/clients/inactive', clientController.getInactiveClients);


module.exports = router;
