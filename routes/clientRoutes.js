const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const clientController = require('../controllers/clientController');

router.post('/clients',verifyToken, clientController.createClient);
router.post('/fetchPassword',verifyToken, clientController.fetchPassword);
router.post('/loginClient',verifyToken, clientController.loginClient);
router.post('/clients/verif-login', verifyToken, clientController.verifyLogin);
router.post('/logoutClient',verifyToken, clientController.logout);

router.get('/clients',verifyToken, clientController.getClients);
router.get('/Branchs',verifyToken, clientController.getBranchs);
router.get('/Branchs/:id',verifyToken, clientController.getBranchbyclient);
router.put('/Branchs/:id',verifyToken, clientController.updateBranch);

router.get('/clients/active',verifyToken, clientController.getActiveClients);

router.get('/clients/inactive',verifyToken, clientController.getInactiveClients);

router.get('/clients/:id',verifyToken, clientController.getClientById);

router.put('/clients/:id',verifyToken, clientController.updateClient);

router.delete('/clients/:id',verifyToken, clientController.deleteClient);
router.put('/clients/status/:id',verifyToken, clientController.changeClientStatus);

module.exports = router;
