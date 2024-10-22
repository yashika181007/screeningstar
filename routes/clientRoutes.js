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

router.get('/getheadBranches', verifyToken, clientController.getheadbranch);
router.get('/getnonheadBranches/:clientId', verifyToken, clientController.getNonHeadBranches);
router.get('/Branches',verifyToken, clientController.getBranchbyclient);
router.put('/Branches/:id',verifyToken, clientController.updateBranch);
router.delete('/Branches/:id',verifyToken, clientController.deleteBranch);
router.get('/clients/active',verifyToken, clientController.getActiveClients);
router.post('/clients/forgot-password',verifyToken, clientController.forgotPassword);
router.get('/clients/inactive',verifyToken, clientController.getInactiveClients);

router.get('/clients/:id',verifyToken, clientController.getClientById);

router.put('/clients/:id',verifyToken, clientController.updateClient);

router.delete('/clients/:id',verifyToken, clientController.deleteClient);
router.put('/clients/status/:id',verifyToken, clientController.changeClientStatus);
router.get('/fetchcmdata',verifyToken, clientController.fetchdataforclientmanager);
module.exports = router;
