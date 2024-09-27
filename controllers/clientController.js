const Client = require('../models/Client');
const upload = require('../config/multer'); // Ensure you import multer config



// Create a new client
exports.createClient = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const clientLogo = req.file ? req.file.filename : null; // Access the uploaded file
        const {
            organizationName,
            clientId,
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
            loginRequired,
        } = req.body;

        try {
            const newClient = await Client.create({
                organizationName,
                clientId,
                registeredAddress,
                state,
                stateCode,
                gstNumber,
                tat,
                serviceAgreementDate,
                clientProcedure,
                agreementPeriod,
                customTemplate,
                clientLogo, // Store the logo filename/path
                accountManagement,
                packageOptions,
                scopeOfServices,
                pricingPackages,
                loginRequired,
            });

            res.status(201).json({ message: 'Client created successfully', client: newClient });
        } catch (error) {
            console.error('Database Error:', error); // Log the error
            res.status(500).json({ message: 'Error creating client', error: error.message });
        }
    });
};


// Fetch all clients
exports.getClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.status(200).json(clients);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching clients', error: err.message });
    }
};

// Fetch a single client by ID
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching client', error: err.message });
    }
};

// Update a client
exports.updateClient = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const clientId = req.params.id;
        const clientLogo = req.file ? req.file.filename : null; // Access the uploaded file

        try {
            const client = await Client.findByPk(clientId);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            // Update fields, including clientLogo if a new one is uploaded
            await client.update({
                ...req.body,
                clientLogo: clientLogo || client.clientLogo, // Retain old logo if no new one is uploaded
            });

            res.status(200).json({ message: 'Client updated successfully', client });
        } catch (error) {
            res.status(500).json({ message: 'Error updating client', error: error.message });
        }
    });
};

// Delete a client
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.destroy();
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting client', error: err.message });
    }
};
