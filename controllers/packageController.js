const package = require('../models/Package');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createpackage = async (req, res) => {
    try {
        const { packageName, packageDescription } = req.body;
        console.log('req.body', req.body);

        const token = req.session.token;

        if (!token) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user_id = decoded.id;
        console.log('user_id', user_id);

        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }

        if (!packageName || !packageDescription) {
            return res.status(400).json({ message: 'Package name and description are required' });
        }

        const newpackage = await package.create({
            user_id,
            packageName,
            packageDescription
        });

        console.log('newpackage', newpackage);
        res.status(201).json({ message: 'Package created successfully', package: newpackage });
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ message: 'Error creating package', error: error.message });
    }
};

exports.getAllpackages = async (req, res) => {
    try {
        const packages = await package.findAll();
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
};

exports.getpackageById = async (req, res) => {
    try {
        const packages = await package.findByPk(req.params.id);
        
        if (!packages) {
            return res.status(404).json({ message: 'packages not found' });   
        }

        res.status(200).json(packages);
        
    } catch (err) {
        console.error('Error fetching packages:', err);
        res.status(500).json({ message: 'Error fetching packages', error: err.message });
    }
};

exports.updatepackage = async (req, res) => { 
    const { packageName, packageDescription } = req.body;

    try {
        const foundPackage = await package.findByPk(req.params.id);
        if (!foundPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        foundPackage.packageName = packageName || foundPackage.packageName;
        foundPackage.packageDescription = packageDescription || foundPackage.packageDescription;

        await foundPackage.save();
        res.status(200).json({ message: 'Package updated successfully', package: foundPackage });

    } catch (error) {
        console.error('Error updating package:', error);
        return res.status(500).json({ message: 'Error updating package', error: error.message });
    }
};

exports.deletepackage = async (req, res) => {
    const { id } = req.params;

    try {
        const foundPackage = await package.findOne({ where: { id } });

        if (!foundPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        await foundPackage.destroy(); 

        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ message: 'Error deleting package', error: error.message });
    }
};
