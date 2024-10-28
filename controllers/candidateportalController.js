const CandidatePortal = require('../models/CandidatePortal');

exports.createCandidatePortal = async (req, res) => {
    try {        
        const { 
            user_id,
            clientId,
            branchId,
            candidate_id,
            formjson
        } = req.body;

        const newReport = await CandidatePortal.create({
            user_id,
            clientId,
            branchId,
            candidate_id,
            formjson,
        });

        return res.status(201).json({
            message: 'CandidatePortal created successfully',
            data: newReport,
        });
    } catch (error) {
        console.error('Error creating CandidatePortal:', error);
        return res.status(500).json({ message: 'Error creating report', error: error.message });
    }
};

exports.getAllCandidatePortals = async (req, res) => {
    try {
        const reports = await CandidatePortal.findAll();
        return res.status(200).json({
            message: 'Reports retrieved successfully',
            data: reports,
        });
    } catch (error) {
        console.error('Error retrieving reports:', error);
        return res.status(500).json({ message: 'Error retrieving reports', error: error.message });
    }
};

exports.getCandidatePortalById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await CandidatePortal.findByPk(id);

        if (!report) {
            return res.status(404).json({
                message: 'Report not found',
            });
        }

        return res.status(200).json({
            message: 'Report retrieved successfully',
            data: report,
        });
    } catch (error) {
        console.error('Error retrieving report:', error);
        return res.status(500).json({ message: 'Error retrieving report', error: error.message });
    }
};

exports.updateCandidatePortal = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, serviceid, formjson } = req.body;

        const report = await CandidatePortal.findByPk(id);

        if (!report) {
            return res.status(404).json({
                message: 'Report not found',
            });
        }

        report.user_id = user_id || report.user_id;
        report.serviceid = serviceid || report.serviceid;
        report.formjson = formjson || report.formjson;

        await report.save();

        return res.status(200).json({
            message: 'Report updated successfully',
            data: report,
        });
    } catch (error) {
        console.error('Error updating report:', error);
        return res.status(500).json({ message: 'Error updating report', error: error.message });
    }
};

exports.deleteCandidatePortal = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await CandidatePortal.findByPk(id);

        if (!report) {
            return res.status(404).json({
                message: 'Report not found',
            });
        }

        await report.destroy();

        return res.status(200).json({
            message: 'Report deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        return res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
};
