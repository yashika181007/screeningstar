const Service = require('../models/Service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createService = async (req, res) => {
    try {
        const { serviceName, serviceDescription } = req.body;
        const user_id = 1;
        console.log('user_id',user_id)

        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }
        const newService = await Service.create({
            user_id,
            serviceName,
            serviceDescription
        });

        res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
        res.status(500).json({ message: 'Error creating service', error: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll({
            include: [{ model: Users, as: 'User' }] 
        });

        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

exports.getServiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Service.findOne({
            where: { id },
            include: [{ model: Users, as: 'User' }]
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service', error: error.message });
    }
};

exports.updateService = async (req, res) => {
    const { id } = req.params;
    const { user_id, serviceName, serviceDescription } = req.body;

    try {
        const service = await Service.findOne({ where: { id } });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.user_id = user_id || service.user_id; 
        service.serviceName = serviceName || service.serviceName;
        service.serviceDescription = serviceDescription || service.serviceDescription;

        await service.save();

        res.status(200).json({ message: 'Service updated successfully', service });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service', error: error.message });
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
