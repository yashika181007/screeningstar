const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/clients', clientController.createClient);

router.get('/clients', clientController.getClients);

router.get('/clients/:id', clientController.getClientById);
router.get('/clients/active', clientController.getActiveClients);
router.get('/clients/inactive', clientController.getInactiveClients);
router.put('/clients/:id', clientController.updateClient); 

router.delete('/clients/:id', clientController.deleteClient);

module.exports = router;
