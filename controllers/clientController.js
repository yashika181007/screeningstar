const Client = require('../models/Client');
const { clientlogoupload } = require('../config/multer');
const { Op } = require('sequelize');  

exports.getActiveClients = async (req, res) => {
    try {
        const activeclients = await Client.findAll({
            where: { status: 'Active' }
        });
        if (!activeclients.length) {
            res.status(404).json({ message: 'No active clients found' });
             
        }
        res.status(200).json(activeclients);
        
    } catch (err) {
        console.error('Error fetching active clients:', err);
        res.status(500).json({ message: 'Error fetching active clients', error: err.message });
        
    }
};

exports.getInactiveClients = async (req, res) => {
    try {
        const inactive = await Client.findAll({
            where: { status: 'In Active' }
        });
        if (!inactive.length) {
            res.status(404).json({ message: 'No inactive clients found' });
            
        }
        res.status(200).json(inactive);
        
    } catch (err) {
        console.error('Error fetching inactive clients:', err);
        res.status(500).json({ message: 'Error fetching inactive clients', error: err.message });
        
    }
};
