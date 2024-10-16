const ClientManager = require('../models/ClientManager');  // Import the ClientManager model

// Create a new case upload
exports.createClientManager = async (req, res) => {
    try {
        const newCase = await ClientManager.create(req.body);
        return res.status(201).json({
            message: 'Case uploaded successfully',
            data: newCase,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error creating case upload',
            error: error.message,
        });
    }
};

// Get all case uploads
exports.getAllClientManagers = async (req, res) => {
    try {
        const cases = await ClientManager.findAll();
        return res.status(200).json({
            message: 'All cases retrieved successfully',
            data: cases,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving case uploads',
            error: error.message,
        });
    }
};

// Get a single case upload by ID
exports.getClientManagerById = async (req, res) => {
    const { id } = req.params;
    try {
        const ClientManager = await ClientManager.findByPk(id);
        if (!ClientManager) {
            return res.status(404).json({
                message: 'Case upload not found',
            });
        }
        return res.status(200).json({
            message: 'Case retrieved successfully',
            data: ClientManager,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving case upload',
            error: error.message,
        });
    }
};

// Update a case upload by ID
exports.updateClientManager = async (req, res) => {
    const { id } = req.params;
    try {
        const ClientManager = await ClientManager.findByPk(id);
        if (!ClientManager) {
            return res.status(404).json({
                message: 'Case upload not found',
            });
        }
        await ClientManager.update(req.body);
        return res.status(200).json({
            message: 'Case updated successfully',
            data: ClientManager,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating case upload',
            error: error.message,
        });
    }
};

// Delete a case upload by ID
exports.deleteClientManager = async (req, res) => {
    const { id } = req.params;
    try {
        const ClientManager = await ClientManager.findByPk(id);
        if (!ClientManager) {
            return res.status(404).json({
                message: 'Case upload not found',
            });
        }
        await ClientManager.destroy();
        return res.status(200).json({
            message: 'Case deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting case upload',
            error: error.message,
        });
    }
};
