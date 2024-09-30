const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/createuser', authController.createuser);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.get('/users/active', authController.getActiveUsers);
router.get('/users/inactive', authController.getInactiveUsers);
router.get('/users/:id', authController.getUserById);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);
module.exports = router;
