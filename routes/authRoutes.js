const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../config/verifyToken');

const upload = require('../config/multer');
const exec = require('child_process').exec; // To run shell commands
exec('git config --global user.email "yashikawebstep@gmail.com" && git config --global user.name "Yashika"', (err, stdout, stderr) => {
    if (err) {
        console.error('Error configuring Git user:', err);
        return;
    }
    console.log('Git user configured:', stdout);
    // Proceed with the Git add, commit, and push after setting user configuration
    exec(`git add -f ${filePath} && git commit -m "Auto-commit: Add new image ${req.file.filename}" && git push origin main`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error pushing to GitHub: ${error}`);
            return res.status(500).json({ message: 'Failed to push image to GitHub', error });
        }
        console.log('File pushed to GitHub:', stdout);
        res.status(200).json({ message: 'File uploaded and pushed to GitHub', filePath });
    });
});
// Upload and process image
router.post('/createuser', upload.single('employeePhoto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = `uploads/${req.file.filename}`;

    // Run the Git commands to add, commit, and push the uploaded file
    exec(`git add -f ${filePath} && git commit -m "Auto-commit: Add new image ${req.file.filename}" && git push origin main`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error pushing to GitHub: ${error}`);
            return res.status(500).json({ message: 'Failed to push image to GitHub', error });
        }

        console.log('File pushed to GitHub:', stdout);
        res.status(200).json({ message: 'File uploaded and pushed to GitHub', filePath });
    });
});
router.post('/login',  authController.login);
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
router.put('/users/status/:id',verifyToken, authController.changeUserStatus);
router.post('/logout',verifyToken, authController.logout);

module.exports = router;
