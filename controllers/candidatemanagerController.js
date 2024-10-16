const CandidateManager = require('../models/CandidateManager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createcandidatemanager = async (req, res) => {
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
        const branchId  = decodedToken.id;
        console.log('User ID:', user_id);
        console.log('Client ID:', clientId);
        console.log('branchId:', branchId);;

        if (!user_id || !clientId ||!branchId) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        const newCase = await CandidateManager.create({
            ...req.body,
            user_id,
            clientId,
            branchId,
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
