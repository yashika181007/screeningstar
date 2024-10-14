const express = require('express');
const router = express.Router();
const verifyToken = require('../config/verifyToken');
const authorizeddetailsController = require('../controllers/authorizeddetailsController');

router.post('/authorizeddetails',verifyToken ,authorizeddetailsController.createAuthorizedDetails);
router.get('/authorizeddetails',verifyToken, authorizeddetailsController.getAllAuthorizedDetails);
router.get('/authorizeddetails/:id',verifyToken, authorizeddetailsController.getallAuthorizedDetailsById);
router.put('/AuthorizedDetails/:id',verifyToken, authorizeddetailsController.updateAuthorizedDetails);
router.delete('/AuthorizedDetails/:id',verifyToken, authorizeddetailsController.deleteAuthorizedDetails);

module.exports = router;
