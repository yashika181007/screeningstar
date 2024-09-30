const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

const { uploaduserphoto } = require('../config/multer');
exports.createuser = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: 'File upload error', error: err });
        }
        try {
            const { employeeName, employeeMobile, email, designation, password, role, status = 'Active', } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: 'File upload failed or no file provided' });
            }

            const employeePhoto = req.file.uploadedFileName ? `${req.file.uploadedFileName}` : null;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                employeePhoto,
                employeeName,
                employeeMobile,
                email,
                designation,
                password: hashedPassword,
                role,
                status,
            });

            return res.status(201).json({ message: 'Employee registered successfully', user: newUser });
        } catch (error) {
            console.error('Error registering employee:', error);
            return res.status(500).json({ message: 'Error registering employee', error: error.message });
        }
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1h' });
        const userData = {
            id: user.id,
            name: user.employeeName,
            email: user.email,
            role: user.role
        };

        res.status(200).json({ token, user: userData });
    } catch (err) {
        res.status(400).json({ message: 'Error logging in', error: err.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'employeePhoto', 'employeeName', 'employeeMobile', 'email', 'designation', 'password', 'role']
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};
exports.getActiveUsers = async (req, res) => {
    try {
        const activeUsers = await User.findAll({
            where: { status: 'Active' }
        });

        console.log('Active Users:', activeUsers); 

        if (!activeUsers || activeUsers.length === 0) {
            return res.status(404).json({ message: 'No active Users found' });
        }

        res.status(200).json(activeUsers);

    } catch (err) {
        console.error('Error fetching active Users:', err);
        res.status(500).json({ message: 'Error fetching active Users', error: err.message });
    }
};
exports.getInactiveUsers = async (req, res) => {
    try {
        const inactive = await User.findAll({
            where: { status: 'Inactive' }
        });
        if (!inactive || inactive.length === 0) {
            res.status(404).json({ message: 'No inactive Users found' });
            
        }
        res.status(200).json(inactive);
        
    } catch (err) {
        console.error('Error fetching inactive Users:', err);
        res.status(500).json({ message: 'Error fetching inactive Users', error: err.message });
        
    }
};
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'employeePhoto', 'employeeName', 'employeeMobile', 'email', 'designation', 'password', 'role']
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
};

exports.updateUser = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const { employeeName, employeeMobile, email, designation, password, role, status } = req.body;
        const newEmployeePhoto = req.file ? req.file.uploadedFileName : null;

        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }
            if (newEmployeePhoto) {
                if (user.employeePhoto) {
                    const oldRemotePath = `demo/screening_star/uploads/${user.employeePhoto}`;
                    await deleteFromRemote(oldRemotePath); // Function to delete file from FTP
                }
            }
            user.employeeName = employeeName || user.employeeName;
            user.employeeMobile = employeeMobile || user.employeeMobile;
            user.email = email || user.email;
            user.designation = designation || user.designation;
            user.role = role || user.role;
            user.employeePhoto = newEmployeePhoto || user.employeePhoto;
            user.status = status || user.status;

            await user.save();

            res.status(200).json({ message: 'User updated successfully', user });

        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    });
};

const deleteFromRemote = async (remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: 'ftp.webstepdev.com',
            user: 'u510451310.dev123',
            password: 'Webs@0987#@!',
            secure: false
        });

        console.log('Connected to FTP server');
        await client.remove(remotePath);  // Deleting the old photo from the FTP server
        console.log('Old employee photo deleted:', remotePath);

    } catch (err) {
        console.error('Error deleting file from FTP:', err);
        throw err;

    } finally {
        client.close();
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
};
