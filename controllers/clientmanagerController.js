const ClientManager = require('../models/ClientManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { Sequelize, Op } = require('sequelize');

exports.createClientManager = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        console.log('Token:', token);

        if (!token) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const tokenParts = token.split(' ');
        const jwtToken = tokenParts[1];
        console.log('JWT Token:', jwtToken);

        let decodedToken;
        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
            console.log('Decoded Token:', decodedToken);
        } catch (err) {
            console.error('Invalid token:', err);
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const user_id = decodedToken.user_id;
        const clientId = decodedToken.clientId;
        const branchId = decodedToken.id;
        console.log('User ID:', user_id);
        console.log('Client ID:', clientId);
        console.log('Branch ID:', branchId);

        if (!user_id || !clientId || !branchId) {
            console.error('User authentication failed.');
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        const { employeeId } = req.body;
        console.log('Employee ID:', employeeId);

        const existingCase = await ClientManager.findOne({
            where: {
                [Sequelize.Op.or]: [{ employeeId: employeeId }],
            },
        });
        console.log('Existing Case:', existingCase);

        if (existingCase) {
            console.log(`Duplicate Employee ID '${employeeId}' detected.`);
            return res.status(400).json({
                message: `Employee ID '${employeeId}' already exists. Please use a unique Employee ID.`,
            });
        }

        // Find the latest application ID for this client to generate the next one
        const latestCase = await ClientManager.findOne({
            where: { clientId: clientId },
            order: [['createdAt', 'DESC']],
        });
        console.log('Latest Case:', latestCase);

        let newApplicationId;
        if (latestCase) {
            const latestApplicationId = latestCase.application_id;
            console.log('Latest Application ID:', latestApplicationId);

            // Split the application_id by '-' and increment the number
            const idParts = latestApplicationId.split('-');
            if (idParts.length > 1 && !isNaN(idParts[1])) {
                const nextIdNumber = parseInt(idParts[1], 10) + 1;
                newApplicationId = `${clientId}-${nextIdNumber}`;
            } else {
                // If parsing fails, set it to 1
                newApplicationId = `${clientId}-1`;
            }
        } else {
            // If no case is found, start from 1
            newApplicationId = `${clientId}-1`;
        }
        console.log('New Application ID:', newApplicationId);

        // Check if the new application_id already exists
        const duplicateApplication = await ClientManager.findOne({
            where: {
                application_id: newApplicationId
            }
        });
        if (duplicateApplication) {
            console.log(`Duplicate Application ID '${newApplicationId}' detected.`);
            return res.status(400).json({
                message: `Application ID '${newApplicationId}' already exists. Please use a unique Application ID.`,
            });
        }

        // Create the new case
        const newCase = await ClientManager.create({
            ...req.body,
            user_id,
            clientId,
            branchId,
            application_id: newApplicationId, // Use the generated application ID
        });
        console.log('New Case Created:', newCase);

        return res.status(201).json({
            message: 'Case uploaded successfully',
            data: newCase,
        });
    } catch (error) {
        console.error('Error creating case upload:', error.message);
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
