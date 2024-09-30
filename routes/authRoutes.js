const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../config/verifyToken');

router.post('/createuser', verifyToken, authController.createuser);
router.post('/login', authController.login);
router.get('/users', verifyToken, authController.getAllUsers);
router.get('/users/active', verifyToken, authController.getActiveUsers);
router.get('/users/inactive', verifyToken, authController.getInactiveUsers);
router.get('/users/:id', verifyToken, authController.getUserById);
router.put('/users/:id', verifyToken, authController.updateUser);
router.delete('/users/:id', verifyToken, authController.deleteUser);
router.put('/block/:id', authController.changeUserStatus);

module.exports = router;
