const Service = require('../models/Service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const Service = require('../models/Service');
const jwt = require('jsonwebtoken');

exports.createService = async (req, res) => {
    try {
        const { serviceName, serviceDescription } = req.body;

        const token = req.headers['authorization'];
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
        const user_id = decodedToken.id;
        const role = decodedToken.role;
      
        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        if (!serviceName || !serviceDescription) {
            return res.status(400).json({ message: 'Service name and description are required.' });
        }

        const newService = await Service.create({
            user_id,
            serviceName,
            serviceDescription
        });

        res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service', error: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const services = await Service.findByPk(req.params.id);
        
        if (!services) {
            return res.status(404).json({ message: 'services not found' });   
        }

        res.status(200).json(services);
        
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ message: 'Error fetching services', error: err.message });
    }
};

exports.updateService = async (req, res) => {
    const { serviceName, serviceDescription } = req.body;

    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        service.serviceName = serviceName || service.serviceName;
        service.serviceDescription = serviceDescription || service.serviceDescription;

        await service.save();
        res.status(200).json({ message: 'Service updated successfully', service });

    } catch (error) {
        console.error('Error updating service:', error);
        return res.status(500).json({ message: 'Error updating service', error: error.message });
    }
};

exports.deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Service.findOne({ where: { id } });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        await service.destroy(); 

        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error: error.message });
    }
};
