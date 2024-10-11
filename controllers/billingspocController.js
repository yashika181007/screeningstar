const BillingSpoc = require('../models/BillingSpoc'); 
const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createBillingSpoc = async (req, res) => {
  try {
    const token = req.headers['authorization'];
    console.log('token', req.headers['authorization']);
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
    if (!user_id) {
        return res.status(401).json({ message: 'User not authenticated. Please log in.' });
    }
      const { spocName, designation, contactNumber, emailId} = req.body;
      console.log('req.body', req.body);
      const newBillingSpoc = await BillingSpoc.create({
          user_id,
          spocName,
          designation,
          contactNumber,
          emailId,
         
      });

      res.status(201).json({ message: 'Escalation Manager created successfully', BillingSpoc: newBillingSpoc });
      console.log('newBillingSpoc', newBillingSpoc);
  } catch (error) {
      console.error('Error creating BillingSpoc:', error);
      res.status(500).json({ message: 'Error creating Escalation Manager', error: error.message });
  }
};

exports.getAllBillingSpoc = async (req, res) => {
    try {
        const BillingSpocs = await BillingSpoc.findAll();
   
        res.status(200).json(BillingSpocs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getallBillingSpocById = async (req, res) => {
    try {
        const { id } = req.params;

        const billingSpocRecord = await BillingSpoc.findByPk(id);

        if (!billingSpocRecord) {
            return res.status(404).json({ error: 'Escalation Manager not found' });
        }
        
        res.status(200).json(billingSpocRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBillingSpoc = async (req, res) => {
    try {
        const { id } = req.params;
        const { spocName, designation, contactNumber, emailId } = req.body;
        
        const billingSpocRecord = await BillingSpoc.findByPk(id);
        
        if (!billingSpocRecord) {
            return res.status(404).json({ error: 'Billing SPOC not found' });
        }
        
        billingSpocRecord.spocName = spocName;
        billingSpocRecord.designation = designation;
        billingSpocRecord.contactNumber = contactNumber;
        billingSpocRecord.emailId = emailId;
  
        await billingSpocRecord.save();
        
        res.status(200).json(billingSpocRecord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteBillingSpoc = async (req, res) => {
    try {
        const { id } = req.params;
        const billingSpocRecord = await BillingSpoc.findByPk(id);
        
        if (!billingSpocRecord) {
            return res.status(404).json({ error: 'Billing SPOC not found' });
        } 
        await billingSpocRecord.destroy();
        res.status(200).json({ message: 'Billing SPOC deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
