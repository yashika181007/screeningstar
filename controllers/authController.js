const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { uploaduserphoto } =require('../config/multer');
exports.createuser = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        try {
            const { employeeName, employeeMobile, email, designation, password, role } = req.body;
            const employeePhoto = req.file ? req.file.filename : null;

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
            });

            res.status(201).json({ message: 'Employee registered successfully', user: newUser });
        } catch (error) {
            res.status(500).json({ message: 'Error registering employee', error: error.message });
        }
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // Payload
            process.env.JWT_SECRET, // Secret key
            { expiresIn: '1h' } // Token expiration
        );


        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.employeeName,
                email: user.email,
                role: user.employeeMobile
                role: user.designation
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
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
            attributes: ['id', 'name', 'email']
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email'] 
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
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
