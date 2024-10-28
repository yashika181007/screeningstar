const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const candidatemanagerController = require('../controllers/candidatemanagerController');

router.post('/candidatemanager', verifyToken, candidatemanagerController.createcandidatemanager);
router.post('/candidateportal', verifyToken, candidatemanagerController.getcandidateform);
router.get('/candidatemanager', verifyToken, candidatemanagerController.getAllCandidateManagers);
router.get('/candidatemanager/:id', verifyToken, candidatemanagerController.getCandidateManagerById);
router.put('/candidatemanager/:id', verifyToken, candidatemanagerController.updateCandidateManager);
router.delete('/candidatemanager/:id', verifyToken, candidatemanagerController.deleteCandidateManager);

module.exports = router;
