const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
// const verifyBothTokens = require('./config/verifyBothTokens');
const clientmanagerController = require('../controllers/clientmanagerController');

router.post('/clientmanager', verifyToken ,clientmanagerController.createClientManager);       
router.get('/clientmanager',verifyToken , clientmanagerController.getAllClientManagers);        
router.get('/clientmanager/:id',verifyToken , clientmanagerController.getClientManagerById);     
router.put('/clientmanager/:id',verifyToken , clientmanagerController.updateClientManager);      
router.delete('/clientmanager/:id',verifyToken , clientmanagerController.deleteClientManager);   
router.get('/getClientApplicationCounts',verifyToken , clientmanagerController.getClientApplicationCounts);  
router.get('/sendacknowledgemail',verifyToken , clientmanagerController.sendacknowledgemail);         
router.get('/getdata/:clientId/:branchId',verifyToken , clientmanagerController.getClientBranchData);     
router.post('/findapplication',verifyToken , clientmanagerController.getClientManagerByAppID); 
module.exports = router;
