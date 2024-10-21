const ClientManager = require('../models/ClientManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createClientManager = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        console.log('Token:', token);

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

        const user_id = decodedToken.user_id;
        const clientId = decodedToken.clientId;
        const branchId = decodedToken.id;
        console.log('User ID:', user_id);
        console.log('Client ID:', clientId);
        console.log('Branch ID:', branchId);

        if (!user_id || !clientId || !branchId) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }
        const latestCase = await ClientManager.findOne({
            where: {
                clientId: clientId,
            },
            order: [['createdAt', 'DESC']], 
        });

        let newApplicationId;
        if (latestCase) {
            const latestApplicationId = latestCase.application_id;
            const idParts = latestApplicationId.split('-');
            const nextIdNumber = parseInt(idParts[1], 10) + 1;
            newApplicationId = `${clientId}-${nextIdNumber}`;
        } else {
            newApplicationId = `${clientId}-1`;
        }
        const newCase = await ClientManager.create({
            ...req.body,
            user_id,
            clientId,
            branchId,
            application_id: newApplicationId, 
        });

        console.log('req.body', req.body);
        console.log('newCase', newCase);
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
        const getclientManager = await ClientManager.findByPk(id);  
        if (!getclientManager) {
            return res.status(404).json({
                message: 'Client Manager not found',
            });
        }
        return res.status(200).json({
            message: 'Client Manager retrieved successfully',
            data: getclientManager,
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
        const updateclientManager = await ClientManager.findByPk(id);  
        if (!updateclientManager) {
            return res.status(404).json({
                message: 'Client Manager not found',
            });
        }
        await updateclientManager.update(req.body);
        return res.status(200).json({
            message: 'Client Manager updated successfully',
            data: updateclientManager,
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
        const deleteClientManager = await ClientManager.findByPk(id);
        if (!deleteClientManager) {
            return res.status(404).json({
                message: 'Client Manager not found',
            });
        }
        await deleteClientManager.destroy();
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
