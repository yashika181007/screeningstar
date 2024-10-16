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

exports.createClient = async (req, res) => {
    try {
        // Extract token from the Authorization header
        const token = req.headers['authorization'];
        console.log('Authorization header:', token);

        if (!token) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const tokenParts = token.split(' ');
        if (tokenParts.length !== 2) {
            return res.status(401).json({ message: 'Token format incorrect. Please log in.' });
        }

        const jwtToken = tokenParts[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
            console.log('Decoded Token:', decodedToken);
        } catch (err) {
            console.error('JWT verification error:', err);
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const user_id = decodedToken.id;
        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        // Destructure request body
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
            Branches,  // Branches array from body
            clientSpoc,
            escalationManager,
            billingSpoc,
            billingEscalation,
            authorizedPerson
        } = req.body;

        // Log the branch data from request body
        console.log('Received Branches data from body:', Branches);

        // Generate a password for the client
        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        console.log('Generated plain password:', plainPassword);
        console.log('Hashed password:', hashedPassword);

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
            Branches,
            password: hashedPassword,
            totalBranches: (Branches ? Branches.length : 0) + 1,
            clientSpoc,
            escalationManager,
            billingSpoc,
            billingEscalation,
            authorizedPerson
        });

        console.log('New Client Created:', newClient);

        // Create the head branch for the client
        try {
            const headBranchData = {
                clientId: newClient.clientId,
                user_id,
                branchEmail: email,
                branchName: organizationName,
                isHeadBranch: true,
                password: hashedPassword
            };
            console.log('Head branch data:', headBranchData);

            await Branch.create(headBranchData);
            console.log('Head branch created for client:', newClient.clientId);
        } catch (error) {
            console.error('Error creating head branch:', error);
        }

        const branchPasswords = {};

        // Create additional Branches if any
        if (Branches && Branches.length > 0) {
            try {
                const branchPromises = Branches.map(async (branch) => {
                    const { branchEmail, branchName } = branch;
                    console.log('branch:', branch);
                    const branchPassword = generatePassword();
                    const hashedBranchPassword = await bcrypt.hash(branchPassword, 10);

                    const branchData = {
                        clientId: newClient.clientId,
                        user_id,
                        branchEmail,
                        branchName,
                        isHeadBranch: false,
                        password: hashedBranchPassword
                    };
                    console.log('Branch data:', branchData);

                    branchPasswords[branchEmail] = branchPassword;

                    return await Branch.create(branchData);
                });

                await Promise.all(branchPromises);
                console.log('All Branches created for client:', newClient.clientId);
            } catch (error) {
                console.error('Error creating additional Branches:', error);
            }
        }

        req.session.clientId = newClient.clientId;

        res.status(201).json({
            message: 'Client created successfully',
            client: {
                id: newClient.id,
                organizationName: newClient.organizationName,
                email: newClient.email,
                status: newClient.status,
                password: plainPassword,
                Branches: Object.keys(branchPasswords).map(branchEmail => ({
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
        const { branchEmail } = req.body;

        if (!branchEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const branch = await Branch.findOne({
            where: { branchEmail }
        });

        if (!branch) {
            return res.status(404).json({ message: 'Branch not found with the provided email' });
        }

        res.status(200).json({
            message: 'Branch found',
            email: branch.branchEmail,

            password: branch.password
        });

    } catch (error) {
        console.error('Error fetching branch password:', error);
        res.status(500).json({ message: 'Error fetching branch password', error: error.message });
    }
};

exports.loginClient = async (req, res) => {
    try {
        const { branchEmail, password } = req.body;

        const branch = await Branch.findOne({ where: { branchEmail } });
        if (!branch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log("Received password:", password);
        console.log("Stored password format:", branch.password);

        let isMatch = false;

        if (password === branch.password) {
            isMatch = true;
        } else {
            isMatch = await bcrypt.compare(password, branch.password);
        }
        console.log("Password match result:", isMatch);

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
                organizationName: branch.organizationName,
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
exports.getBranchbyclient = async (req, res) => {
    try {
        const getbranch = await Branch.findAll({
            where: { clientId: req.params.clientId }
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
