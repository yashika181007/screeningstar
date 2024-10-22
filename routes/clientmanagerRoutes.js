const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const clientmanagerController = require('../controllers/clientmanagerController');

router.post('/clientmanager', verifyToken ,clientmanagerController.createClientManager);       
router.get('/clientmanager',verifyToken , clientmanagerController.getAllClientManagers);        
router.get('/clientmanager/:id',verifyToken , clientmanagerController.getClientManagerById);     
router.put('/clientmanager/:id',verifyToken , clientmanagerController.updateClientManager);      
router.delete('/clientmanager/:id',verifyToken , clientmanagerController.deleteClientManager);   
router.get('/getClientApplicationCounts',verifyToken , clientmanagerController.getClientApplicationCounts);  
router.get('/sendacknowledgemail',verifyToken , clientmanagerController.sendacknowledgemail);     
router.get('/adminmanagerdata',verifyToken , clientmanagerController.getadminmanagerdata);     
module.exports = router;
