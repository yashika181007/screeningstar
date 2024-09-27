const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/createuser', userController.createuser);
router.post('/login', userController.login);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
module.exports = router;
