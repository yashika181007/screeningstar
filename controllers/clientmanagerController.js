const ClientManager = require('../models/ClientManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { Sequelize, Op } = require('sequelize');
// const { v4: uuidv4 } = require('uuid');  

// Helper function to generate an 8-digit numeric ID
const generateNumericId = () => {
    return Math.floor(10000000 + Math.random() * 90000000);  // Generates a random 8-digit number
};

exports.createClientManager = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const tokenParts = token.split(' ');
        if (tokenParts.length !== 2) {
            return res.status(401).json({ message: 'Invalid token format. Please log in.' });
        }

        const jwtToken = tokenParts[1];
        let decodedToken;

        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const { user_id, clientId, id: branchId } = decodedToken; // Destructuring
        if (!user_id || !clientId || !branchId) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        const { employeeId } = req.body;
        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required.' });
        }

        // Check if employee ID already exists
        const existingCase = await ClientManager.findOne({ where: { employeeId } });
        if (existingCase) {
            return res.status(400).json({
                message: `Employee ID '${employeeId}' already exists. Please use a unique Employee ID.`,
            });
        }

        let newApplicationId;
        let isDuplicate;

        // Generate unique 8-digit numeric application ID
        do {
            newApplicationId = generateNumericId();
            const duplicateApplication = await ClientManager.findOne({ where: { application_id: newApplicationId } });
            isDuplicate = !!duplicateApplication;

            if (isDuplicate) {
                return res.status(400).json({
                    message: 'Duplicate application ID detected. Please try again.',
                });
            }
        } while (isDuplicate);

        // Create the new case
        const newCase = await ClientManager.create({
            ...req.body,
            user_id,
            clientId,
            branchId,
            application_id: newApplicationId,  // Use generated 8-digit numeric ID
        });

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

// exports.getClientApplicationCounts = async (req, res) => {
//     try {
//         const applicationCounts = await ClientManager.findAll({
//             where: {
//                 ack_sent: '0' 
//             },
//             attributes: [
//                 'clientId', 
//                 'organizationName', 
//                 [Sequelize.fn('COUNT', Sequelize.col('id')), 'applicationCount'],
//                 [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'createdAt']  
//             ],
//             group: ['clientId', 'organizationName'],
//             order: [['createdAt', 'ASC']] 
//         });

//         return res.status(200).json({
//             message: 'Application counts retrieved successfully',
//             data: applicationCounts,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Error retrieving application counts',
//             error: error.message,
//         });
//     }
// };
exports.getClientApplicationCounts = async (req, res) => {
    try {
        const applicationCounts = await ClientManager.findAll({
            where: {
                ack_sent: '0' 
            },
            attributes: [
                'clientId', 
                'organizationName', 
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'applicationCount'],  // Count the number of applications
                [Sequelize.fn('GROUP_CONCAT', Sequelize.literal('DISTINCT branchId')), 'branchIds'], // Fetch all branchIds as a concatenated string
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'createdAt']  // Only get the date part of createdAt
            ],
            group: ['clientId', 'organizationName'],  // Group by clientId and organizationName only
            order: [['createdAt', 'ASC']]  // Order the results by creation date
        });

        return res.status(200).json({
            message: 'Application counts retrieved successfully',
            data: applicationCounts,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving application counts',
            error: error.message,
        });
    }
};
