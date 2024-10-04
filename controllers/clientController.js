const jwt = require('jsonwebtoken'); 
const Client = require('../models/Client'); 

exports.createClient = async (req, res) => {  
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
        status = 'Active' 
    } = req.body;
       console.log('req.body',req.body)
    // Basic validation for required fields
    if (!organizationName || !clientId || !standardProcess || !role) {
        return res.status(400).json({
            message: 'Please provide organizationName, clientId, standardProcess, and role.'
        });
    }

    try {
        const newClient = await Client.create({
            user_id,
            clientLogo,
            organizationName,
            clientId,
            mobileNumber,
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
        });

        res.status(201).json({ message: 'Client created successfully', client: newClient });
        console.log('newClient',newClient)
        
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ message: 'Error creating client', error: error.message });
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
        if (!inactive || inactive.length === 0) {
            res.status(404).json({ message: 'No inactive clients found' });
            
        }
        res.status(200).json(inactive);
    } catch (err) {
        console.error('Error fetching inactive clients:', err);
        res.status(500).json({ message: 'Error fetching inactive clients', error: err.message });
        
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

exports.updateClient = (req, res) => {
    clientlogoupload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const {
            organizationName,
            clientId,
            mobileNumber,
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
            status
        } = req.body;

        try {
            const client = await Client.findByPk(req.params.id);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            const newClientLogo = req.file ? req.file.uploadedFileName1 : null;

            if (newClientLogo) {
                if (client.clientLogo) {
                    const oldRemotePath = `demo/screening_star/uploads/${client.clientLogo}`;
                    await deleteFromRemote(oldRemotePath);
                }
            }

            await client.update({
                organizationName,
                clientId,
                mobileNumber,
                registeredAddress,
                state,
                stateCode,
                gstNumber,
                tat,
                serviceAgreementDate,
                clientProcedure,
                agreementPeriod,
                customTemplate,
                clientLogo: newClientLogo || client.clientLogo, 
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
            console.error('Database Error:', error);
            return res.status(500).json({ message: 'Error updating client', error: error.message });
        }
    });
};

const deleteFromRemote = async (remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: 'ftp.webstepdev.com',
            Client: 'u510451310.dev123',
            password: 'Webs@0987#@!',
            secure: false
        });

        console.log('Connected to FTP server');
        await client.remove(remotePath);  // Deleting the old logo from the FTP server
        console.log('Old logo deleted:', remotePath);
        
    } catch (err) {
        console.error('Error deleting file from FTP:', err);
        throw err;
        
    } finally {
        client.close();
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await Client.findByPk(clientId); 

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
exports.changeClientStatus = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        if (client.status === 'Active') {
            client.status = 'Inactive';
        } else if (client.status === 'Inactive') {
            client.status = 'Active';
        }

        await client.save();

        res.status(200).json({ message: `Client status changed to ${client.status}` });
    } catch (err) {
        res.status(500).json({ message: 'Error changing client status', error: err.message });
    }
};
