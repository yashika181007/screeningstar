const Client = require('../models/Client');
const Branch = require('../models/Branch');
const BranchLoginLog = require('../models/BranchLoginLog');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');

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
            agreementPeriod, customTemplate, accountManagement, packageOptions,
            scopeOfServices, pricingPackages, standardProcess, loginRequired, username2, role,
            status = 'Active', branches, clientSpoc, escalationManager, billingSpoc,
            billingEscalation, authorizedPerson
        } = req.body;

        const plainPassword = generatePassword();
        const encryptedPassword = encrypt(plainPassword); 
        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) return res.status(400).json({ message: 'Email already in use' });

        const newClient = await Client.create({
            user_id, clientLogo, organizationName, clientId, mobileNumber, email,
            registeredAddress, state, stateCode, gstNumber, tat, serviceAgreementDate,
            clientProcedure, agreementPeriod, customTemplate, accountManagement,
            packageOptions, scopeOfServices, pricingPackages, standardProcess,
            loginRequired, username2, role, status, branches, password: encryptedPassword, // Save encrypted password
            totalBranches: (branches ? branches.length : 0) + 1,
            clientSpoc, escalationManager, billingSpoc, billingEscalation, authorizedPerson
        });

        await Branch.create({
            clientId: newClient.clientId,
            user_id,
            branchEmail: email,
            branchName: organizationName,
            isHeadBranch: true,
            password: encryptedPassword 
        });

        const branchPasswords = {};

        console.log("Branches received:", branches);

        if (branches && branches.length > 0) {
            const branchPromises = branches.map(async (branch) => {
                const { branchEmail, branchName } = branch;

                if (!branchEmail || !branchName) {
                    console.error("Branch email or name is missing for branch:", branch);
                    throw new Error("Branch email or name is missing");
                }

                console.log("Creating branch for email:", branchEmail);

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

        const clientMailOptions = {
            from: 'yashikawebstep@gmail.com',
            to: email,
            subject: `Welcome , ${email}`,
            text: `Hello ${organizationName},\n\nYour client account has been successfully created.\n\nHere are your login details:\n\nEmail: ${email}\nPassword:  ${plainPassword}\n\nPlease keep your password secure.\n\nBest regards,\nYour Screeningstar Team`
        };

        transporter.sendMail(clientMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to client:', error);
            } else {
                console.log('Client email sent: ' + info.response);
            }
        });

        for (const branchEmail in branchPasswords) {
            const branchMailOptions = {
                from: 'yashikawebstep@gmail.com',
                to: branchEmail,
                subject: `Welcome, ${branchEmail}`,
                text: `Hello,\n\nYour branch account for ${organizationName} has been successfully created.\n\nHere are your login details:\n\nEmail: ${branchEmail}\nPassword: ${branchPasswords[branchEmail]}\n\nPlease keep your password secure.\n\nBest regards,\nYour Screeningstar Team`
            };
        
            transporter.sendMail(branchMailOptions, (error, info) => {
                if (error) {
                    console.error(`Error sending email to branch ${branchEmail}:`, error);
                } else {
                    console.log(`Branch email sent to ${branchEmail}: ` + info.response);
                }
            });
        }

        res.status(201).json({
            message: 'Client and branches created successfully',
            client: {
                id: newClient.id,
                organizationName: newClient.organizationName,
                email: newClient.email,
                status: newClient.status,
                password: plainPassword,
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
    }catch (error) {
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
        const getbranch = await Branch.findAll({
            where: { id: req.params.id }
        });

        if (!getbranch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        res.status(200).json(getbranch);

    } catch (err) {
        console.error('Error fetching client:', err);
        res.status(500).json({ message: 'Error fetching client', error: err.message });
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
        console.log('Request ID:', req.params.id);  // Log the client ID from the request
        const client = await Client.findByPk(req.params.id);
        console.log('Client:', client);  // Log the client object

        if (!client) {
            console.log('Client not found');  // Log if the client is not found
            return res.status(404).json({ message: 'Client not found' });
        }

        console.log('Current Status:', client.status);  // Log the current status of the client

        if (client.status === 'Active') {
            client.status = 'Inactive';
            console.log('Changing status to Inactive');  // Log status change to Inactive
        } else if (client.status === 'Inactive') {
            client.status = 'Active';
            console.log('Changing status to Active');  // Log status change to Active
        }

        await client.save();
        console.log('Client status saved:', client.status);  // Log the saved status

        res.status(200).json({ message: `Client status changed to ${client.status}` });
    } catch (err) {
        console.log('Error:', err.message);  // Log the error message
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
        packageOptions,
        scopeOfServices,
        pricingPackages,
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
            packageOptions,
            scopeOfServices,
            pricingPackages,
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
