
const Client = require('../models/Client');
const upload = require('../config/multer'); // import multer config

// Create a new client
exports.createClient = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading file', error: err });
        }

        // Access the file path from req.file if the upload is successful
        const clientLogo = req.file ? req.file.filename : null;

        try {
            const newClient = await Client.create({
                ...req.body,
                clientLogo: clientLogo, // Store the filename in the DB
            });
            res.status(201).json(newClient);
        } catch (err) {
            res.status(400).json({ message: 'Error creating client', error: err.message });
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
exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.update(req.body);
        res.status(200).json(client);
    } catch (err) {
        res.status(400).json({ message: 'Error updating client', error: err.message });
    }
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
        res.status(400).json({ message: 'Error deleting client', error: err.message });
    }
};
