const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const candidatemanagerController = require('../controllers/candidatemanagerController');

router.post('/candidatemanager', verifyToken, candidatemanagerController.createcandidatemanager);
router.get('/candidatemanager', verifyToken, candidatemanagerController.getAllCandidateManagers);
router.get('/candidatemanager/:id', verifyToken, candidatemanagerController.getCandidateManagerById);
router.put('/candidatemanager/:id', verifyToken, candidatemanagerController.updateCandidateManager);
router.delete('/candidatemanager/:id', verifyToken, candidatemanagerController.deleteCandidateManager);

router.post('/digitalav',verifyToken, candidatemanagerController.createDigitalAV);
router.get('/digitalav',verifyToken, candidatemanagerController.getAllDigitalAV);
router.get('/digitalav/:id',verifyToken, candidatemanagerController.getDigitalAVById);
router.put('/digitalav/:id',verifyToken, candidatemanagerController.updateDigitalAV);
router.delete('/digitalav/:id',verifyToken, candidatemanagerController.deleteDigitalAV);

module.exports = router;
