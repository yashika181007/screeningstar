const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const candidatemanagerController = require('../controllers/candidatemanagerController');

router.post('/candidatemanager', verifyToken ,candidatemanagerController.createcandidatemanager);       
router.get('/candidatemanager',verifyToken , candidatemanagerController.getAllcandidatemanagers);        
router.get('/candidatemanager/:id',verifyToken , candidatemanagerController.getcandidatemanagerById);     
router.put('/candidatemanager/:id',verifyToken , candidatemanagerController.updatecandidatemanager);      
router.delete('/candidatemanager/:id',verifyToken , candidatemanagerController.deletecandidatemanager);   

module.exports = router;
