const package = require('../models/Package');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createpackage = async (req, res) => {
    try {
        const { packageName, packageDescription } = req.body;
        const user_id = 1;
        console.log('user_id',user_id)

        if (!user_id) {
            return res.status(401).json({ message: 'User not authenticated. Please log in.' });
        }
        if(!packageName || !packageDescription){
            console.log('Empty feilds');
        }
        const newpackage = await package.create({
            user_id,
            packageName,
            packageDescription
        });
console.log('newpackage',newpackage);
        res.status(201).json({ message: 'package created successfully', package: newpackage });
    } catch (error) {
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
        const package = await package.findByPk(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'package not found' });
        }
        package.packageName = packageName || package.packageName;
        package.packageDescription = packageDescription || package.packageDescription;

        await package.save();
        res.status(200).json({ message: 'package updated successfully', package });

    } catch (error) {
        console.error('Error updating package:', error);
        return res.status(500).json({ message: 'Error updating package', error: error.message });
    }
};

exports.deletepackage = async (req, res) => {
    const { id } = req.params;

    try {
        const package = await package.findOne({ where: { id } });

        if (!package) {
            return res.status(404).json({ message: 'package not found' });
        }

        await package.destroy(); 

        res.status(200).json({ message: 'package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting package', error: error.message });
    }
};
