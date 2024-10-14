const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const clientController = require('../controllers/clientController');

router.post('/clients',verifyToken, clientController.createClient);
router.post('/loginClient',verifyToken, clientController.loginClient);
router.post('/logoutClient',verifyToken, clientController.createClient);
router.post('/fetchPassword',verifyToken, clientController.fetchPassword);
router.get('/clients',verifyToken, clientController.getClients);

router.get('/clients/active',verifyToken, clientController.getActiveClients);

router.get('/clients/inactive',verifyToken, clientController.getInactiveClients);

router.get('/clients/:id',verifyToken, clientController.getClientById);

router.put('/clients/:id',verifyToken, clientController.updateClient);

router.delete('/clients/:id',verifyToken, clientController.deleteClient);
router.put('/clients/status/:id',verifyToken, clientController.changeClientStatus);

module.exports = router;
