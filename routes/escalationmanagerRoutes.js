const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const escalationmanagerController = require('../controllers/escalationmanagerController');

router.post('/escalationmanager',verifyToken ,escalationmanagerController.createescalationmanager);
router.get('/escalationmanager',verifyToken, escalationmanagerController.getAllescalationmanager);
router.get('/escalationmanager/:id',verifyToken, escalationmanagerController.getallescalationmanagerById);
router.put('/escalationmanager/:id',verifyToken, escalationmanagerController.updateescalationmanager);
router.delete('/escalationmanager/:id',verifyToken, escalationmanagerController.deleteescalationmanager);

module.exports = router;
