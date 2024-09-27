const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { uploaduserphoto } = require('../config/multer'); // Adjust the path to your multer file

// Route to create a user with photo upload
router.post('/createuser', uploaduserphoto, authController.createuser); // Add upload middleware here
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.get('/users/:id', authController.getUserById);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
