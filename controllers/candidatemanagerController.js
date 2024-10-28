const CandidateManager = require('../models/CandidateManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const nodemailer = require('nodemailer');

exports.createcandidatemanager = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const jwtToken = token.split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }

        const { user_id, clientId, branchId } = decodedToken;
        if (!user_id || !clientId || !branchId) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        const { applicantName, organizationName, MobileNumber, emailId, employeeId, services } = req.body;

        const newCase = await CandidateManager.create({
            user_id,
            clientId,
            branchId,
            applicantName,
            organizationName,
            MobileNumber,
            emailId,
            employeeId,
            services,
        });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'yashikawebstep@gmail.com',
            to: emailId,
            subject: `Welcome, ${applicantName}`,
            text: `Hi ${applicantName},\n\nGreetings from ScreeningStar!!\n\nPlease click the following link to fill out the BGV form that has been initiated as part of the Employee Background Verification process.\n\nhttp://screeningstar.in/candidate-portal.php?client_id=${clientId}&cid=${branchId}&bymail=true\n\nPlease find the attached checklist and provide the supporting documents accordingly.\n\nIf you have any questions or need any support, kindly respond by email. If you need any assistance, you may also call us at 8148750989. We will be happy to help you.\n\nRegards,\n\nTeam-Track Master\nScreeningStar Solutions Pvt Ltd`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to candidate:', error);
            } else {
                console.log('Email sent successfully: ' + info.response);
            }
        });

        return res.status(201).json({
            message: 'Case uploaded successfully and email sent',
            data: newCase,
        });
    } catch (error) {
        console.error('Error creating candidate manager case:', error);
        return res.status(500).json({
            message: 'Error creating case upload',
            error: error.message,
        });
    }
};

exports.getAllCandidateManagers = async (req, res) => {
    try {
        const cases = await CandidateManager.findAll();
        return res.status(200).json({
            message: 'All Candidate Managers retrieved successfully',
            data: cases,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving case uploads',
            error: error.message,
        });
    }
};

exports.getCandidateManagerById = async (req, res) => {
    const { id } = req.params;
    try {
        const getCandidateManager = await CandidateManager.findByPk(id);
        if (!getCandidateManager) {
            return res.status(404).json({
                message: 'Candidate Manager not found',
            });
        }
        return res.status(200).json({
            message: 'Candidate Manager retrieved successfully',
            data: getCandidateManager,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving Candidate Manager',
            error: error.message,
        });
    }
};

exports.updateCandidateManager = async (req, res) => {
    const { id } = req.params;
    try {
        const updateCandidateManager = await CandidateManager.findByPk(id);
        if (!updateCandidateManager) {
            return res.status(404).json({
                message: 'Candidate Manager not found',
            });
        }
        await updateCandidateManager.update(req.body);
        return res.status(200).json({
            message: 'Candidate Manager updated successfully',
            data: updateCandidateManager,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating Candidate Manager',
            error: error.message,
        });
    }
};

exports.deleteCandidateManager = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCandidateManager = await CandidateManager.findByPk(id);
        if (!deleteCandidateManager) {
            return res.status(404).json({
                message: 'Candidate Manager not found',
            });
        }
        await deleteCandidateManager.destroy();
        return res.status(200).json({
            message: 'Candidate Manager deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting Candidate Manager',
            error: error.message,
        });
    }
};
