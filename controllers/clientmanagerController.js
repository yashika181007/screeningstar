const ClientManager = require('../models/ClientManager');  // Import the ClientManager model

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

exports.getAllClientManagers = async (req, res) => {
    try {
        const cases = await ClientManager.findAll();
        return res.status(200).json({
            message: 'All Client Managers retrieved successfully',
            data: cases,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving case uploads',
            error: error.message,
        });
    }
};

exports.getClientManagerById = async (req, res) => {
    const { id } = req.params;
    try {
        const clientManager = await ClientManager.findByPk(id);  // Changed variable name to `clientManager`
        if (!clientManager) {
            return res.status(404).json({
                message: 'Client Manager not found',
            });
        }
        return res.status(200).json({
            message: 'Client Manager retrieved successfully',
            data: clientManager,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving Client Manager',
            error: error.message,
        });
    }
};

exports.updateClientManager = async (req, res) => {
    const { id } = req.params;
    try {
        const clientManager = await ClientManager.findByPk(id);  // Changed variable name to `clientManager`
        if (!clientManager) {
            return res.status(404).json({
                message: 'Client Manager not found',
            });
        }
        await clientManager.update(req.body);
        return res.status(200).json({
            message: 'Client Manager updated successfully',
            data: clientManager,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating Client Manager',
            error: error.message,
        });
    }
};

exports.deleteClientManager = async (req, res) => {
    const { id } = req.params;
    try {
        const clientManager = await ClientManager.findByPk(id);  
        if (!clientManager) {
            return res.status(404).json({
                message: 'Client Manager not found',
            });
        }
        await clientManager.destroy();
        return res.status(200).json({
            message: 'Client Manager deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting Client Manager',
            error: error.message,
        });
    }
};
