const CandidateManager = require('../models/CandidateManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const nodemailer = require('nodemailer');
const Service = require('../models/Service');

exports.createcandidatemanager = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        console.log("Authorization token:", token);
        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const jwtToken = token.split(' ')[1];
        console.log("JWT Token:", jwtToken);
        let decodedToken;
        try {
            decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
            console.log("Decoded Token:", decodedToken);
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

        const { applicantName, organizationName, MobileNumber, emailId, employeeId, services } = req.body;
        console.log("req.body:", req.body);

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
        console.log("New Case created:", newCase);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'yashikawebstep@gmail.com',
                pass: 'tnudhsdgcwkknraw'
            },
        });
        console.log("Email transporter set up");

        // Main email to candidate
        const mainMailOptions = {
            from: 'yashikawebstep@gmail.com',
            to: emailId,
            subject: `Online Background Verification Form ${applicantName} (${organizationName}) `,
            html: `
            <p>Hi ${candidateName.toUpperCase()},</p><br>
            <p>Greetings from ScreeningStar!!</p><br>
            <p>Please click the following link to fill out the BGV form that has been initiated as part of the Employee Background Verification process.</p>
            <p>
                <a href="https://screeningstar.onrender.com/Screeningstar/candidate-portal?client_id=${clientId}&cid=${newCase.id}&bymail=true">
                   https://screeningstar.onrender.com/Screeningstar/candidate-portal?client_id=${clientId}&cid=${newCase.id}&bymail=true
                </a>
            </p>
            <p>Please find the attached checklist and provide the supporting documents accordingly.</p>
            <p>If you have any questions or need any support, kindly respond by email. If you need any assistance, you may also call us at 8148750989. We will be happy to help you.</p>
            <p style="margin: 0; padding: 0;">Regards,</p>
            <p style="margin: 0; padding: 0;">Team-Track Master</p>
            <p style="margin: 0; padding: 0;">ScreeningStar Solutions Pvt Ltd</p>
        `,
        attachments: [
            {
                filename: 'document_checklist.pdf',
                path: path.join(__dirname, '../pdf', 'document_checklist.pdf'), 
                contentType: 'application/pdf'
            }
        ]
    };
        console.log("Main mail options:", mainMailOptions);

        transporter.sendMail(mainMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending main email to candidate:', error);
            } else {
                console.log('Main email sent successfully:', info.response);
            }
        });

        // Check for serviceId 43 in Service model and send additional email if it exists
        const hasServiceId43 = await Service.findOne({
            where: {
                id: 43,
            },
        });

        if (hasServiceId43 && services.some(service => service.serviceId === 43)) {
            const additionalMailOptions = {
                from: 'yashikawebstep@gmail.com',
                to: emailId,
                subject: `Action Required: Digital Address Verification`,
                text: `Dear Candidate (MISS YASHIKA),\n\nGreetings from Screening Star !!\n\nKindly complete the digital address verification process initiated by YASHIKA as part of Employee Background Verification process, by accessing the following link.\n\nCLICK HERE\n\nThanks for your cooperation and wishing you a good luck for your Job opportunity.\n\nFeel free to contact us for any clarification by reaching 81487 50989. I'll be glad to assist.\n\nWarm Regards,\nDigital Address Team`
            };
            console.log("Additional mail options for serviceId 43:", additionalMailOptions);

            transporter.sendMail(additionalMailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending additional email for serviceId 43:', error);
                } else {
                    console.log('Additional email sent successfully for serviceId 43:', info.response);
                }
            });
        }

        console.log("Returning success response");
        return res.status(201).json({
            message: 'Case uploaded successfully and emails sent',
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

const DigitalAV = require('../models/DigitalAV');

// CREATE DigitalAV
exports.createDigitalAV = async (req, res) => {
    try {
        const digitalAV = await DigitalAV.create(req.body);
        res.status(201).json(digitalAV);
    } catch (error) {
        res.status(500).json({ message: 'Error creating DigitalAV', error: error.message });
    }
};

// READ All DigitalAV records
exports.getAllDigitalAV = async (req, res) => {
    try {
        const digitalAVs = await DigitalAV.findAll();
        res.status(200).json(digitalAVs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching DigitalAVs', error: error.message });
    }
};

// READ Single DigitalAV record
exports.getDigitalAVById = async (req, res) => {
    try {
        const digitalAV = await DigitalAV.findByPk(req.params.id);
        if (digitalAV) {
            res.status(200).json(digitalAV);
        } else {
            res.status(404).json({ message: 'DigitalAV not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching DigitalAV', error: error.message });
    }
};

// UPDATE DigitalAV record
exports.updateDigitalAV = async (req, res) => {
    try {
        const digitalAV = await DigitalAV.findByPk(req.params.id);
        if (digitalAV) {
            await digitalAV.update(req.body);
            res.status(200).json(digitalAV);
        } else {
            res.status(404).json({ message: 'DigitalAV not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating DigitalAV', error: error.message });
    }
};

// DELETE DigitalAV record
exports.deleteDigitalAV = async (req, res) => {
    try {
        const digitalAV = await DigitalAV.findByPk(req.params.id);
        if (digitalAV) {
            await digitalAV.destroy();
            res.status(204).json({ message: 'DigitalAV deleted successfully' });
        } else {
            res.status(404).json({ message: 'DigitalAV not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting DigitalAV', error: error.message });
    }
};
