const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const candidatemanagerController = require('../controllers/candidatemanagerController');
const digitalAVController = require('../controllers/digitalAVController');

router.post('/candidatemanager', verifyToken, candidatemanagerController.createcandidatemanager);
router.get('/candidatemanager', verifyToken, candidatemanagerController.getAllCandidateManagers);
router.get('/candidatemanager/:id', verifyToken, candidatemanagerController.getCandidateManagerById);
router.put('/candidatemanager/:id', verifyToken, candidatemanagerController.updateCandidateManager);
router.delete('/candidatemanager/:id', verifyToken, candidatemanagerController.deleteCandidateManager);

router.post('/digitalav',verifyToken, digitalAVController.createDigitalAV);
router.get('/digitalav',verifyToken, digitalAVController.getAllDigitalAV);
router.get('/digitalav/:id',verifyToken, digitalAVController.getDigitalAVById);
router.put('/digitalav/:id',verifyToken, digitalAVController.updateDigitalAV);
router.delete('/digitalav/:id',verifyToken, digitalAVController.deleteDigitalAV);

module.exports = router;
