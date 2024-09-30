const Client = require('../models/Client');
const { clientlogoupload } = require('../config/multer');
const { Op } = require('sequelize');  
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

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
            loginRequired,
            status = 'Active' 
        } = req.body;

        try {
            const newClient = await Client.create({
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
exports.getActiveClients = async (req, res) => {
    try {
        const activeClients = await Client.findAll({
            where: { status: 'Active' }
        });

        console.log('Active Clients:', activeClients); // Log query result for debugging

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
            loginRequired,
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
                loginRequired,
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
            user: 'u510451310.dev123',
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
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            res.status(404).json({ message: 'Client not found3' });
        }

        await client.destroy();
        res.status(200).json({ message: 'Client deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).json({ message: 'Error deleting client', error: err.message });
        
    }
};
