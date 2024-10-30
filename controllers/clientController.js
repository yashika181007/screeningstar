const Client = require('../models/Client');
const Branch = require('../models/Branch');
const ClientManager = require('../models/ClientManager');
const BranchLoginLog = require('../models/BranchLoginLog');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Sequelize, Op } = require('sequelize');
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');
const path = require('path');

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText) {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

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

exports.createClient = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'No token provided. Please log in.' });

        const tokenParts = token.split(' ');
        if (tokenParts.length !== 2) return res.status(401).json({ message: 'Token format incorrect. Please log in.' });

        const jwtToken = tokenParts[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const user_id = decodedToken.id;
        if (!user_id) return res.status(401).json({ message: 'User not authenticated. Please log in.' });

        const {
            clientLogo, organizationName, clientId, mobileNumber, email, registeredAddress,
            state, stateCode, gstNumber, tat, serviceAgreementDate, clientProcedure,
            agreementPeriod, customTemplate, accountManagement,
            scopeOfServices, standardProcess, loginRequired, username2, role,
            status = 'Active', branches, clientSpoc, escalationManager, billingSpoc,
            billingEscalation, authorizedPerson
        } = req.body;

        const plainPassword = generatePassword();
        const encryptedPassword = encrypt(plainPassword);

        // Generate password for secondary user (username2) only if it exists
        let secondaryPassword, encryptedSecondaryPassword;
        if (username2) {
            secondaryPassword = generatePassword();
            encryptedSecondaryPassword = encrypt(secondaryPassword);
            console.log('encryptedSecondaryPassword',encryptedSecondaryPassword)
        }

        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) return res.status(400).json({ message: 'Email already in use' });

        // Create the new client and save the secondary password if username2 exists
        const newClient = await Client.create({
            user_id, clientLogo, organizationName, clientId, mobileNumber, email,
            registeredAddress, state, stateCode, gstNumber, tat, serviceAgreementDate,
            clientProcedure, agreementPeriod, customTemplate, accountManagement,
            scopeOfServices, standardProcess,
            loginRequired, username2, role, status, branches, password: encryptedPassword,
             secondaryPassword: encryptedSecondaryPassword ,
            totalBranches: (branches ? branches.length : 0) + 1,
            clientSpoc, escalationManager, billingSpoc, billingEscalation, authorizedPerson
        });
console.log('newClient',newClient)
        await Branch.create({
            clientId: newClient.clientId,
            user_id,
            branchEmail: email,
            branchName: organizationName,
            isHeadBranch: true,
            password: encryptedPassword
        });

        const branchPasswords = {};
        if (branches && branches.length > 0) {
            const branchPromises = branches.map(async (branch) => {
                const { branchEmail, branchName } = branch;
                const branchPassword = generatePassword();
                const encryptedBranchPassword = encrypt(branchPassword);
                branchPasswords[branchEmail] = branchPassword;

                return await Branch.create({
                    clientId: newClient.clientId,
                    user_id,
                    branchEmail,
                    branchName,
                    isHeadBranch: false,
                    password: encryptedBranchPassword
                });
            });
            await Promise.all(branchPromises);
        }

        req.session.clientId = newClient.clientId;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'yashikawebstep@gmail.com',
                pass: 'tnudhsdgcwkknraw'
            },
        });
        const APP_PATH = 'http://screeningstar.in';

        const clientMailOptions = {
            from: 'yashikawebstep@gmail.com',
            to: email,
            subject: `Welcome to "Track Master" Verification Portal presented by "ScreeningStar Solutions Pvt Ltd`,
            html: `
                <div>Dear <span>${organizationName}</span>,</div><br>
                <div>Greetings!!!!</div><br>
                <div>A warm welcome to <strong>"Track Master Background Verification Portal".</strong></div><br>
                <div><h3>Login Details:</h3></div>
                <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                    <tr style="background-color: #ffd3d3;">
                        <th style="padding: 10px; border: 1px solid #000; text-align: center;">USER</th>
                        <th style="padding: 10px; border: 1px solid #000; text-align: center;">URL</th>
                        <th style="padding: 10px; border: 1px solid #000; text-align: center;">USERNAME</th>
                        <th style="padding: 10px; border: 1px solid #000; text-align: center;">PASSWORD</th>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;">Primary User</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;"><a href="https://webstepdev.com/demo/screening">https://webstepdev.com/demo/screening</a></td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;">${email}</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;">${plainPassword}</td>
                    </tr>
                    ${username2 ? `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;">Secondary User</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;"><a href="https://webstepdev.com/demo/screening">https://webstepdev.com/demo/screening</a></td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;">${username2}</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: center;">${secondaryPassword}</td>
                    </tr>
                    ` : ''}
                </table><br>
            `
        };

        transporter.sendMail(clientMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to client:', error);
            } else {
                console.log('Client email sent: ' + info.response);
            }
        });

        res.status(201).json({
            message: 'Client and branches created successfully',
            client: {
                id: newClient.id,
                organizationName: newClient.organizationName,
                email: newClient.email,
                status: newClient.status,
                password: plainPassword,
                ...(username2 && { secondaryPassword }), // Include secondary password in the response if username2 exists
                branches: Object.keys(branchPasswords).map(branchEmail => ({
                    branchEmail,
                    password: branchPasswords[branchEmail]
                }))
            }
        });

    } catch (error) {
        console.error('Error creating client:', error);
        return res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};

exports.fetchPassword = async (req, res) => {
    try {
        console.log('Incoming request body:', req.body);

        const { branchEmail } = req.body;

        console.log('Extracted branchEmail:', branchEmail);

        if (!branchEmail) {
            console.log('Validation failed: Branch email is required');
            return res.status(400).json({ message: 'Branch email is required' });
        }

        console.log('Querying the database for branch with email:', branchEmail);
        const branch = await Branch.findOne({
            where: { branchEmail }
        });

        console.log('Database query result:', branch);

        if (!branch) {
            console.log('Branch not found with the provided email');
            return res.status(404).json({ message: 'Branch not found with the provided email' });
        }

        console.log('Branch found, preparing to send response...');
        res.status(200).json({
            message: 'Branch found',
            branchEmail: branch.branchEmail,
            password: decrypt(branch.password)
        });

    } catch (error) {
        console.error('Error fetching branch password:', error);
        res.status(500).json({ message: 'Error fetching branch password', error: error.message });
    }
};

exports.loginClient = async (req, res) => {
    try {
        const { branchEmail, password } = req.body;
        console.log('req.body', req.body);

        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const branch = await Branch.findOne({ where: { branchEmail } });
        if (!branch) {
            console.log('Branch not found, logging failed attempt.');

            await BranchLoginLog.create({
                branchEmail,
                status: 'Failed',
                message: 'Invalid email',
                ipAddress,
            });
            console.log('Log entry created for failed email.');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const decryptedPassword = decrypt(branch.password);

        if (password !== decryptedPassword) {
            console.log('Password mismatch, logging failed attempt.');
            await BranchLoginLog.create({
                branchEmail,
                status: 'Failed',
                message: 'Invalid password',
                ipAddress,
            });
            console.log('Log entry created for failed password.');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: branch.id, user_id: branch.user_id, clientId: branch.clientId, branchEmail: branch.branchEmail },
            process.env.jwtSecret,
            { expiresIn: '6h' }
        );
        console.log('Login successful, logging successful login.');
        await BranchLoginLog.create({
            branchEmail,
            status: 'Success',
            message: 'Login successful',
            ipAddress,
        });
        console.log('Log entry created for successful login.');
        return res.status(200).json({
            message: 'Login successful',
            token,
            branch: {
                id: branch.id,
                branchEmail: branch.branchEmail,
                organizationName: branch.organizationName,
                role: branch.role,
                status: branch.status
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        console.log('Logging error attempt.');
        await BranchLoginLog.create({
            branchEmail: req.body.branchEmail || 'Unknown',
            status: 'Failed',
            message: `Error: ${error.message}`,
            ipAddress,
        });
        console.log('Log entry created for error.');
        return res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

exports.verifyLogin = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.jwtSecret);
        const branchId = decoded.id;

        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Login verified',
            branch: {
                id: branch.id,
                user_id: branch.user_id,
                clientId: branch.clientId,
                branchEmail: branch.branchEmail

            }
        });
    } catch (err) {
        console.error(err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }

        res.status(500).json({ success: false, message: 'Error verifying login', error: err.message });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { branchEmail } = req.body;

        const client = await Branch.findOne({ where: { branchEmail } });
        if (!client) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const newPassword = generatePassword();
        const encryptedPassword = encrypt(newPassword);

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
            to: branchEmail,
            subject: 'Password Reset Request',
            text: `Dear ${branchEmail},\n\nGreetings of the day!!!\n\nWe welcome you to Screening Star Tracker.\n\nYour new password is: ${newPassword}\n\nThanks and Best Regards,\nScreening Star Management`
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
exports.getBranchs = async (req, res) => {
    try {
        const Branchs = await Branch.findAll();
        res.status(200).json(Branchs);

    } catch (err) {
        console.error('Error fetching Branchs:', err);
        res.status(500).json({ message: 'Error fetching Branchs', error: err.message });

    }
};
exports.getheadbranch = async (req, res) => {
    try {
        const headBranches = await Branch.findAll({
            where: { isHeadBranch: true }
        });

        if (!headBranches || headBranches.length === 0) {
            return res.status(404).json({ message: 'No head branches found' });
        }

        res.status(200).json(headBranches);

    } catch (err) {
        console.error('Error fetching head branches:', err);
        res.status(500).json({ message: 'Error fetching head branches', error: err.message });
    }
};
exports.getHeadBranchWithClientManagerData = async (req, res) => {
    try {

        const headBranches = await Branch.findAll({
            where: { isHeadBranch: true },
            attributes: ['id', 'user_id', 'clientId', 'branchEmail', 'branchName', 'isHeadBranch']
        });

        if (!headBranches || headBranches.length === 0) {
            return res.status(404).json({ message: 'No head branches found' });
        }

        const responseData = [];

        for (const branch of headBranches) {
            const clientManagers = await ClientManager.findAll({
                where: {
                    branchId: branch.id,
                    status: { [Op.ne]: 'completed' }
                },
                attributes: ['id', 'user_id', 'clientId', 'branchId', 'organizationName', 'spocUploaded']
            });

            const applicationCount = clientManagers.length;

            if (applicationCount > 0) {
                req.session.branchId = branch.id;
                req.session.clientId = branch.clientId;
                console.log('Session created: Branch ID:', req.session.branchId);
                console.log('Session created: Client ID:', req.session.clientId);

                responseData.push({
                    branch: branch,
                    applicationCount: applicationCount,
                    clientManagers: clientManagers
                });
            }
        }

        if (responseData.length === 0) {
            return res.status(404).json({ message: 'No head branches with client managers found' });
        }
        res.status(200).json(responseData);

    } catch (err) {
        console.error('Error fetching head branches and client managers:', err);
        res.status(500).json({ message: 'Error fetching head branches and client managers', error: err.message });
    }
};
exports.getnonHeadBranchWithClientManagerData = async (req, res) => {
    try {
        const headBranches = await Branch.findAll({
            where: { isHeadBranch: false },
            attributes: ['id', 'user_id', 'clientId', 'branchEmail', 'branchName', 'isHeadBranch']
        });

        if (!headBranches || headBranches.length === 0) {
            return res.status(404).json({ message: 'No head branches found' });
        }
        const responseData = [];

        for (const branch of headBranches) {
            const clientManagers = await ClientManager.findAll({
                where: {
                    branchId: branch.id,
                    status: { [Op.ne]: 'completed' }
                },
                attributes: ['id', 'user_id', 'clientId', 'branchId', 'organizationName', 'spocUploaded']
            });

            const applicationCount = clientManagers.length;

            if (applicationCount > 0) {
                req.session.branchId = branch.id;
                req.session.clientId = branch.clientId;
                console.log('Session created: Branch ID:', req.session.branchId);
                console.log('Session created: Client ID:', req.session.clientId);

                responseData.push({
                    branch: branch,
                    applicationCount: applicationCount,
                    clientManagers: clientManagers
                });
            }
        }

        if (responseData.length === 0) {
            return res.status(404).json({ message: 'No head branches with client managers found' });
        }

        res.status(200).json(responseData);

    } catch (err) {
        console.error('Error fetching head branches and client managers:', err);
        res.status(500).json({ message: 'Error fetching head branches and client managers', error: err.message });
    }
};

exports.getNonHeadBranches = async (req, res) => {
    try {
        const clientId = req.params.clientId;

        const nonHeadBranches = await Branch.findAll({
            where: {
                clientId,
                isHeadBranch: false
            }
        });

        if (!nonHeadBranches || nonHeadBranches.length === 0) {
            return res.status(404).json({ message: 'No non-head branches found for the given client' });
        }

        res.status(200).json(nonHeadBranches);

    } catch (err) {
        console.error('Error fetching non-head branches:', err);
        res.status(500).json({ message: 'Error fetching non-head branches', error: err.message });
    }
};
exports.getBranchbyclient = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        // console.log('token', req.headers['authorization']);
        if (!token) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const tokenParts = token.split(' ');
        const jwtToken = tokenParts[1];

        let decodedToken;
        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const id = decodedToken.id;
        if (!id) {
            return res.status(401).json({ message: 'Id not authenticated. Please log in.' });
        }

        const branches = await Branch.findAll({
            where: { id: id }
        });
        if (!branches || branches.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        const clientId = branches[0].clientId;
        const client = await Client.findOne({
            where: { clientId: clientId },
            attributes: { exclude: ['password'] }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const branchData = branches.map(branch => {
            const { password, ...safeBranchData } = branch.dataValues;

            return {
                ...safeBranchData,
                client: client.dataValues
            };
        });

        res.status(200).json(branchData);
    } catch (err) {
        console.error('Error fetching branch and client data:', err);
        res.status(500).json({ message: 'Error fetching data', error: err.message });
    }
};

exports.updateBranch = async (req, res) => {
    const { id } = req.params;
    try {
        const updateBranch = await Branch.findByPk(id);
        if (!updateBranch) {
            return res.status(404).json({
                message: 'Branch not found',
            });
        }
        await updateBranch.update(req.body);
        return res.status(200).json({
            message: 'Branch updated successfully',
            data: updateBranch,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating Branch',
            error: error.message,
        });
    }
};
exports.deleteBranch = async (req, res) => {
    try {
        const deleteBranch = await Branch.findByPk(req.params.id);
        if (!deleteBranch) {
            return res.status(404).json({ message: 'Branch not found.' });
        }
        await deleteBranch.destroy();
        res.status(200).json({ message: 'Branch deleted successfully.' });
    } catch (error) {
        console.error('Error deleting Branch:', error);
        res.status(500).json({ message: 'Error deleting Branch.', error: error.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.status(200).json(clients);

    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'Error fetching clients', error: err.message });

    }
};
exports.getActiveClients = async (req, res) => {
    try {
        const activeClients = await Client.findAll({
            where: { status: 'Active' }
        });

        console.log('Active Clients:', activeClients);

        if (!activeClients || activeClients.length === 0) {
            return res.status(404).json({ message: 'No active clients found' });
        }

        res.status(200).json(activeClients);

    } catch (err) {
        console.error('Error fetching active clients:', err);
        res.status(500).json({ message: 'Error fetching active clients', error: err.message });
    }
};
exports.getInactiveClients = async (req, res) => {
    try {
        const inactive = await Client.findAll({
            where: { status: 'Inactive' }
        });

        console.log('Inactive Clients:', inactive);

        if (!inactive || inactive.length === 0) {
            return res.status(404).json({ message: 'No Inactive clients found' });
        }

        res.status(200).json(inactive);

    } catch (err) {
        console.error('Error fetching active clients:', err);
        res.status(500).json({ message: 'Error fetching active clients', error: err.message });
    }
};
exports.changeClientStatus = async (req, res) => {
    try {
        console.log('Request ID:', req.params.id);
        const client = await Client.findByPk(req.params.id);

        if (!client) {
            console.log('Client not found');
            return res.status(404).json({ message: 'Client not found' });
        }

        console.log('Client:', client);
        console.log('Current Status:', client.status);

        // Change status logic
        if (client.status === 'Active') {
            client.status = 'Inactive';
            console.log('Changing status to Inactive');
        } else if (client.status === 'Inactive') {
            client.status = 'Active';
            console.log('Changing status to Active');
        }

        await client.save();
        console.log('Client status saved:', client.status);

        res.status(200).json({ message: `Client status changed to ${client.status}` });
    } catch (err) {
        console.log('Error:', err.message);
        res.status(500).json({ message: 'Error changing client status', error: err.message });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);

    } catch (err) {
        console.error('Error fetching client:', err);
        res.status(500).json({ message: 'Error fetching client', error: err.message });
    }
};
exports.updateClient = async (req, res) => {
    const {
        organizationName,
        clientId,
        mobileNumber,
        email,
        registeredAddress,
        state,
        stateCode,
        gstNumber,
        tat,
        serviceAgreementDate,
        clientProcedure,
        agreementPeriod,
        customTemplate,
        clientLogo,
        accountManagement,
        scopeOfServices,
        standardProcess,
        loginRequired,
        username2,
        role,
        status
    } = req.body;

    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        await client.update({
            organizationName,
            clientId,
            mobileNumber,
            email,
            registeredAddress,
            state,
            stateCode,
            gstNumber,
            tat,
            serviceAgreementDate,
            clientProcedure,
            agreementPeriod,
            customTemplate,
            clientLogo,
            accountManagement,
            scopeOfServices,
            standardProcess,
            loginRequired,
            username2,
            role,
            status
        });
        res.status(200).json({ message: 'Client updated successfully', client });
    } catch (error) {
        console.error('Error updating Client:', error);
        return res.status(500).json({ message: 'Error updating Client', error: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }
        await client.destroy();
        res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Error deleting client.', error: error.message });
    }
};

exports.fetchdataforclientmanager = async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }
    const tokenParts = token.split(' ');
    const jwtToken = tokenParts[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
    const id = decodedToken.id;
    if (!id) {
        return res.status(401).json({ message: 'User not authenticated. Please log in.' });
    }

    try {
        const branches = await Branch.findAll({
            where: { id: id },
            attributes: ['id', 'user_id', 'clientId', 'branchName']
        });

        if (!branches || branches.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        const clientId = branches[0].clientId;
        const client = await Client.findOne({
            where: { clientId: clientId },
            attributes: ['scopeOfServices', 'clientId']
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const branchData = branches.map(branch => {
            const branchValues = branch.dataValues;
            return {
                ...branchValues,
                scopeOfServices: client.scopeOfServices,
                clientId: client.clientId
            };
        });

        res.status(200).json(branchData);
    } catch (err) {
        console.error('Error fetching branch and client data:', err);
        res.status(500).json({ message: 'Error fetching data', error: err.message });
    }
};
