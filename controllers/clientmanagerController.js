const ClientManager = require('../models/ClientManager');
const Branch = require('../models/Branch');
const Client = require('../models/Client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { Sequelize, Op } = require('sequelize');
// const { v4: uuidv4 } = require('uuid');  
const nodemailer = require('nodemailer');
const express = require('express');
const session = require('express-session');

const generateNumericId = () => {
    return Math.floor(10000000 + Math.random() * 90000000);
};

exports.createClientManager = async (req, res) => {
    try {
        console.log("Request received:", req.body);

        const token = req.headers['authorization'];
        console.log("Authorization header:", token);

        if (!token) {
            console.log("No token provided.");
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const tokenParts = token.split(' ');
        console.log("Token parts:", tokenParts);

        if (tokenParts.length !== 2) {
            console.log("Invalid token format.");
            return res.status(401).json({ message: 'Invalid token format. Please log in.' });
        }

        const jwtToken = tokenParts[1];
        console.log("JWT token extracted:", jwtToken);
        let decodedToken;

        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
            console.log("Decoded token:", decodedToken);
        } catch (err) {
            console.log("Invalid token:", err);
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const { user_id, clientId, id: branchId } = decodedToken;
        console.log("Extracted values from token - user_id:", user_id, "clientId:", clientId, "branchId:", branchId);

        if (!user_id || !clientId || !branchId) {
            console.log("User not authenticated.");
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        let newApplicationId;
        let isDuplicate;

        do {
            newApplicationId = generateNumericId();
            console.log("Generated application ID:", newApplicationId);

            const duplicateApplication = await ClientManager.findOne({ where: { application_id: newApplicationId } });
            isDuplicate = !!duplicateApplication;

            console.log("Is duplicate application:", isDuplicate);

            if (isDuplicate) {
                console.log("Duplicate application ID detected.");
                return res.status(400).json({
                    message: 'Duplicate application ID detected. Please try again.',
                });
            }
        } while (isDuplicate);

        console.log("No duplicate found, proceeding to create a new case.");

        const newCase = await ClientManager.create({
            ...req.body,
            user_id,
            clientId,
            branchId,
            application_id: newApplicationId,
        });
        console.log("Incoming request body:", req.body);

        console.log("New case created successfully:", newCase);

        return res.status(201).json({
            message: 'Case uploaded successfully',
            data: newCase,
        });
    } catch (error) {
        console.error("Error creating case upload:", error);
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
                user: 'ychanalia@gmail.com',
                pass: 'tefjpevodsanujgo'
            },
        });

        const emailPromises = applications.map(async (app) => {
            const branchEmail = branchEmailMap[app.branchId];
            if (branchEmail) {
                let services;
                try {
                    services = JSON.parse(app.services);
                } catch (error) {
                    console.error('Error parsing services JSON:', error);
                    services = {};
                }
                const serviceTitles = Object.values(services).map(service => service.serviceTitle).join(', '); // Join titles as a string

                console.log('Parsed Services:', services);
                console.log('Service Titles:', serviceTitles);

                const mailOptions = {
                    from: 'ychanalia@gmail.com',
                    to: branchEmail,
                    subject: `New Applications Notification for ${app.organizationName}`,
                    text: `
                        Dear ${app.organizationName},

                        Greetings from Screeningstar!

                        We acknowledge receiving the cases listed below. Please locate the reference ID for any upcoming communications. Checks will be processed, and if there are any insufficiencies, we will get back to you.

                        SL\tReference ID\tClient Code\tCandidate Name\tServices
                        1\t${app.application_id}\t${app.clientId}\t${app.organizationName}\t${serviceTitles}

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
exports.getClientBranchData = async (req, res) => {
    try {
        const { clientId, branchId } = req.params;
        console.log('getbranchId', branchId);
        console.log('getclientId', clientId);

        const clientManagerData = await ClientManager.findAll({
            where: { clientId, branchId }
        });

        if (!clientManagerData.length) {
            return res.status(200).json({
                message: 'No data available in ClientManager for the given clientId and branchId.'
            });
        }

        const branchIds = [...new Set(clientManagerData.map(item => item.branchId))];
        const clientIds = [...new Set(clientManagerData.map(item => item.clientId))];

        const branches = await Branch.findAll({
            where: {
                id: branchIds,
                clientId: clientIds
            }
        });

        const clients = await Client.findAll({
            where: { clientId: clientIds }
        });

        const branchMap = {};
        branches.forEach(branch => {
            branchMap[branch.id] = branch.get();
        });

        const clientMap = {};
        clients.forEach(client => {
            clientMap[client.clientId] = client.get();
        });

        const result = clientManagerData.map(item => {
            const branchData = branchMap[item.branchId] || {};
            const clientData = clientMap[item.clientId] || {};
            return {
                ...item.get(),
                branchData,
                clientData
            };
        });

        return res.status(200).json({
            message: 'Data fetched successfully',
            data: result
        });

    } catch (error) {
        console.error('Error fetching client, branch, and client manager data:', error);
        return res.status(500).json({
            message: 'Error fetching data',
            error: error.message
        });
    }
};

// exports.getClientManagerByAppID = async (req, res) => {
//     const { application_id } = req.body;

//     try {
//         const getClientManager = await ClientManager.findAll({
//             where: { application_id }
//         });
//         if (!getClientManager) {
//             return res.status(404).json({
//                 message: 'Client Manager not found for the given application ID',
//             });
//         }
//         return res.status(200).json({
//             message: 'Client Manager retrieved successfully',
//             data: getClientManager,
//         });

//     } catch (error) {
//         console.error("Error retrieving Client Manager:", error);
//         return res.status(500).json({
//             message: 'Error retrieving Client Manager',
//             error: error.message,
//         });
//     }
// };

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

exports.getClientManagerByAppID = async (req, res) => {
    const { application_id } = req.body;
    console.log('application_id:', req.body);

    try {
        const getClientManager = await ClientManager.findAll({
            where: { application_id }
        });

        if (!getClientManager || getClientManager.length === 0) {
            return res.status(404).json({
                message: 'Client Manager not found for the given application ID',
            });
        }

        const clientManagerData = getClientManager[0];
        const services = JSON.parse(clientManagerData.services);
        const serviceIds = Object.keys(services).map(key => services[key].serviceId);

        const serviceIdsString = serviceIds.join(',');
        const query = `
            SELECT service_id, formjson 
            FROM report_forms 
            WHERE service_id IN (${serviceIdsString})
        `;
        const [reportForms] = await sequelize.query(query);

        const formJsonMap = {};
        reportForms.forEach(form => {
            formJsonMap[form.service_id] = form.formjson;
        });

        const enrichedServices = Object.keys(services).reduce((acc, key) => {
            const service = services[key];
            const serviceId = service.serviceId;
            acc[key] = {
                ...service,
                formjson: formJsonMap[serviceId] ? JSON.parse(formJsonMap[serviceId]) : null
            };
            return acc;
        }, {});

        const result = {
            ...clientManagerData.get(),
            services: enrichedServices
        };

        // Check and create tables dynamically based on formjson
        const queryInterface = sequelize.getQueryInterface();

        for (const key in enrichedServices) {
            const formjson = enrichedServices[key].formjson;

            if (formjson && formjson.db_table) {
                const tableName = formjson.db_table;

                // Check if table already exists
                const tableExists = await queryInterface.tableExists(tableName);

                if (!tableExists) {
                    console.log(`Creating table ${tableName} as it does not exist.`);

                    // Define columns based on formjson structure and add standard fields
                    const columns = {
                        id: {
                            type: Sequelize.INTEGER,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        clientId: {
                            type: Sequelize.STRING,
                            allowNull: false
                        },
                        branchId: {
                            type: Sequelize.STRING,
                            allowNull: false
                        },
                        application_id: {
                            type: Sequelize.STRING,
                            allowNull: false
                        },
                        ...formjson.rows.reduce((acc, row) => {
                            row.inputs.forEach(input => {
                                acc[input.name] = {
                                    type: Sequelize.STRING, // Adjust type if necessary
                                    allowNull: true
                                };
                            });
                            return acc;
                        }, {}),
                        createdAt: {
                            type: Sequelize.DATE,
                            allowNull: false,
                            defaultValue: Sequelize.NOW
                        },
                        updatedAt: {
                            type: Sequelize.DATE,
                            allowNull: false,
                            defaultValue: Sequelize.NOW
                        }
                    };

                    // Create table
                    await queryInterface.createTable(tableName, columns);
                    console.log(`Table ${tableName} created successfully with additional fields.`);
                } else {
                    console.log(`Table ${tableName} already exists. Skipping creation.`);
                }
            }
        }

        return res.status(200).json({
            message: 'Client Manager retrieved successfully',
            data: result,
        });

    } catch (error) {
        console.error("Error retrieving Client Manager:", error);
        return res.status(500).json({
            message: 'Error retrieving Client Manager',
            error: error.message,
        });
    }
};