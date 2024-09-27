const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/client', clientController.createClient);

router.get('/clients', clientController.getClients);

router.get('/client/:id', clientController.getClientById);

router.put('/client/:id', clientController.updateClient);

router.delete('/client/:id', clientController.deleteClient);

module.exports = router;
