const express = require('express');
const candidateportalController = require('../controllers/candidateportalController');
const router = express.Router();

router.post('/candidateportal', candidateportalController.createCandidatePortal);
router.get('/candidateportal/:id', candidateportalController.getCandidatePortalById); 
router.get('/candidateportal', candidateportalController.getAllCandidatePortals); 
router.put('/candidateportal/:id', candidateportalController.updateCandidatePortal);
router.delete('/candidateportal/:id', candidateportalController.deleteCandidatePortal); 

module.exports = router;
