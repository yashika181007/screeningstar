const ClientManager = require('../models/ClientManager');
const Branch = require('../models/Branch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { Sequelize, Op } = require('sequelize');
// const { v4: uuidv4 } = require('uuid');  
const nodemailer = require('nodemailer'); 

const generateNumericId = () => {
    return Math.floor(10000000 + Math.random() * 90000000);
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

        const existingCase = await ClientManager.findOne({ where: { employeeId } });
        if (existingCase) {
            return res.status(400).json({
                message: `Employee ID '${employeeId}' already exists. Please use a unique Employee ID.`,
            });
        }

        let newApplicationId;
        let isDuplicate;

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

        const newCase = await ClientManager.create({
            ...req.body,
            user_id,
            clientId,
            branchId,
            application_id: newApplicationId,
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
        const applications = await ClientManager.findAll({
            where: { ack_sent: '0' },
            attributes: [
                'clientId',
                'organizationName',
                'branchId',
                'application_id',
                'services',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'applicationCount'],
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'createdAt']
            ],
            group: ['clientId', 'organizationName', 'branchId', 'application_id', 'services', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        const result = applications.reduce((acc, app) => {
            let client = acc.find(c => c.clientId === app.clientId);

            if (!client) {
                client = {
                    clientId: app.clientId,
                    organizationName: app.organizationName,
                    applicationCount: app.applicationCount,
                    applications: []
                };
                acc.push(client);
            }

            client.applications.push({
                branchIds: app.branchId,
                application_id: app.application_id,
                services: app.services,
                createdAt: app.createdAt
            });

            return acc;
        }, []);

        const branchIds = [...new Set(applications.map(app => app.branchId))];

        const branches = await Branch.findAll({
            where: { id: branchIds },
            attributes: ['id', 'branchEmail']
        });

        const branchEmailMap = {};
        branches.forEach(branch => {
            branchEmailMap[branch.id] = branch.branchEmail;
        });

        result.forEach(client => {
            client.applications.forEach(app => {
                app.branchEmail = branchEmailMap[app.branchIds] || null;
            });
        });

        return res.status(200).json({
            message: 'Application counts and branch emails retrieved successfully',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving application counts and branch emails',
            error: error.message,
        });
    }
};
exports.sendacknowledgemail = async (req, res) => {
    try {
        const applications = await ClientManager.findAll({
            where: { ack_sent: '0' },
            attributes: [
                'clientId',
                'organizationName',
                'branchId',
                'application_id',
                'services',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'applicationCount'],
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'createdAt']
            ],
            group: ['clientId', 'organizationName', 'branchId', 'application_id', 'services', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        if (!applications.length) {
            return res.status(200).json({
                message: 'No applications to send emails for.',
            });
        }
        const branchIds = [...new Set(applications.map(app => app.branchId))];
        const branches = await Branch.findAll({
            where: { id: branchIds },
            attributes: ['id', 'branchEmail']
        });

        const branchEmailMap = {};
        branches.forEach(branch => {
            branchEmailMap[branch.id] = branch.branchEmail;
        });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'yashikawebstep@gmail.com',
                pass: 'tnudhsdgcwkknraw'
            },
        });

        const emailPromises = applications.map(async (app) => {
            const branchEmail = branchEmailMap[app.branchId];
            if (branchEmail) {
                const mailOptions = {
                    from: 'yashikawebstep@gmail.com',
                    to: branchEmail,
                    subject: `New Applications Notification for ${app.organizationName}`,
                    text: `
                        Dear ${app.organizationName},

                        Greetings from Screeningstar!

                        We acknowledge receiving the cases listed below. Please locate the reference ID for any upcoming communications. Checks will be processed, and if there are any insufficiencies, we will get back to you.

                        SL\tReference ID\tClient Code\tCandidate Name\tServices
                        1\t${app.application_id}\t${app.clientId}\t${app.organizationName}\t${app.services}

                        Regards
                        Team - Track Master (Tool)
                        ScreeningStar Solutions Pvt Ltd
                        `
                };

                return transporter.sendMail(mailOptions)
                    .then(info => {
                        console.log('Email sent to: ' + branchEmail + ' - ' + info.response);
                    })
                    .catch(error => {
                        console.error('Error sending email to ' + branchEmail + ':', error);
                    });
            }
        });

        await Promise.all(emailPromises);

        await ClientManager.update(
            { ack_sent: '1' }, 
            { where: { ack_sent: '0', application_id: applications.map(app => app.application_id) } }
        );

        return res.status(200).json({
            message: 'Emails sent successfully and acknowledgment updated.',
        });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({
            message: 'Error sending emails to branches',
            error: error.message,
        });
    }
};
