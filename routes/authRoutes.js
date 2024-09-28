const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/createuser', authController.createuser);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers,authenticateToken);
router.get('/users/:id', authController.getUserById,authenticateToken);
router.put('/users/:id', authController.updateUser,authenticateToken);
router.delete('/users/:id', authController.deleteUser,authenticateToken);
module.exports = router;
