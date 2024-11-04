const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../config/verifyToken');

const upload = require('../config/multer');

router.post('/login',  authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verif-login', verifyToken, authController.veriflogin);
router.post('/createuser', upload.single('employeePhoto'),authController.createuser);
router.get('/download-admin-login-log-excel', verifyToken, authController.downloadAdminLoginLogExcel);

router.get('/users', verifyToken, authController.getAllUsers);
router.get('/users/active', verifyToken, authController.getActiveUsers);
router.get('/users/inactive', verifyToken, authController.getInactiveUsers);
router.get('/users/:id', verifyToken, authController.getUserById);
router.put('/users/:id', verifyToken, authController.updateUser);
router.delete('/users/:id', verifyToken, authController.deleteUser);
router.put('/users/status/:id',verifyToken, authController.changeUserStatus);
router.post('/logout',verifyToken, authController.logout);

module.exports = router;
