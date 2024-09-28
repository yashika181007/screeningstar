const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/clients', clientController.createClient,authenticateToken);

router.get('/clients', clientController.getClients,authenticateToken);

router.get('/clients/:id', clientController.getClientById,authenticateToken);

router.put('/clients/:id', clientController.updateClient,authenticateToken); 

router.delete('/clients/:id', clientController.deleteClient,authenticateToken);

module.exports = router;
