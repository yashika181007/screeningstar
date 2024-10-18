const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../config/verifyToken');

router.post('/login',  authController.login);
router.post('/verif-login', verifyToken, authController.veriflogin);
router.post('/createuser', authController.createuser);
router.post('/clients/forgot-password',verifyToken, clientController.forgotPassword);
router.get('/users', verifyToken, authController.getAllUsers);
router.get('/users/active', verifyToken, authController.getActiveUsers);
router.get('/users/inactive', verifyToken, authController.getInactiveUsers);
router.get('/users/:id', verifyToken, authController.getUserById);
router.put('/users/:id', verifyToken, authController.updateUser);
router.delete('/users/:id', verifyToken, authController.deleteUser);
router.put('/users/status/:id',verifyToken, authController.changeUserStatus);
router.post('/logout',verifyToken, authController.logout);

module.exports = router;
