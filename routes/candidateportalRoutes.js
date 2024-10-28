const express = require('express');
const candidateportalController = require('../controllers/candidateportalController');
const router = express.Router();

router.post('/candidateportal', candidateportalController.createCandidatePortal);
router.get('/:id', candidateportalController.getCandidatePortalById); 
router.get('/', candidateportalController.getAllCandidatePortals); 
router.put('/:id', candidateportalController.updateCandidatePortal);
router.delete('/:id', candidateportalController.deleteCandidatePortal); 

module.exports = router;
