const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/users', authController.getAllUsers);      
router.get('/users/:id', authController.getUserById);   
router.put('/users/:id', authController.updateUser);   
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
