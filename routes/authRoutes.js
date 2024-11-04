const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../config/verifyToken');

const upload = require('../config/multer');
const simpleGit = require('simple-git');
const path = require('path');

const git = simpleGit('uploads/'); // Set this to the path of your Git repository

router.post('/createuser', upload.single('employeePhoto'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = `uploads/${req.file.filename}`;

    try {
        // Ensure you're in the correct directory and have set up Git
        await git.add(filePath);
        await git.commit(`Auto-commit: Add new image ${req.file.filename}`);
        await git.push('origin', 'master');

        res.status(200).json({ message: 'File uploaded and pushed to GitHub', filePath });
    } catch (error) {
        console.error('Error pushing to GitHub:', error);
        return res.status(500).json({ message: 'Failed to push image to GitHub', error });
    }
});

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verif-login', verifyToken, authController.veriflogin);
// router.post('/createuser', upload.single('employeePhoto'),authController.createuser);
router.get('/download-admin-login-log-excel', verifyToken, authController.downloadAdminLoginLogExcel);

router.get('/users', verifyToken, authController.getAllUsers);
router.get('/users/active', verifyToken, authController.getActiveUsers);
router.get('/users/inactive', verifyToken, authController.getInactiveUsers);
router.get('/users/:id', verifyToken, authController.getUserById);
router.put('/users/:id', verifyToken, authController.updateUser);
router.delete('/users/:id', verifyToken, authController.deleteUser);
router.put('/users/status/:id', verifyToken, authController.changeUserStatus);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
