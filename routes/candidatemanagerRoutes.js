const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const candidatemannagerController = require('../controllers/candidatemannagerController');

router.post('/candidatemanager', verifyToken ,candidatemannagerController.createcandidatemanager);       
router.get('/candidatemanager',verifyToken , candidatemannagerController.getAllcandidatemanagers);        
router.get('/candidatemanager/:id',verifyToken , candidatemannagerController.getcandidatemanagerById);     
router.put('/candidatemanager/:id',verifyToken , candidatemannagerController.updatecandidatemanager);      
router.delete('/candidatemanager/:id',verifyToken , candidatemannagerController.deletecandidatemanager);   

module.exports = router;
