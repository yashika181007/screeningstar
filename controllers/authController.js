const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AdminLoginLog = require('../models/AdminLoginLog'); 
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { saveImage } = require('../config/imageSave'); // Adjust path as needed

const { addTokenToBlacklist } = require('../config/blacklist');

const generatePassword = (length = 8) => {
    if (length < 8) {
        throw new Error('Password length should be at least 8 to meet the requirements.');
    }

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numericChars = '0123456789';
    const specialChars = '@#_'; 

    const passwordArray = [
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)] // First character must be uppercase
    ];

    passwordArray.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    passwordArray.push(numericChars[Math.floor(Math.random() * numericChars.length)]);
    passwordArray.push(specialChars[Math.floor(Math.random() * specialChars.length)]);

    const allChars = `${lowercaseChars}${uppercaseChars}${numericChars}${specialChars}`;
    for (let i = passwordArray.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        passwordArray.push(allChars[randomIndex]);
    }

    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
};

exports.createuser = async (req, res) => {
    try {
        // Log request body and files
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);

        const { employeeName, employeeMobile, email, designation, password, role, status = 'Active' } = req.body;
        let employeePhoto; // Declare employeePhoto

        // Check if an image file is present in the request
        if (req.files?.image && req.files.image.length > 0) {
            const targetDir = path.join(__dirname, '..', 'uploads'); // Define the upload directory
            employeePhoto = await saveImage(req.files.image[0], targetDir); // Save the image and get the path
            console.log('Image Saved at Path:', employeePhoto);
        } else {
            console.log('No image provided.'); // Log if no image
        }

        // Check if the email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        console.log('Hashing the password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully.');

        // Create a new user, including employeePhoto only if it's defined
        const newUser = await User.create({
            ...(employeePhoto && { employeePhoto }), // Only include employeePhoto if it has a value
            employeeName,
            employeeMobile,
            email,
            designation,
            password: hashedPassword,
            role,
            status,
        });

        // Log user creation success
        console.log('Employee registered successfully:', newUser);
        return res.status(201).json({ message: 'Employee registered successfully', user: newUser });
    } catch (error) {
        // Log any errors
        console.error('Error registering employee:', error);
        return res.status(500).json({ message: 'Error registering employee', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('req.body',req.body);
        const user = await User.findOne({ where: { email } });

        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (!user) {
            await AdminLoginLog.create({
                email,
                status: 'Failed',
                message: 'Invalid email',
                ipAddress,
            });
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await AdminLoginLog.create({
                email,
                status: 'Failed',
                message: 'Invalid password',
                ipAddress,
            });
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '6h' });

        req.session.token = token;
        req.session.userid = user.id;
        req.session.userRole = user.role;
        req.session.isLoggedIn = true;
        req.session.email = user.email;

        const userData = {
            id: user.id,
            name: user.employeeName,
            email: user.email,
            role: user.role
        };
        console.log('userData',userData);
        await AdminLoginLog.create({
            email,
            status: 'Success',
            message: 'Login successful',
            ipAddress,
        });

        res.status(200).json({ message: 'Login successful', user: userData, token });

    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ message: 'Error logging in', error: err.message });
    }
};

exports.veriflogin = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        const userId = decoded.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Login verified', user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            alert('Token expired');
            return res.status(401).json({ success: false, message: 'Token expired' });
        }

        res.status(500).json({ success: false, message: 'Error verifying login', error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const client = await User.findOne({ where: { email } });
        if (!client) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const newPassword = generatePassword();
        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        await client.update({ password: encryptedPassword });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'yashikawebstep@gmail.com',
                pass: 'tnudhsdgcwkknraw'         
            },
        });

        const mailOptions = {
            from: 'yashikawebstep@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Dear ${email},\n\nGreetings of the day!!!\n\nWe welcome you to Screening Star Tracker.\n\nYour new password is: ${newPassword}\n\nThanks and Best Regards,\nScreening Star Management`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email', error: error.message });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({ message: 'New password sent to email' });
            }
        });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({ message: 'Error in processing request', error: error.message });
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
            return res.status(404).json({ message: 'No inactive Users found' });
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

exports.updateUser = async (req, res) => {  
        
        const {employeePhoto, employeeName, employeeMobile, email, designation, password, role, status } = req.body;
       
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }
      
            user.employeeName = employeeName || user.employeeName;
            user.employeeMobile = employeeMobile || user.employeeMobile;
            user.email = email || user.email;
            user.designation = designation || user.designation;
            user.role = role || user.role;
            user.employeePhoto = employeePhoto || user.employeePhoto;
            user.status = status || user.status;

            await user.save();

            res.status(200).json({ message: 'User updated successfully', user });

        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ message: 'Error updating user', error: error.message });
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

exports.changeUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = user.status === 'Active' ? 'Inactive' : 'Active';
        await user.save(); 

        res.status(200).json({ message: `User status changed to ${user.status}` });
    } catch (err) {
        res.status(500).json({ message: 'Error changing user status', error: err.message });
    }
};

exports.logout = (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]; 

        if (token) {
            addTokenToBlacklist(token); 
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Error while logging out.' });
            }
            res.status(200).json({ message: 'Logout successful.' });
        });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(400).json({ message: 'Error signing out', error: err.message });
    }
};
 
exports.downloadAdminLoginLogExcel = async (req, res) => {
    try {
        console.log('Fetching logs from AdminLoginLog...');
        const logs = await AdminLoginLog.findAll();

        if (!logs || logs.length === 0) {
            console.log('No logs found.');
            return res.status(404).json({ message: 'No logs found' });
        }

        console.log(`${logs.length} logs fetched successfully.`);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('AdminLoginLogs');
        console.log('Workbook and worksheet created.');

        worksheet.columns = [
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Message', key: 'message', width: 30 },
            { header: 'IP Address', key: 'ipAddress', width: 20 },
            { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];

        logs.forEach((log, index) => {
            console.log(`Adding row ${index + 1}: ${log.email}`);
            worksheet.addRow({
                email: log.email,
                status: log.status,
                message: log.message,
                ipAddress: log.ipAddress,
                timestamp: log.timestamp
            });
        });

        const exportDir = path.join(__dirname, '../exports');
        console.log('Export directory:', exportDir);

        if (!fs.existsSync(exportDir)) {
            console.log('Export directory does not exist. Creating...');
            fs.mkdirSync(exportDir, { recursive: true });
        } else {
            console.log('Export directory already exists.');
        }

        const filePath = path.join(exportDir, 'AdminLoginLogs.xlsx');
        console.log('Saving Excel file to:', filePath);

        await workbook.xlsx.writeFile(filePath);
        console.log('File saved successfully.');

        res.download(filePath, 'AdminLoginLogs.xlsx', (err) => {
            if (err) {
                console.error('Error during file download:', err);
                return res.status(500).json({ message: 'Error downloading the file' });
            }
            console.log('File download initiated successfully.');

            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting the file:', unlinkErr);
                } else {
                    console.log('File deleted after download.');
                }
            });
        });

    } catch (err) {
        console.error('Error fetching logs or creating Excel file:', err);
        res.status(500).json({ message: 'Error fetching logs or creating Excel file', error: err.message });
    }
};
