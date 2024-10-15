const Client = require('../models/Client');
const Branch = require('../models/Branch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const generatePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

const branchPasswords = {};

exports.createClient = async (req, res) => {
    try {
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

        const user_id = decodedToken.id;
        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        const {
            clientLogo,
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
            accountManagement,
            packageOptions,
            scopeOfServices,
            pricingPackages,
            standardProcess,
            loginRequired,
            role,
            status = 'Active',
            branches
        } = req.body;

        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const newClient = await Client.create({
            user_id,
            clientLogo,
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
            accountManagement,
            packageOptions,
            scopeOfServices,
            pricingPackages,
            standardProcess,
            loginRequired,
            role,
            status,
            password: hashedPassword,
            totalBranches: (branches ? branches.length : 0) + 1
        });

        branchPasswords[email] = plainPassword;
        await Branch.create({
            clientId: newClient.clientId,
            user_id,
            branchEmail: email,
            branchName: organizationName,
            isHeadBranch: true,
            password: hashedPassword
        });

        if (branches && branches.length > 0) {
            const branchPromises = branches.map(async (branch) => {
                const { branchEmail, branchName } = branch;
                const branchPassword = generatePassword();
                branchPasswords[branchEmail] = branchPassword;
                const hashedBranchPassword = await bcrypt.hash(branchPassword, 10);
                return await Branch.create({
                    clientId: newClient.clientId,
                    user_id,
                    branchEmail,
                    branchName,
                    isHeadBranch: false,
                    password: hashedBranchPassword
                });
            });
            await Promise.all(branchPromises);
        }

        req.session.clientId = newClient.clientId;

        res.status(201).json({
            message: 'Client created successfully',
            client: newClient,
            plainPassword,
            branches: Object.keys(branchPasswords).map(email => ({
                branchEmail: email,
                password: branchPasswords[email]
            }))
        });
    } catch (error) {
        console.error('Error creating client:', error);
        return res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};

exports.fetchPassword = async (req, res) => {
    try {
        const clientId = req.session.clientId;
        const { branchEmail } = req.body;

        if (!branchEmail || !clientId) {
            return res.status(400).json({ message: 'Email and Client ID are required' });
        }

        const client = await Branch.findOne({
            where: { branchEmail, clientId }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found with the provided email and client ID' });
        }

        const plainPassword = branchPasswords[branchEmail];

        if (!plainPassword) {
            return res.status(404).json({ message: 'Password not found for the provided branch email' });
        }

        res.status(200).json({
            message: 'Branch found',
            email: client.branchEmail,
            plainPassword
        });

    } catch (error) {
        console.error('Error fetching client password:', error);
        res.status(500).json({ message: 'Error fetching client password', error: error.message });
    }
};

exports.loginClient = async (req, res) => {
    try {
        const { branchEmail, password } = req.body;

        const branch = await Branch.findOne({ where: { branchEmail } });
        if (!branch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, branch.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: branch.id, user_id: branch.user_id, clientId: branch.clientId, branchEmail: branch.branchEmail },
            process.env.jwtSecret,
            { expiresIn: '6h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            branch: {
                id: branch.id,
                branchEmail: branch.branchEmail,
                organizationName: branch.organizationName, // Include any additional details if needed
                role: branch.role,
                status: branch.status
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
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
        const clientId = decoded.id;

        // Find the branch using the client ID (decoded from the JWT)
        const branch = await Branch.findByPk(clientId);
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
        role,
        status
    } = req.body;

    try {
        const client = await Client.findByPk(req.params.id);  // Marking the function as async makes 'await' valid
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
