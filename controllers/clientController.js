const Client = require('../models/Client');
const { clientlogoupload } = require('../config/multer');
const { Op } = require('sequelize');  

exports.createClient = (req, res) => {
    clientlogoupload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            res.status(400).json({ message: 'File upload error', error: err });
            
        }

        if (!req.file) {
            res.status(400).json({ message: 'File upload failed or no file provided' });
            
        }

        const clientLogo = req.file.uploadedFileName1 ? `${req.file.uploadedFileName1}` : null;

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
            status = 'Active' 
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
                clientLogo, 
                accountManagement,
                packageOptions,
                scopeOfServices,
                pricingPackages,
                loginRequired,
                status,
            });

            res.status(201).json({ message: 'Client created successfully', client: newClient });
            
        } catch (error) {
            console.error('Database Error:', error);
            res.status(500).json({ message: 'Error creating client', error: error.message });
            
        }
    });
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

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
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
            res.status(400).json({ message: 'File upload error', error: err });
            
        }

        const clientLogo = req.file ? req.file.filename : null;

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
            loginRequired
        } = req.body;

        try {
            const client = await Client.findByPk(req.params.id);

            await client.update({
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
                clientLogo: clientLogo || client.clientLogo,
                accountManagement,
                packageOptions,
                scopeOfServices,
                pricingPackages,
                loginRequired
            });

            res.status(200).json({ message: 'Client updated successfully', client });
            
        } catch (error) {
            console.error('Database Error:', error);
            res.status(500).json({ message: 'Error updating client', error: error.message });
            
        }
    });
};
exports.getActiveClients = async (req, res) => {
    try {
        const activeClients = await Client.findAll({
            where:{ status: 'Active' }
        });

        if (!activeClients || activeClients.length === 0) {
            return res.status(404).json({ message: 'No active clients found' });
        }else{
            res.status(200).json(activeClients);
        }       
    } catch (err) {
        console.error('Error fetching active clients:', err);
        res.status(500).json({ message: 'Error fetching active clients', error: err.message });
    }
};

exports.getInactiveClients = async (req, res) => {
    try {
        const inactive = await Client.findAll({
            where:{ status: 'In Active' }
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
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);        
        await client.destroy();
        res.status(200).json({ message: 'Client deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).json({ message: 'Error deleting client', error: err.message });
        
    }
};
